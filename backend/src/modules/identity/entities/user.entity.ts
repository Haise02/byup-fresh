import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Session } from './session.entity';
import { UserTwoFa } from './user-2fa.entity';
import { Membership } from './membership.entity';

export type UserType = 'staff' | 'consumer' | 'admin';

@Entity('users')
@Index('idx_users_email', ['email'], { unique: true })
@Index('idx_users_type', ['type'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar' })
  type: UserType;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'codice_fiscale', nullable: true })
  codiceFiscale: string;

  @Column({ nullable: true })
  pec: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Session, (s) => s.user)
  sessions: Session[];

  @OneToOne(() => UserTwoFa, (tfa) => tfa.user)
  twoFa: UserTwoFa;

  @OneToMany(() => Membership, (m) => m.user)
  memberships: Membership[];
}
