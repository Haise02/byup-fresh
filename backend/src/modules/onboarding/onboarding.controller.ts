import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAccessPayload } from '../identity/auth/strategies/jwt-access.strategy';
import { SetMenuSourceDto } from './dto/set-menu-source.dto';
import { UpdateLocaleDto } from './dto/update-locale.dto';
import { CreateRoomsDto } from './dto/create-rooms.dto';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  async getStatus(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.onboardingService.getStatus(user.restaurantId);
    return { success: true, data };
  }

  // Step 1 — Sorgente menu
  @Post('menu')
  @HttpCode(HttpStatus.OK)
  async setMenuSource(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: SetMenuSourceDto,
  ) {
    const data = await this.onboardingService.setMenuSource(user.restaurantId, dto);
    return { success: true, data };
  }

  @Get('menu/ai-result')
  async getAiResult(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.onboardingService.getAiResult(user.restaurantId);
    return { success: true, data };
  }

  @Post('menu/ai-review')
  @HttpCode(HttpStatus.OK)
  async reviewAiResult(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.onboardingService.reviewAiResult(user.restaurantId);
    return { success: true, data };
  }

  // Step 2a — Locale
  @Put('locale')
  async updateLocale(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: UpdateLocaleDto,
  ) {
    const data = await this.onboardingService.updateLocale(user.restaurantId, dto);
    return { success: true, data };
  }

  // Step 2b — Stripe Connect
  @Post('stripe-connect')
  @HttpCode(HttpStatus.OK)
  async initiateStripeConnect(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.onboardingService.initiateStripeConnect(user.restaurantId);
    return { success: true, data };
  }

  // Step 3 — Sale e tavoli
  @Post('rooms')
  @HttpCode(HttpStatus.OK)
  async createRooms(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateRoomsDto,
  ) {
    const data = await this.onboardingService.createRooms(user.restaurantId, dto);
    return { success: true, data };
  }

  // Step 4 — Go live
  @Post('go-live')
  @HttpCode(HttpStatus.OK)
  async goLive(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.onboardingService.goLive(user.restaurantId);
    return { success: true, data };
  }
}
