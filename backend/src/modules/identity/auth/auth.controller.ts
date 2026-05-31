import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  NotFoundException,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2faLoginDto } from './dto/verify-2fa-login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Enable2faDto } from './dto/enable-2fa.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { SwitchTenantDto } from './dto/switch-tenant.dto';
import { JwtAccessPayload } from './strategies/jwt-access.strategy';
import { IsString } from 'class-validator';

class Disable2faDto {
  @IsString()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Post('staff/register')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async register(@Body() dto: RegisterStaffDto, @Req() req: Request) {
    const result = await this.authService.registerStaff(dto, req.ip);
    return { success: true, data: result };
  }

  @Post('staff/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const result = await this.authService.login(dto, req.ip);
    return { success: true, data: result };
  }

  @Post('staff/login/2fa')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async loginWith2fa(@Body() dto: Verify2faLoginDto, @Req() req: Request) {
    const result = await this.authService.loginWith2fa(dto.twoFactorToken, dto.code, req.ip);
    return { success: true, data: result };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    const result = await this.authService.refresh(dto.refreshToken);
    return { success: true, data: result };
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    // Risposta sempre identica per non rivelare l'esistenza dell'email.
    // In dev/MVP esponiamo il devToken — da rimuovere in prod.
    const { devToken } = await this.authService.forgotPassword(dto.email);
    return { success: true, ...(devToken ? { devToken } : {}) };
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.authService.me(user.sub);
    return { success: true, data };
  }

  @Get('memberships')
  @UseGuards(JwtAuthGuard)
  async listMemberships(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.authService.listUserMemberships(user.sub);
    return { success: true, data };
  }

  @Post('switch-tenant')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async switchTenant(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: SwitchTenantDto,
  ) {
    const data = await this.authService.switchTenant(user.sub, user.sessionId, dto.restaurantId);
    return { success: true, data };
  }

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: JwtAccessPayload) {
    await this.authService.logout(user.sessionId);
    return { success: true };
  }

  @Delete('logout/all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: JwtAccessPayload) {
    await this.authService.logoutAll(user.sub);
    return { success: true };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async listSessions(@CurrentUser() user: JwtAccessPayload) {
    const sessions = await this.sessionsService.listForUser(user.sub);
    const data = sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      deviceInfo: s.deviceInfo,
      isCurrent: s.id === user.sessionId,
      lastActivityAt: s.lastActivityAt,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }));
    return { success: true, data };
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) sessionId: string,
  ) {
    const session = await this.sessionsService.findById(sessionId);
    if (!session) throw new NotFoundException('Sessione non trovata.');
    if (session.userId !== user.sub) {
      throw new ForbiddenException('Non puoi revocare la sessione di un altro utente.');
    }
    await this.sessionsService.revoke(sessionId);
    return { success: true };
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  async setup2fa(@CurrentUser() user: JwtAccessPayload) {
    const result = await this.authService.setup2fa(user.sub);
    return { success: true, data: result };
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  async enable2fa(@CurrentUser() user: JwtAccessPayload, @Body() dto: Enable2faDto) {
    const result = await this.authService.enable2fa(user.sub, dto);
    return { success: true, data: result };
  }

  @Delete('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disable2fa(@CurrentUser() user: JwtAccessPayload, @Body() dto: Disable2faDto) {
    await this.authService.disable2fa(user.sub, dto.password);
    return { success: true };
  }
}
