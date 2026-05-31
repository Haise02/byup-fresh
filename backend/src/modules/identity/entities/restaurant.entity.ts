import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Membership } from './membership.entity';

export type PlatformStatus = 'onboarding' | 'active' | 'churned';
export type StripeConnectStatus = 'pending' | 'active' | 'restricted' | 'disabled';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'vat_number', type: 'varchar', unique: true, nullable: true })
  vatNumber: string | null;

  @Column({ name: 'legal_name', nullable: true })
  legalName: string;

  @Column({ name: 'platform_status', default: 'onboarding' })
  platformStatus: PlatformStatus;

  @Column({ name: 'stripe_connect_account_id', nullable: true })
  stripeConnectAccountId: string;

  @Column({ name: 'stripe_connect_status', nullable: true })
  stripeConnectStatus: StripeConnectStatus;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'last_activity_at', nullable: true })
  lastActivityAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'activated_at', nullable: true })
  activatedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Membership, (m) => m.restaurant)
  memberships: Membership[];
}
