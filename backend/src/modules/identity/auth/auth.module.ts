import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionsService } from './sessions.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';

import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { UserTwoFa } from '../entities/user-2fa.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { Role } from '../entities/role.entity';
import { Membership } from '../entities/membership.entity';
import { PasswordReset } from '../entities/password-reset.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      User,
      Session,
      UserTwoFa,
      Restaurant,
      Role,
      Membership,
      PasswordReset,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionsService, JwtAccessStrategy],
  exports: [SessionsService, JwtAccessStrategy],
})
export class AuthModule {}
