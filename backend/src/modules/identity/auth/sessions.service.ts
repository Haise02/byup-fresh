import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly cfg: ConfigService,
  ) {}

  generateRefreshToken(): string {
    return crypto.randomBytes(48).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async create(params: {
    userId: string;
    ipAddress?: string;
    deviceInfo?: Record<string, unknown>;
  }): Promise<{ session: Session; rawToken: string }> {
    const rawToken = this.generateRefreshToken();
    const tokenHash = this.hashToken(rawToken);
    const ttlDays = this.cfg.getOrThrow<number>('refreshTokenTtlDays');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    const session = this.sessionRepo.create({
      userId: params.userId,
      tokenHash,
      ipAddress: params.ipAddress,
      deviceInfo: params.deviceInfo,
      isActive: true,
      expiresAt,
      lastActivityAt: new Date(),
    });

    await this.sessionRepo.save(session);
    return { session, rawToken };
  }

  async findActiveByToken(rawToken: string): Promise<Session | null> {
    const tokenHash = this.hashToken(rawToken);
    const session = await this.sessionRepo.findOne({
      where: { tokenHash, isActive: true },
    });
    if (!session) return null;
    if (session.expiresAt < new Date()) {
      await this.revoke(session.id);
      return null;
    }
    return session;
  }

  async revoke(sessionId: string): Promise<void> {
    await this.sessionRepo.update(sessionId, {
      isActive: false,
      revokedAt: new Date(),
    });
  }

  /**
   * Revoca atomica: marca la sessione come revocata SOLO se era ancora attiva.
   * Ritorna `true` se è stata questa chiamata a revocarla (vince la corsa),
   * `false` se la sessione era già stata revocata da un'altra richiesta.
   *
   * Il WHERE `is_active = true` + il row-lock dell'UPDATE Postgres garantiscono
   * che, fra due refresh simultanei con lo stesso token, uno solo ottenga
   * `affected = 1`. È il fulcro della prevenzione del replay del refresh (B.3).
   */
  async revokeIfActive(sessionId: string): Promise<boolean> {
    const res = await this.sessionRepo.update(
      { id: sessionId, isActive: true },
      { isActive: false, revokedAt: new Date() },
    );
    return (res.affected ?? 0) > 0;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.sessionRepo.update(
      { userId, isActive: true },
      { isActive: false, revokedAt: new Date() },
    );
  }

  async touch(sessionId: string): Promise<void> {
    await this.sessionRepo.update(sessionId, { lastActivityAt: new Date() });
  }

  async listForUser(userId: string): Promise<Session[]> {
    return this.sessionRepo.find({
      where: { userId, isActive: true },
      order: { lastActivityAt: 'DESC' },
    });
  }

  async findById(sessionId: string): Promise<Session | null> {
    return this.sessionRepo.findOne({ where: { id: sessionId } });
  }
}
