import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto, DeviceLoginDto } from './dto/device.dto';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { OwnerGuard } from '../identity/auth/guards/owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAccessPayload } from '../identity/auth/strategies/jwt-access.strategy';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // ─── Login dispositivo (pubblico) ───────────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async deviceLogin(@Body() dto: DeviceLoginDto) {
    const data = await this.devicesService.login(dto.username, dto.password);
    return { success: true, data };
  }

  // ─── Gestione dal titolare ──────────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async list(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.devicesService.list(user.restaurantId);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateDeviceDto) {
    const data = await this.devicesService.create(user.restaurantId, dto);
    return { success: true, data };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeviceDto,
  ) {
    const data = await this.devicesService.update(user.restaurantId, id, dto);
    return { success: true, data };
  }

  @Post(':id/regenerate-password')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @HttpCode(HttpStatus.OK)
  async regeneratePassword(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.devicesService.regeneratePassword(user.restaurantId, id);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.devicesService.delete(user.restaurantId, id);
    return { success: true };
  }
}
