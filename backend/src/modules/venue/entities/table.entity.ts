import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from './room.entity';

export type TableStatus = 'free' | 'occupied' | 'reserved' | 'to_clean';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'room_id' })
  roomId: string;

  @Column()
  label: string;

  @Column({ default: 4 })
  capacity: number;

  @Column({ default: 'free' })
  status: TableStatus;

  @Column({ name: 'position_x', type: 'decimal', nullable: true })
  positionX: number;

  @Column({ name: 'position_y', type: 'decimal', nullable: true })
  positionY: number;

  @Column({ name: 'qr_token', unique: true, nullable: true })
  qrToken: string;

  @Column({ name: 'assigned_waiter_id', nullable: true })
  assignedWaiterId: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Room, (r) => r.tables)
  @JoinColumn({ name: 'room_id' })
  room: Room;
}
