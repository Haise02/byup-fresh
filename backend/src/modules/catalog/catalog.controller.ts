import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAccessPayload } from '../identity/auth/strategies/jwt-access.strategy';

import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import {
  CreateItemDto,
  UpdateItemDto,
  SetItemAllergensDto,
  SetItemTagsDto,
} from './dto/item.dto';

@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ─── Lookup globali ─────────────────────────────────────────────────────────

  @Get('allergens')
  async listAllergens() {
    const data = await this.catalogService.listAllergens();
    return { success: true, data };
  }

  @Get('tags')
  async listTags() {
    const data = await this.catalogService.listTags();
    return { success: true, data };
  }

  // ─── Menus ──────────────────────────────────────────────────────────────────

  @Get('menus')
  async listMenus(@CurrentUser() user: JwtAccessPayload) {
    const data = await this.catalogService.listMenus(user.restaurantId);
    return { success: true, data };
  }

  @Post('menus')
  async createMenu(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateMenuDto) {
    const data = await this.catalogService.createMenu(user.restaurantId, dto);
    return { success: true, data };
  }

  @Get('menus/:menuId')
  async getMenuTree(
    @CurrentUser() user: JwtAccessPayload,
    @Param('menuId', ParseUUIDPipe) menuId: string,
  ) {
    const data = await this.catalogService.getMenuTree(user.restaurantId, menuId);
    return { success: true, data };
  }

  @Put('menus/:menuId')
  async updateMenu(
    @CurrentUser() user: JwtAccessPayload,
    @Param('menuId', ParseUUIDPipe) menuId: string,
    @Body() dto: UpdateMenuDto,
  ) {
    const data = await this.catalogService.updateMenu(user.restaurantId, menuId, dto);
    return { success: true, data };
  }

  @Delete('menus/:menuId')
  @HttpCode(HttpStatus.OK)
  async deleteMenu(
    @CurrentUser() user: JwtAccessPayload,
    @Param('menuId', ParseUUIDPipe) menuId: string,
  ) {
    await this.catalogService.deleteMenu(user.restaurantId, menuId);
    return { success: true };
  }

  // ─── Categories ─────────────────────────────────────────────────────────────

  @Post('menus/:menuId/categories')
  async createCategory(
    @CurrentUser() user: JwtAccessPayload,
    @Param('menuId', ParseUUIDPipe) menuId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    const data = await this.catalogService.createCategory(user.restaurantId, menuId, dto);
    return { success: true, data };
  }

  @Put('categories/:categoryId')
  async updateCategory(
    @CurrentUser() user: JwtAccessPayload,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const data = await this.catalogService.updateCategory(user.restaurantId, categoryId, dto);
    return { success: true, data };
  }

  @Delete('categories/:categoryId')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(
    @CurrentUser() user: JwtAccessPayload,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ) {
    await this.catalogService.deleteCategory(user.restaurantId, categoryId);
    return { success: true };
  }

  // ─── Items ──────────────────────────────────────────────────────────────────

  @Get('categories/:categoryId/items')
  async listItems(
    @CurrentUser() user: JwtAccessPayload,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ) {
    const data = await this.catalogService.listItems(user.restaurantId, categoryId);
    return { success: true, data };
  }

  @Post('categories/:categoryId/items')
  async createItem(
    @CurrentUser() user: JwtAccessPayload,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() dto: CreateItemDto,
  ) {
    const data = await this.catalogService.createItem(user.restaurantId, categoryId, dto);
    return { success: true, data };
  }

  @Put('items/:itemId')
  async updateItem(
    @CurrentUser() user: JwtAccessPayload,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    const data = await this.catalogService.updateItem(user.restaurantId, itemId, dto);
    return { success: true, data };
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  async deleteItem(
    @CurrentUser() user: JwtAccessPayload,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    await this.catalogService.deleteItem(user.restaurantId, itemId);
    return { success: true };
  }

  // ─── Item allergens / tags ──────────────────────────────────────────────────

  @Put('items/:itemId/allergens')
  async setItemAllergens(
    @CurrentUser() user: JwtAccessPayload,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: SetItemAllergensDto,
  ) {
    const data = await this.catalogService.setItemAllergens(user.restaurantId, itemId, dto);
    return { success: true, data };
  }

  @Put('items/:itemId/tags')
  async setItemTags(
    @CurrentUser() user: JwtAccessPayload,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: SetItemTagsDto,
  ) {
    const data = await this.catalogService.setItemTags(user.restaurantId, itemId, dto);
    return { success: true, data };
  }
}
