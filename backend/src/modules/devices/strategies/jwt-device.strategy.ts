import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtDevicePayload {
  sub: string;          // device id
  type: 'device';
  deviceType: 'tablet' | 'kds' | 'pos_terminal';
  venueId: string;
  restaurantId: string;
  scope: string[];      // capabilities ammesse — limitate al routing comande/lettura
}

@Injectable()
export class JwtDeviceStrategy extends PassportStrategy(Strategy, 'jwt-device') {
  constructor(private cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('jwt.accessSecret'),
    });
  }

  validate(payload: JwtDevicePayload) {
    if (payload.type !== 'device') {
      throw new UnauthorizedException('Token non valido per dispositivo.');
    }
    return payload;
  }
}
