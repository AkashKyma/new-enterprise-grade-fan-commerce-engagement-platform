import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('retail_products')
export class RetailProduct {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() sku!: string;
  @Column() name!: string;
  @Column('jsonb', { default: {} }) meta!: any; // category, brand
}

@Entity('retail_variants')
export class RetailVariant {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() productId!: string;
  @Index({ unique: true }) @Column() sku!: string; // variant-level sku
  @Column('jsonb', { default: {} }) attrs!: any; // size/color
  @Column('int') price!: number; // cents
}

@Entity('retail_locations')
export class RetailLocation {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() code!: string; // STORE-1 / STORE-2
  @Column() name!: string;
  @Column('jsonb', { default: {} }) meta!: any;
}

@Entity('retail_central_levels')
export class RetailCentralLevel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() variantId!: string;
  @Column('int') onHand!: number;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('retail_location_levels')
export class RetailLocationLevel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() locationId!: string;
  @Index() @Column() variantId!: string;
  @Column('int') onHand!: number;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('retail_stock_movements')
export class RetailStockMovement {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() variantId!: string;
  @Index() @Column({ type: 'varchar', nullable: true }) locationId!: string | null; // null => central
  @Column() kind!: 'in'|'out'|'adjust'|'transfer'|'return';
  @Column('int') quantity!: number;
  @Column('jsonb', { default: {} }) meta!: any;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('retail_receipts')
export class RetailSaleReceipt {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() externalId!: string; // POS id
  @Index() @Column() locationId!: string;
  @Index() @Column() userId!: string; // optional association
  @Column('int') total!: number;
  @Column('jsonb') lines!: Array<{ variantId: string; sku: string; qty: number; unitPrice: number; subtotal: number }>;
  @CreateDateColumn() ts!: Date;
}

@Entity('retail_returns')
export class RetailReturnRecord {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() saleReceiptId!: string;
  @Index() @Column() variantId!: string;
  @Index() @Column() locationId!: string;
  @Column('int') qty!: number;
  @CreateDateColumn() ts!: Date;
  @Column('jsonb', { default: {} }) meta!: any;
}
