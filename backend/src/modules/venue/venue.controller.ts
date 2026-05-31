import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { VenueService } from './venue.service';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAccessPayload } from '../identity/auth/strategies/jwt-access.strategy';
import { SetVenueHoursDto } from './dto/venue-hours.dto';
import { UpdateVenueSettingsDto } from './dto/venue-settings.dto';

@Controller('venue')
@UseGuards(JwtAuthGuard)
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Get()
  async getDefault(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.venueService.getDefaultVenue(user.restaurantId);
    return { success: true, data };
  }

  @Get('hours')
  async getHours(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.venueService.getHours(user.restaurantId);
    return { success: true, data };
  }

  @Put('hours')
  async setHours(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: SetVenueHoursDto,
  ) {
    const data = await this.venueService.setHours(user.restaurantId, dto);
    return { success: true, data };
  }

  @Get('settings')
  async getSettings(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.venueService.getSettings(user.restaurantId);
    return { success: true, data };
  }

  @Patch('settings')
  async updateSettings(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: UpdateVenueSettingsDto,
  ) {
    const data = await this.venueService.updateSettings(user.restaurantId, dto);
    return { success: true, data };
  }
}
