import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export const TAG_NAMES = [
  'senza_glutine',
  'vegano',
  'vegetariano',
  'bio',
  'piccante',
  'senza_lattosio',
] as const;

export type TagName = (typeof TAG_NAMES)[number];

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: TagName;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;
}
