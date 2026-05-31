import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnerGuard } from '../auth/guards/owner.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAccessPayload } from '../auth/strategies/jwt-access.strategy';

import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { UpdateMembershipRoleDto } from './dto/membership.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ─── Invitations: endpoint pubblici (no JWT) ────────────────────────────────

  @Get('invitations/verify')
  async verifyInvitation(@Query('token') token: string) {
    const data = await this.staffService.verifyInvitation(token);
    return { success: true, data };
  }

  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    const data = await this.staffService.acceptInvitation(dto);
    return { success: true, data };
  }

  // ─── Invitations: gestione dal titolare ─────────────────────────────────────

  @Post('invitations')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async createInvitation(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateInvitationDto,
  ) {
    const data = await this.staffService.createInvitation(user.restaurantId, user.sub, dto);
    return { success: true, data };
  }

  @Get('invitations')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async listInvitations(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.staffService.listInvitations(user.restaurantId);
    return { success: true, data };
  }

  @Delete('invitations/:id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @HttpCode(HttpStatus.OK)
  async revokeInvitation(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.staffService.revokeInvitation(user.restaurantId, id);
    return { success: true };
  }

  // ─── Memberships ────────────────────────────────────────────────────────────

  @Get('members')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async listMembers(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.staffService.listMembers(user.restaurantId);
    return { success: true, data };
  }

  @Put('members/:id/role')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async updateMemberRole(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMembershipRoleDto,
  ) {
    const data = await this.staffService.updateMemberRole(
      user.restaurantId,
      user.sub,
      id,
      dto,
    );
    return { success: true, data };
  }

  @Delete('members/:id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @HttpCode(HttpStatus.OK)
  async deactivateMember(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.staffService.deactivateMember(user.restaurantId, user.sub, id);
    return { success: true };
  }

  // ─── Roles ──────────────────────────────────────────────────────────────────

  @Get('roles')
  @UseGuards(JwtAuthGuard)
  async listRoles(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.staffService.listRoles(user.restaurantId);
    return { success: true, data };
  }

  @Post('roles')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async createRole(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateRoleDto) {
    const data = await this.staffService.createRole(user.restaurantId, dto);
    return { success: true, data };
  }

  @Put('roles/:id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async updateRole(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    const data = await this.staffService.updateRole(user.restaurantId, id, dto);
    return { success: true, data };
  }

  @Delete('roles/:id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  @HttpCode(HttpStatus.OK)
  async deleteRole(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.staffService.deleteRole(user.restaurantId, id);
    return { success: true };
  }
}
