import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('fnb_products')
export class FnbProduct {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() sku!: string;
  @Column() name!: string;
  @Column('int') price!: number; // cents
  @Column('jsonb', { default: {} }) meta!: any; // category, allergens, etc.
}

@Entity('fnb_outlets')
export class FnbOutlet {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() code!: string; // e.g., KIOSK-01
  @Column() name!: string;
  @Column('jsonb', { default: {} }) meta!: any; // location, zone
}

@Entity('fnb_inventory_levels')
export class FnbInventoryLevel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() outletId!: string;
  @Index() @Column() productId!: string;
  @Column('int') onHand!: number;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('fnb_stock_movements')
export class FnbStockMovement {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() outletId!: string;
  @Index() @Column() productId!: string;
  @Column() kind!: 'in'|'out'|'adjust';
  @Column('int') quantity!: number;
  @Column('jsonb', { default: {} }) meta!: any; // reason, receiptId, note
  @CreateDateColumn() createdAt!: Date;
}

@Entity('fnb_receipts')
export class FnbReceipt {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() externalId!: string; // POS receipt id
  @Index() @Column() outletId!: string;
  @Index() @Column() userId!: string; // optional identity association (if known)
  @Column('int') total!: number; // cents
  @Column('jsonb') lines!: Array<{ productId: string; sku: string; qty: number; unitPrice: number; subtotal: number }>;
  @CreateDateColumn() ts!: Date;
}
