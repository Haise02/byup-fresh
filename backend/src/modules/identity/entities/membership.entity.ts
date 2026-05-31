import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Restaurant } from './restaurant.entity';
import { Role } from './role.entity';

@Entity('memberships')
@Index('idx_memberships_user_restaurant', ['userId', 'restaurantId'], { unique: true })
@Index('idx_memberships_restaurant', ['restaurantId'])
@Index('idx_memberships_user', ['userId'])
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @Column({ name: 'venue_id', nullable: true })
  venueId: string;

  @Column({ name: 'role_id' })
  roleId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'invited_by', nullable: true })
  invitedBy: string;

  @Column({ name: 'dashboard_config', type: 'json', nullable: true })
  dashboardConfig: Record<string, unknown>;

  @Column({ name: 'invited_at', nullable: true })
  invitedAt: Date;

  @Column({ name: 'accepted_at', nullable: true })
  acceptedAt: Date;

  @Column({ name: 'deactivated_at', nullable: true })
  deactivatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.memberships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Restaurant, (r) => r.memberships)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
