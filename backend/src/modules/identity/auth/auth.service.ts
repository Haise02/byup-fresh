import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, QueryFailedError } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import * as crypto from 'crypto';

import { User } from '../entities/user.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { Role, SYSTEM_ROLES, DEFAULT_PERMISSIONS } from '../entities/role.entity';
import { Membership } from '../entities/membership.entity';
import { UserTwoFa } from '../entities/user-2fa.entity';
import { PasswordReset } from '../entities/password-reset.entity';
import { OnboardingProgress } from '../../onboarding/entities/onboarding-progress.entity';
import { SessionsService } from './sessions.service';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { LoginDto } from './dto/login.dto';
import { Enable2faDto } from './dto/enable-2fa.dto';
import { JwtAccessPayload } from './strategies/jwt-access.strategy';

const BCRYPT_ROUNDS = 12;
const PASSWORD_RESET_TTL_MIN = 30;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Membership) private readonly membershipRepo: Repository<Membership>,
    @InjectRepository(UserTwoFa) private readonly twoFaRepo: Repository<UserTwoFa>,
    @InjectRepository(PasswordReset) private readonly passwordResetRepo: Repository<PasswordReset>,
    private readonly sessionsService: SessionsService,
    private readonly jwtService: JwtService,
    private readonly cfg: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Register ───────────────────────────────────────────────────────────────

  async registerStaff(dto: RegisterStaffDto, ip?: string) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email già registrata.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const slug = this.slugify(dto.restaurantName);

    // 1. Crea User + Restaurant + ruoli + membership + progress in transazione.
    //    La sessione viene creata DOPO il commit, perché SessionsService usa
    //    il suo repository iniettato (connessione separata) e vedrebbe lo
    //    user non ancora committato.
    let txResult: { user: User; restaurant: Restaurant };
    try {
      txResult = await this.dataSource.transaction(async (em) => {
      const newUser = em.create(User, {
        email: dto.email,
        passwordHash,
        type: 'staff',
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
      await em.save(newUser);

      const newRestaurant = em.create(Restaurant, {
        name: dto.restaurantName,
        slug: await this.uniqueSlug(slug, em.getRepository(Restaurant)),
        vatNumber: dto.vatNumber ?? null,
        legalName: dto.restaurantName,
        email: dto.email,
        platformStatus: 'onboarding',
      });
      await em.save(newRestaurant);

      // Salvataggio batch in un'unica save: i ruoli vengono persistiti in
      // sequenza sullo stesso client transazionale. Un Promise.all di save()
      // concorrenti sullo stesso EntityManager triggera il deprecation warning
      // di pg ("client is already executing a query").
      const roles = await em.save(
        Object.entries(SYSTEM_ROLES).map(([, roleName]) =>
          em.create(Role, {
            restaurantId: newRestaurant.id,
            name: roleName,
            isSystem: true,
            permissions: DEFAULT_PERMISSIONS[roleName],
          }),
        ),
      );

      const titolareRole = roles.find((r) => r.name === SYSTEM_ROLES.TITOLARE);
      if (!titolareRole) {
        throw new Error('Ruolo titolare non creato durante la registrazione.');
      }

      const membership = em.create(Membership, {
        userId: newUser.id,
        restaurantId: newRestaurant.id,
        roleId: titolareRole.id,
        isActive: true,
        acceptedAt: new Date(),
      });
      await em.save(membership);

      const progress = em.create(OnboardingProgress, { restaurantId: newRestaurant.id });
      await em.save(progress);

      return { user: newUser, restaurant: newRestaurant };
      });
    } catch (e) {
      // Corsa B.1: due register simultanee con la stessa email passano entrambe
      // il controllo applicativo (findOne), ma il vincolo UNIQUE su users.email
      // fa fallire l'insert del perdente con SQLSTATE 23505 → lo convertiamo in
      // un 409 pulito (altrimenti risalirebbe come 500 QueryFailedError).
      if (e instanceof QueryFailedError && (e as { code?: string }).code === '23505') {
        throw new ConflictException('Email già registrata.');
      }
      throw e;
    }
    const { user, restaurant } = txResult;

    // 2. Dopo il commit: aggiorna lastLoginAt, crea sessione + token.
    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const { session, rawToken } = await this.sessionsService.create({
      userId: user.id,
      ipAddress: ip,
    });

    const accessToken = this.signAccessToken({
      sub: user.id,
      type: 'access',
      sessionId: session.id,
      restaurantId: restaurant.id,
      role: SYSTEM_ROLES.TITOLARE,
    });

    return {
      accessToken,
      refreshToken: rawToken,
      user: this.serializeUser(user),
      restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug },
    };
  }

  // ─── Login ──────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, ip?: string) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, type: 'staff', isActive: true },
      relations: ['twoFa'],
    });

    if (!user) throw new UnauthorizedException('Credenziali non valide.');

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) throw new UnauthorizedException('Credenziali non valide.');

    if (user.deletedAt) throw new UnauthorizedException('Account disattivato.');

    if (user.twoFa?.isEnabled) {
      const token = this.sign2faPendingToken(user.id);
      return { requiresTwoFactor: true, twoFactorToken: token };
    }

    return this.issueFullSession(user, ip);
  }

  // ─── Login with 2FA ─────────────────────────────────────────────────────────

  async loginWith2fa(twoFactorToken: string, code: string, ip?: string) {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(twoFactorToken, {
        secret: this.cfg.get('jwt.twoFaSecret'),
      });
    } catch {
      throw new UnauthorizedException('Token 2FA non valido o scaduto.');
    }

    if (payload.type !== '2fa_pending') {
      throw new UnauthorizedException('Token 2FA non valido.');
    }

    const user = await this.userRepo.findOne({
      where: { id: payload.sub, isActive: true },
      relations: ['twoFa'],
    });
    if (!user?.twoFa?.isEnabled) throw new UnauthorizedException('2FA non attiva.');

    const isValid = authenticator.verify({ token: code, secret: user.twoFa.secret });
    if (!isValid) throw new UnauthorizedException('Codice 2FA non valido.');

    return this.issueFullSession(user, ip);
  }

  // ─── Refresh ────────────────────────────────────────────────────────────────

  async refresh(rawRefreshToken: string) {
    const session = await this.sessionsService.findActiveByToken(rawRefreshToken);
    if (!session) throw new UnauthorizedException('Sessione non valida o scaduta.');

    const membership = await this.membershipRepo.findOne({
      where: { userId: session.userId, isActive: true },
      relations: ['role'],
    });
    if (!membership?.role) {
      throw new UnauthorizedException('Nessun ristorante attivo per questo utente.');
    }

    // Rotate atomico: chi vince la revoca della vecchia sessione è l'unico a
    // emettere una nuova coppia di token. Due refresh simultanei con lo stesso
    // refresh token → uno solo passa, l'altro 401 (no replay). Vedi test B.3.
    const won = await this.sessionsService.revokeIfActive(session.id);
    if (!won) {
      throw new UnauthorizedException('Sessione non valida o scaduta.');
    }
    const { session: newSession, rawToken: newRawToken } = await this.sessionsService.create({
      userId: session.userId,
      ipAddress: session.ipAddress,
      deviceInfo: session.deviceInfo,
    });

    const accessToken = this.signAccessToken({
      sub: session.userId,
      type: 'access',
      sessionId: newSession.id,
      restaurantId: membership.restaurantId,
      role: membership.role.name,
    });

    return { accessToken, refreshToken: newRawToken };
  }

  // ─── Logout ─────────────────────────────────────────────────────────────────

  async logout(sessionId: string): Promise<void> {
    await this.sessionsService.revoke(sessionId);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionsService.revokeAllForUser(userId);
  }

  // ─── 2FA Setup ──────────────────────────────────────────────────────────────

  async setup2fa(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['twoFa'] });
    if (!user) throw new UnauthorizedException('Utente non trovato.');
    if (user.twoFa?.isEnabled) {
      throw new BadRequestException('2FA già attiva. Disattivala prima di riconfigurare.');
    }

    const secret = authenticator.generateSecret();
    const issuer = this.cfg.getOrThrow<string>('totpIssuer');
    const otpAuthUrl = authenticator.keyuri(user.email, issuer, secret);
    const qrUri = await qrcode.toDataURL(otpAuthUrl);

    if (user.twoFa) {
      await this.twoFaRepo.update(user.twoFa.id, { secret, isEnabled: false, enabledAt: null });
    } else {
      await this.twoFaRepo.save(this.twoFaRepo.create({ userId, secret, isEnabled: false }));
    }

    return { secret, qrUri };
  }

  async enable2fa(userId: string, dto: Enable2faDto) {
    const twoFa = await this.twoFaRepo.findOne({ where: { userId } });
    if (!twoFa || twoFa.isEnabled) {
      throw new BadRequestException('Avvia prima il setup 2FA.');
    }

    const isValid = authenticator.verify({ token: dto.code, secret: twoFa.secret });
    if (!isValid) throw new BadRequestException('Codice non valido.');

    const recoveryCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(5).toString('hex').toUpperCase(),
    );

    await this.twoFaRepo.update(twoFa.id, {
      isEnabled: true,
      enabledAt: new Date(),
      recoveryCodes,
    });

    return { recoveryCodes };
  }

  async disable2fa(userId: string, password: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utente non trovato.');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Password non valida.');

    const twoFa = await this.twoFaRepo.findOne({ where: { userId, isEnabled: true } });
    if (!twoFa) throw new BadRequestException('2FA non attiva.');

    await this.twoFaRepo.update(twoFa.id, { isEnabled: false, enabledAt: null, recoveryCodes: null });
  }

  // ─── Multi-tenant: lista membership + switch ────────────────────────────────

  async listUserMemberships(userId: string) {
    const memberships = await this.membershipRepo.find({
      where: { userId, isActive: true },
      relations: ['restaurant', 'role'],
      order: { createdAt: 'ASC' },
    });
    return memberships.map((m) => ({
      restaurantId: m.restaurantId,
      restaurantName: m.restaurant.name,
      roleName: m.role.name,
      permissions: m.role.permissions,
    }));
  }

  /**
   * Cambia il restaurantId attivo nel JWT. La sessione corrente viene
   * mantenuta (stesso sessionId), ma il claim restaurantId/role nel nuovo
   * access token punta al ristorante scelto. Il refresh token resta valido.
   */
  async switchTenant(userId: string, sessionId: string, restaurantId: string) {
    const membership = await this.membershipRepo.findOne({
      where: { userId, restaurantId, isActive: true },
      relations: ['role', 'restaurant'],
    });
    if (!membership) {
      throw new ForbiddenException('Non hai accesso a questo ristorante.');
    }

    const accessToken = this.signAccessToken({
      sub: userId,
      type: 'access',
      sessionId,
      restaurantId,
      role: membership.role.name,
    });

    return {
      accessToken,
      restaurant: {
        id: membership.restaurant.id,
        name: membership.restaurant.name,
      },
      role: membership.role.name,
      permissions: membership.role.permissions,
    };
  }

  // ─── Password reset ─────────────────────────────────────────────────────────

  /**
   * Crea un token di reset password.
   * NON rivela mai se l'email esista o no: la risposta è la stessa in ogni caso.
   * Solo se l'utente esiste viene effettivamente generato un token.
   */
  async forgotPassword(email: string): Promise<{ devToken?: string }> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.isActive || user.deletedAt) {
      // Non-leak: la risposta è positiva anche se non emettiamo nulla.
      return {};
    }

    // Invalida eventuali token precedenti pending dello stesso utente
    await this.passwordResetRepo
      .createQueryBuilder()
      .update(PasswordReset)
      .set({ usedAt: new Date() })
      .where('user_id = :userId AND used_at IS NULL', { userId: user.id })
      .execute();

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MIN * 60_000);

    await this.passwordResetRepo.save(
      this.passwordResetRepo.create({ userId: user.id, tokenHash, expiresAt }),
    );

    // TODO: invio email reale via SES.
    // In dev/MVP esponiamo devToken nella response — da rimuovere in prod.
    return { devToken: rawToken };
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const reset = await this.passwordResetRepo.findOne({ where: { tokenHash } });

    if (!reset) throw new BadRequestException('Token non valido.');
    if (reset.usedAt) throw new BadRequestException('Token già utilizzato.');
    if (reset.expiresAt < new Date()) throw new BadRequestException('Token scaduto.');

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.dataSource.transaction(async (em) => {
      // Claim atomico del token monouso: l'UPDATE con WHERE used_at IS NULL +
      // row-lock fa sì che, fra due reset simultanei con lo stesso token, uno
      // solo abbia affected=1 e proceda a cambiare la password. Vedi test B.4.
      const claim = await em.update(
        PasswordReset,
        { id: reset.id, usedAt: IsNull() },
        { usedAt: new Date() },
      );
      if (!claim.affected) {
        throw new BadRequestException('Token già utilizzato.');
      }
      await em.update(User, reset.userId, { passwordHash });
      // Best practice: revoca tutte le sessioni attive dell'utente quando
      // la password cambia — chi conosceva la vecchia non deve più stare loggato.
      await this.sessionsService.revokeAllForUser(reset.userId);
    });
  }

  // ─── Me ─────────────────────────────────────────────────────────────────────

  async me(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['twoFa'],
    });
    if (!user) throw new UnauthorizedException('Utente non trovato.');
    const membership = await this.membershipRepo.findOne({
      where: { userId, isActive: true },
      relations: ['restaurant', 'role'],
    });
    return {
      user: this.serializeUser(user),
      twoFaEnabled: user.twoFa?.isEnabled ?? false,
      restaurant: membership?.restaurant
        ? { id: membership.restaurant.id, name: membership.restaurant.name }
        : null,
      role: membership?.role?.name ?? null,
      permissions: membership?.role?.permissions ?? null,
    };
  }

  // ─── Internal helpers ────────────────────────────────────────────────────────

  private async issueFullSession(user: User, ip?: string) {
    const membership = await this.membershipRepo.findOne({
      where: { userId: user.id, isActive: true },
      relations: ['role'],
    });
    if (!membership?.role) {
      throw new UnauthorizedException('Nessun ristorante attivo per questo utente.');
    }

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const { session, rawToken } = await this.sessionsService.create({
      userId: user.id,
      ipAddress: ip,
    });

    const accessToken = this.signAccessToken({
      sub: user.id,
      type: 'access',
      sessionId: session.id,
      restaurantId: membership.restaurantId,
      role: membership.role.name,
    });

    return {
      accessToken,
      refreshToken: rawToken,
      user: this.serializeUser(user),
    };
  }

  private signAccessToken(payload: JwtAccessPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.cfg.get('jwt.accessSecret'),
      expiresIn: this.cfg.get('jwt.accessExpiresIn'),
    });
  }

  private sign2faPendingToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: '2fa_pending' },
      {
        secret: this.cfg.get('jwt.twoFaSecret'),
        expiresIn: this.cfg.get('jwt.twoFaExpiresIn'),
      },
    );
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async uniqueSlug(base: string, repo: Repository<Restaurant>): Promise<string> {
    let slug = base;
    let count = 0;
    while (await repo.findOne({ where: { slug } })) {
      count++;
      slug = `${base}-${count}`;
    }
    return slug;
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl ?? null,
    };
  }
}
