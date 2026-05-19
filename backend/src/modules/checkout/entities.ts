import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Column({ default: 'draft' }) status!: 'draft'|'pending_payment'|'paid'|'failed'|'cancelled'|'fulfilled';
  @Column('int', { default: 0 }) total!: number; // cents
  @Column('int', { default: 0 }) subtotal!: number; // cents
  @Column('int', { default: 0 }) discount!: number; // cents
  @Column('jsonb', { default: {} }) meta!: any; // channel, source, notes
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('order_lines')
export class OrderLine {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() orderId!: string;
  @Column() itemType!: 'ticket'|'retail'|'fnb'|'marketplace'|'service';
  @Column() itemRef!: string; // reference id (event/sku/etc)
  @Column('int') unitPrice!: number; // cents
  @Column('int') quantity!: number;
  @Column('jsonb', { default: {} }) meta!: any; // section, seat, vendor, etc.
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() orderId!: string;
  @Column({ default: 'initialized' }) state!: 'initialized'|'pending'|'authorized'|'captured'|'failed'|'cancelled';
  @Column({ default: 'unpaid' }) status!: 'unpaid'|'paid'|'refunded'|'partial';
  @Column('int', { default: 0 }) amount!: number; // cents
  @Column('jsonb', { default: {} }) method!: any; // {type: card|qr|pix|wallet, token:..., walletRef:...}
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('payment_attempts')
export class PaymentAttempt {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() paymentId!: string;
  @Column('jsonb', { default: {} }) request!: any;
  @Column('jsonb', { default: {} }) response!: any;
  @Column({ default: 'pending' }) outcome!: 'pending'|'success'|'error';
  @CreateDateColumn() createdAt!: Date;
}

@Entity('offline_sync')
export class OfflineSyncRecord {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() deviceId!: string; // POS/kiosk id
  @Column('jsonb') payload!: any; // queued transaction data
  @Column({ default: 'queued' }) state!: 'queued'|'synced'|'conflict'|'error';
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
