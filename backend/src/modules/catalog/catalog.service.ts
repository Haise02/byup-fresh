import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

import { Menu } from './entities/menu.entity';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { Allergen } from './entities/allergen.entity';
import { Tag } from './entities/tag.entity';
import { MenuItemAllergen } from './entities/menu-item-allergen.entity';
import { MenuItemTag } from './entities/menu-item-tag.entity';

import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import {
  CreateItemDto,
  UpdateItemDto,
  SetItemAllergensDto,
  SetItemTagsDto,
} from './dto/item.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Menu) private readonly menuRepo: Repository<Menu>,
    @InjectRepository(MenuCategory) private readonly categoryRepo: Repository<MenuCategory>,
    @InjectRepository(MenuItem) private readonly itemRepo: Repository<MenuItem>,
    @InjectRepository(Allergen) private readonly allergenRepo: Repository<Allergen>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    @InjectRepository(MenuItemAllergen)
    private readonly itemAllergenRepo: Repository<MenuItemAllergen>,
    @InjectRepository(MenuItemTag) private readonly itemTagRepo: Repository<MenuItemTag>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Allergeni e tag (lookup globali) ───────────────────────────────────────

  listAllergens() {
    return this.allergenRepo.find({ order: { nameIt: 'ASC' } });
  }

  listTags() {
    return this.tagRepo.find({ order: { displayOrder: 'ASC' } });
  }

  // ─── Menu ───────────────────────────────────────────────────────────────────

  listMenus(restaurantId: string) {
    return this.menuRepo.find({
      where: { restaurantId },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async createMenu(restaurantId: string, dto: CreateMenuDto) {
    if (dto.isDefault) {
      // Solo un default per ristorante: rimuovo il flag dagli altri
      await this.menuRepo.update({ restaurantId, isDefault: true }, { isDefault: false });
    }
    const menu = this.menuRepo.create({
      restaurantId,
      name: dto.name,
      isDefault: dto.isDefault ?? false,
      displayOrder: dto.displayOrder ?? 0,
    });
    return this.menuRepo.save(menu);
  }

  async updateMenu(restaurantId: string, menuId: string, dto: UpdateMenuDto) {
    const menu = await this.requireMenu(restaurantId, menuId);
    if (dto.isDefault === true && !menu.isDefault) {
      await this.menuRepo.update({ restaurantId, isDefault: true }, { isDefault: false });
    }
    Object.assign(menu, dto);
    return this.menuRepo.save(menu);
  }

  async deleteMenu(restaurantId: string, menuId: string) {
    const menu = await this.requireMenu(restaurantId, menuId);
    if (menu.isDefault) {
      throw new ConflictException('Non puoi eliminare il menu di default.');
    }
    await this.menuRepo.remove(menu);
  }

  async getMenuTree(restaurantId: string, menuId: string) {
    const menu = await this.requireMenu(restaurantId, menuId);
    const categories = await this.categoryRepo.find({
      where: { menuId: menu.id },
      order: { displayOrder: 'ASC' },
    });
    const categoryIds = categories.map((c) => c.id);
    const items = categoryIds.length
      ? await this.itemRepo.find({
          where: { categoryId: In(categoryIds) },
          order: { displayOrder: 'ASC' },
        })
      : [];

    const itemsByCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
      (acc[item.categoryId] ||= []).push(item);
      return acc;
    }, {});

    return {
      ...menu,
      categories: categories.map((c) => ({
        ...c,
        items: itemsByCategory[c.id] ?? [],
      })),
    };
  }

  // ─── Categorie ──────────────────────────────────────────────────────────────

  async createCategory(restaurantId: string, menuId: string, dto: CreateCategoryDto) {
    await this.requireMenu(restaurantId, menuId);
    const category = this.categoryRepo.create({
      menuId,
      name: dto.name,
      description: dto.description ?? null,
      displayOrder: dto.displayOrder ?? 0,
    });
    return this.categoryRepo.save(category);
  }

  async updateCategory(restaurantId: string, categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.requireCategory(restaurantId, categoryId);
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(restaurantId: string, categoryId: string) {
    const category = await this.requireCategory(restaurantId, categoryId);
    await this.categoryRepo.remove(category);
  }

  // ─── Piatti ─────────────────────────────────────────────────────────────────

  async listItems(restaurantId: string, categoryId: string) {
    await this.requireCategory(restaurantId, categoryId);
    return this.itemRepo.find({
      where: { categoryId },
      order: { displayOrder: 'ASC' },
      relations: ['allergens', 'allergens.allergen', 'tags', 'tags.tag'],
    });
  }

  async createItem(restaurantId: string, categoryId: string, dto: CreateItemDto) {
    await this.requireCategory(restaurantId, categoryId);
    const item = this.itemRepo.create({
      restaurantId,
      categoryId,
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      foodCost: dto.foodCost ?? null,
      vatCategory: dto.vatCategory ?? 'prepared_on_site',
      recipe: dto.recipe ?? null,
      prepTimeMinutes: dto.prepTimeMinutes ?? null,
      displayOrder: dto.displayOrder ?? 0,
    });
    return this.itemRepo.save(item);
  }

  async updateItem(restaurantId: string, itemId: string, dto: UpdateItemDto) {
    const item = await this.requireItem(restaurantId, itemId);
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async deleteItem(restaurantId: string, itemId: string) {
    const item = await this.requireItem(restaurantId, itemId);
    await this.itemRepo.remove(item);
  }

  // ─── Assegnazioni allergeni/tag ─────────────────────────────────────────────

  async setItemAllergens(restaurantId: string, itemId: string, dto: SetItemAllergensDto) {
    await this.requireItem(restaurantId, itemId);

    // Validazione: tutti gli allergen ids esistono
    if (dto.allergenIds.length > 0) {
      const found = await this.allergenRepo.count({ where: { id: In(dto.allergenIds) } });
      if (found !== dto.allergenIds.length) {
        throw new NotFoundException('Uno o più allergen ids non sono validi.');
      }
    }

    await this.dataSource.transaction(async (em) => {
      await em.delete(MenuItemAllergen, { menuItemId: itemId });
      if (dto.allergenIds.length > 0) {
        const rows = dto.allergenIds.map((allergenId) =>
          em.create(MenuItemAllergen, {
            menuItemId: itemId,
            allergenId,
            isAiSuggested: false,
            isConfirmed: true,
          }),
        );
        await em.save(rows);
      }
    });

    return this.itemAllergenRepo.find({
      where: { menuItemId: itemId },
      relations: ['allergen'],
    });
  }

  async setItemTags(restaurantId: string, itemId: string, dto: SetItemTagsDto) {
    await this.requireItem(restaurantId, itemId);

    if (dto.tagIds.length > 0) {
      const found = await this.tagRepo.count({ where: { id: In(dto.tagIds) } });
      if (found !== dto.tagIds.length) {
        throw new NotFoundException('Uno o più tag ids non sono validi.');
      }
    }

    await this.dataSource.transaction(async (em) => {
      await em.delete(MenuItemTag, { menuItemId: itemId });
      if (dto.tagIds.length > 0) {
        const rows = dto.tagIds.map((tagId) =>
          em.create(MenuItemTag, { menuItemId: itemId, tagId }),
        );
        await em.save(rows);
      }
    });

    return this.itemTagRepo.find({
      where: { menuItemId: itemId },
      relations: ['tag'],
    });
  }

  // ─── Bulk creation (per AI hook) ────────────────────────────────────────────

  /**
   * Crea menu + categorie + piatti in un colpo solo da un risultato AI.
   * Usato dal modulo onboarding quando il processing finisce.
   * Idempotente sul restaurant: se esiste già un menu default, lo riusa.
   */
  async createFromAiResult(
    restaurantId: string,
    ai: { categories: { name: string; items: { name: string; price?: number }[] }[] },
  ) {
    return this.dataSource.transaction(async (em) => {
      let menu = await em.findOne(Menu, { where: { restaurantId, isDefault: true } });
      if (!menu) {
        menu = em.create(Menu, {
          restaurantId,
          name: 'Menù Principale',
          isDefault: true,
          isActive: true,
        });
        await em.save(menu);
      }

      for (let i = 0; i < ai.categories.length; i++) {
        const catDef = ai.categories[i];
        const category = em.create(MenuCategory, {
          menuId: menu.id,
          name: catDef.name,
          displayOrder: i,
          isActive: true,
        });
        await em.save(category);

        for (let j = 0; j < catDef.items.length; j++) {
          const itemDef = catDef.items[j];
          const item = em.create(MenuItem, {
            restaurantId,
            categoryId: category.id,
            name: itemDef.name,
            price: itemDef.price ?? 0,
            displayOrder: j,
            vatCategory: 'prepared_on_site',
            isAvailable: true,
            isActive: true,
          });
          await em.save(item);
        }
      }

      return menu;
    });
  }

  // ─── Helpers (tenant scoping) ───────────────────────────────────────────────

  private async requireMenu(restaurantId: string, menuId: string): Promise<Menu> {
    const menu = await this.menuRepo.findOne({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('Menu non trovato.');
    if (menu.restaurantId !== restaurantId) {
      throw new ForbiddenException('Accesso negato a questo menu.');
    }
    return menu;
  }

  private async requireCategory(restaurantId: string, categoryId: string): Promise<MenuCategory> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['menu'],
    });
    if (!category) throw new NotFoundException('Categoria non trovata.');
    if (category.menu.restaurantId !== restaurantId) {
      throw new ForbiddenException('Accesso negato a questa categoria.');
    }
    return category;
  }

  private async requireItem(restaurantId: string, itemId: string): Promise<MenuItem> {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Piatto non trovato.');
    if (item.restaurantId !== restaurantId) {
      throw new ForbiddenException('Accesso negato a questo piatto.');
    }
    return item;
  }
}
