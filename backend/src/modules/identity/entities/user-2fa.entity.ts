import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_2fa')
export class UserTwoFa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column()
  secret: string;

  @Column({ name: 'is_enabled', default: false })
  isEnabled: boolean;

  @Column({ name: 'recovery_codes', type: 'json', nullable: true })
  recoveryCodes: string[] | null;

  @Column({ name: 'enabled_at', type: 'timestamp', nullable: true })
  enabledAt: Date | null;

  @OneToOne(() => User, (u) => u.twoFa)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
