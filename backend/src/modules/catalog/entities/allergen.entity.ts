import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export const ALLERGEN_CODES = [
  'gluten',
  'crustaceans',
  'eggs',
  'fish',
  'peanuts',
  'soybeans',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs',
] as const;

export type AllergenCode = (typeof ALLERGEN_CODES)[number];

@Entity('allergens')
export class Allergen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: AllergenCode;

  @Column({ name: 'name_it' })
  nameIt: string;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string;
}
