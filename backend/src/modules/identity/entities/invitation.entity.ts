import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { Role } from './role.entity';
import { User } from './user.entity';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

@Entity('invitations')
@Index('idx_invitations_token', ['token'], { unique: true })
@Index('idx_invitations_restaurant_email', ['restaurantId', 'email'])
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @Column({ name: 'role_id' })
  roleId: string;

  @Column()
  email: string;

  @Column({ unique: true })
  token: string;

  @Column({ default: 'pending' })
  status: InvitationStatus;

  @Column({ name: 'invited_by' })
  invitedBy: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'accepted_at', nullable: true })
  acceptedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invited_by' })
  inviter: User;
}
