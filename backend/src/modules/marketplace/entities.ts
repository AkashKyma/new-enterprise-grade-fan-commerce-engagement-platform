import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() code!: string; // VENDOR-1
  @Column() name!: string;
  @Column('jsonb', { default: {} }) meta!: any; // webhook urls, settlement prefs, etc.
}

@Entity('marketplace_items')
export class MarketplaceItem {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() sku!: string;
  @Column() title!: string;
  @Column('int') price!: number; // cents
  @Index() @Column({ type: 'varchar', nullable: true }) vendorId!: string | null; // null => internal
  @Column('jsonb', { default: {} }) meta!: any; // type, stock policy, etc.
}

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() userId!: string;
  @Column('jsonb', { default: {} }) meta!: any; // channel, source
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('cart_lines')
export class CartLine {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() cartId!: string;
  @Index() @Column() itemId!: string;
  @Column('int') unitPrice!: number;
  @Column('int') qty!: number;
  @Column('jsonb', { default: {} }) meta!: any; // vendor snapshot, options
}

@Entity('mp_orders')
export class MpOrder {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Column({ default: 'created' }) status!: 'created'|'pending_payment'|'paid'|'fulfilled'|'cancelled';
  @Column('int', { default: 0 }) total!: number;
  @Column('jsonb', { default: {} }) breakdown!: any; // per-vendor subtotals, etc.
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('mp_order_lines')
export class MpOrderLine {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() orderId!: string;
  @Index() @Column() itemId!: string;
  @Index() @Column({ type: 'varchar', nullable: true }) vendorId!: string | null;
  @Column('int') unitPrice!: number;
  @Column('int') qty!: number;
  @Column('jsonb', { default: {} }) meta!: any;
}

@Entity('mp_settlement_refs')
export class SettlementRef {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() orderId!: string;
  @Index() @Column({ type: 'varchar', nullable: true }) vendorId!: string | null;
  @Column('jsonb', { default: {} }) meta!: any; // payout-ready refs
}
