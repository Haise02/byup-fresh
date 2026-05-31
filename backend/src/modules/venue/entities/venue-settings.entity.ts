import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Venue } from './venue.entity';

export type KitchenMode = 'kds' | 'printer' | 'both';
export type PaymentMethod = 'card_terminal' | 'in_app' | 'cash';

@Entity('venue_settings')
export class VenueSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'venue_id', unique: true })
  venueId: string;

  // Validazione ordini esterni (app/webapp guest)
  @Column({ name: 'validate_external_orders', default: false })
  validateExternalOrders: boolean;

  @Column({ name: 'kitchen_mode', default: 'kds' })
  kitchenMode: KitchenMode;

  @Column({ name: 'payment_methods_enabled', type: 'json', default: () => `'["card_terminal","cash"]'` })
  paymentMethodsEnabled: PaymentMethod[];

  @Column({ name: 'service_charge_enabled', default: false })
  serviceChargeEnabled: boolean;

  @Column({ name: 'service_charge_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  serviceChargePercentage: number;

  @Column({ name: 'auto_print_receipt', default: false })
  autoPrintReceipt: boolean;

  // Soglie di alert tavolo (minuti)
  @Column({ name: 'no_order_warn_min', default: 15 })
  noOrderWarnMin: number;

  @Column({ name: 'no_order_alert_min', default: 25 })
  noOrderAlertMin: number;

  @Column({ name: 'overstay_min', default: 90 })
  overstayMin: number;

  @Column({ name: 'old_bill_hours', default: 3 })
  oldBillHours: number;

  // Prenotazioni
  @Column({ name: 'default_reservation_duration_min', default: 90 })
  defaultReservationDurationMin: number;

  @Column({ name: 'auto_assign_table', default: false })
  autoAssignTable: boolean;

  @Column({ name: 'no_show_timeout_min', default: 15 })
  noShowTimeoutMin: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Venue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;
}
