import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { Tag } from './tag.entity';

@Entity('menu_item_tags')
@Index('idx_item_tags_unique', ['menuItemId', 'tagId'], { unique: true })
export class MenuItemTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'menu_item_id' })
  menuItemId: string;

  @Column({ name: 'tag_id' })
  tagId: string;

  @Column({ name: 'price_modifier', type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceModifier: number;

  @ManyToOne(() => MenuItem, (m) => m.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}
