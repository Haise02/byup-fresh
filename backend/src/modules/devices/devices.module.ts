import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { JwtDeviceStrategy } from './strategies/jwt-device.strategy';

import { Device } from './entities/device.entity';
import { Venue } from '../venue/entities/venue.entity';

import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Device, Venue]),
    IdentityModule,
  ],
  controllers: [DevicesController],
  providers: [DevicesService, JwtDeviceStrategy],
  exports: [DevicesService, JwtDeviceStrategy],
})
export class DevicesModule {}
