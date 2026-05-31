import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';

@Module({
  imports: [AuthModule, UsersModule, StaffModule],
  exports: [AuthModule, UsersModule, StaffModule],
})
export class IdentityModule {}
