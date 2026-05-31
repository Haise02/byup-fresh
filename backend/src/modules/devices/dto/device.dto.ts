import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DeviceType } from '../entities/device.entity';

export class CreateDeviceDto {
  @IsEnum(['tablet', 'kds', 'pos_terminal'])
  type: DeviceType;

  @IsString()
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  deviceModel?: string;
}

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;
}

export class DeviceLoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
