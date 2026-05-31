import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Venue } from './venue.entity';
import { Table } from './table.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'venue_id' })
  venueId: string;

  @Column()
  name: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'furniture_layout', type: 'json', nullable: true })
  furnitureLayout: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Venue, (v) => v.rooms)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @OneToMany(() => Table, (t) => t.room)
  tables: Table[];
}
