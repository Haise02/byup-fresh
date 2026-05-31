import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venue } from '../../venue/entities/venue.entity';
import { User } from '../../identity/entities/user.entity';

export type DeviceType = 'tablet' | 'kds' | 'pos_terminal';

@Entity('devices')
@Index('idx_devices_venue', ['venueId'])
@Index('idx_devices_venue_type', ['venueId', 'type'])
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'venue_id' })
  venueId: string;

  @Column()
  type: DeviceType;

  @Column()
  name: string;

  @Column({ name: 'device_model', type: 'varchar', nullable: true })
  deviceModel: string | null;

  @Column({ name: 'device_identifier', nullable: true })
  deviceIdentifier: string;

  // Solo per type='kds': username locale generato (es. PG1-cucina)
  @Column({ type: 'varchar', unique: true, nullable: true })
  username: string | null;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash: string | null;

  // Solo per type='pos_terminal': operatore associato al primo login
  @Column({ name: 'assigned_operator', nullable: true })
  assignedOperator: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_seen_at', nullable: true })
  lastSeenAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_operator' })
  operator: User;
}
