import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../../entities/session.entity';

export interface JwtAccessPayload {
  sub: string;
  type: 'access';
  sessionId: string;
  restaurantId: string;
  role: string;
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private cfg: ConfigService,
    @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('jwt.accessSecret'),
    });
  }

  /**
   * Oltre alla validità della firma/scadenza (gestita da passport-jwt), verifica
   * che la SESSIONE collegata al token sia ancora attiva e non scaduta.
   *
   * Conseguenza voluta: logout, revoca da un altro dispositivo, rotazione del
   * refresh token e cambio password invalidano l'access token *immediatamente*,
   * senza dover aspettare la scadenza naturale (15 min). È un trade-off
   * deliberato — una lookup DB indicizzata (PK) per richiesta autenticata — che
   * privilegia la sicurezza/revocabilità rispetto al puro stateless JWT.
   * (Vedi test C.5 e C.12.)
   */
  async validate(payload: JwtAccessPayload): Promise<JwtAccessPayload> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Token type non valido.');
    }

    const session = await this.sessionRepo.findOne({
      where: { id: payload.sessionId, isActive: true },
    });
    if (!session) {
      throw new UnauthorizedException('Sessione non valida o revocata.');
    }
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessione scaduta.');
    }

    return payload;
  }
}
