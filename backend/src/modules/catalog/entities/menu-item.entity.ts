import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { MenuCategory } from './menu-category.entity';
import { MenuItemAllergen } from './menu-item-allergen.entity';
import { MenuItemTag } from './menu-item-tag.entity';

export type VatCategory = 'prepared_on_site' | 'packaged_product';

@Entity('menu_items')
@Index('idx_items_category', ['categoryId'])
@Index('idx_items_restaurant', ['restaurantId'])
@Index('idx_items_order', ['categoryId', 'displayOrder'])
@Index('idx_items_active', ['restaurantId', 'isActive', 'isAvailable'])
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'food_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  foodCost: number | null;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'vat_category', default: 'prepared_on_site' })
  vatCategory: VatCategory;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  recipe: string | null;

  @Column({ name: 'prep_time_minutes', type: 'int', nullable: true })
  prepTimeMinutes: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => MenuCategory, (c) => c.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: MenuCategory;

  @OneToMany(() => MenuItemAllergen, (a) => a.menuItem)
  allergens: MenuItemAllergen[];

  @OneToMany(() => MenuItemTag, (t) => t.menuItem)
  tags: MenuItemTag[];
}
