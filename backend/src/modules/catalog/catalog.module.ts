import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CatalogSeedService } from './seeds/catalog.seed';

import { Menu } from './entities/menu.entity';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { Allergen } from './entities/allergen.entity';
import { Tag } from './entities/tag.entity';
import { MenuItemAllergen } from './entities/menu-item-allergen.entity';
import { MenuItemTag } from './entities/menu-item-tag.entity';

import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Menu,
      MenuCategory,
      MenuItem,
      Allergen,
      Tag,
      MenuItemAllergen,
      MenuItemTag,
    ]),
    IdentityModule,
  ],
  controllers: [CatalogController],
  providers: [CatalogService, CatalogSeedService],
  exports: [CatalogService],
})
export class CatalogModule {}
