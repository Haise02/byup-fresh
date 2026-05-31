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
import { Restaurant } from '../../identity/entities/restaurant.entity';
import { Room } from './room.entity';

@Entity('venues')
@Index('idx_venues_restaurant', ['restaurantId'])
@Index('idx_venues_geo', ['latitude', 'longitude'])
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @Column()
  name: string;

  @Column({ name: 'is_default', default: true })
  isDefault: boolean;

  @Column({ name: 'address_street' })
  addressStreet: string;

  @Column({ name: 'address_city' })
  addressCity: string;

  @Column({ name: 'address_province', default: '' })
  addressProvince: string;

  @Column({ name: 'address_zip' })
  addressZip: string;

  @Column({ name: 'address_country', default: 'IT' })
  addressCountry: string;

  @Column({ type: 'decimal', nullable: true })
  latitude: number;

  @Column({ type: 'decimal', nullable: true })
  longitude: number;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ nullable: true })
  email: string;

  @Column({ default: 'Europe/Rome' })
  timezone: string;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @OneToMany(() => Room, (r) => r.venue)
  rooms: Room[];
}
