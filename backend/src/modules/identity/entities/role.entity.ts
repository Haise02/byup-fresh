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
import { Restaurant } from './restaurant.entity';

export const SYSTEM_ROLES = {
  TITOLARE: 'titolare',
  CAMERIERE: 'cameriere',
  CASSA: 'cassa',
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export interface RolePermissions {
  panoramica?: boolean;
  sala?: boolean;
  cucina?: boolean;
  app?: boolean;
  statistiche?: boolean;
  contabilita?: boolean;
  supporto?: boolean;
  impostazioni?: boolean;
}

export const DEFAULT_PERMISSIONS: Record<SystemRole, RolePermissions> = {
  titolare: {
    panoramica: true,
    sala: true,
    cucina: true,
    app: true,
    statistiche: true,
    contabilita: true,
    supporto: true,
    impostazioni: true,
  },
  cameriere: {
    panoramica: false,
    sala: true,
    cucina: false,
    app: false,
    statistiche: false,
    contabilita: false,
    supporto: true,
    impostazioni: false,
  },
  cassa: {
    panoramica: false,
    sala: false,
    cucina: false,
    app: true,
    statistiche: false,
    contabilita: false,
    supporto: true,
    impostazioni: false,
  },
};

@Entity('roles')
@Index('idx_roles_restaurant_name', ['restaurantId', 'name'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id', nullable: true })
  restaurantId: string;

  @Column()
  name: string;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({ type: 'json' })
  permissions: RolePermissions;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Restaurant, { nullable: true })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
