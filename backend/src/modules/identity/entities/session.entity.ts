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

@Entity('sessions')
@Index('idx_sessions_user', ['userId'])
@Index('idx_sessions_token', ['tokenHash'])
@Index('idx_sessions_active', ['userId', 'isActive'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'device_id', nullable: true })
  deviceId: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'device_info', type: 'json', nullable: true })
  deviceInfo: Record<string, unknown>;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'last_activity_at' })
  lastActivityAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'revoked_at', nullable: true })
  revokedAt: Date;

  @ManyToOne(() => User, (u) => u.sessions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
