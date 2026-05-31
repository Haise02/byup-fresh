import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { Allergen } from './allergen.entity';

@Entity('menu_item_allergens')
@Index('idx_item_allergens_item', ['menuItemId'])
@Index('idx_item_allergens_unique', ['menuItemId', 'allergenId'], { unique: true })
export class MenuItemAllergen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'menu_item_id' })
  menuItemId: string;

  @Column({ name: 'allergen_id' })
  allergenId: string;

  @Column({ name: 'is_ai_suggested', default: false })
  isAiSuggested: boolean;

  @Column({ name: 'is_confirmed', default: false })
  isConfirmed: boolean;

  @ManyToOne(() => MenuItem, (m) => m.allergens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;

  @ManyToOne(() => Allergen)
  @JoinColumn({ name: 'allergen_id' })
  allergen: Allergen;
}
