import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Membership } from '../entities/membership.entity';
import { Invitation } from '../entities/invitation.entity';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Role, Membership, Invitation]),
    AuthModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
