import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('loyalty_accounts')
export class LoyaltyAccount {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() userId!: string;
  @Column({ default: 0 }) points!: number;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('loyalty_ledger')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Column() direction!: 'earn'|'redeem';
  @Column('int') amount!: number;
  @Column('jsonb', { default: {} }) meta!: any;
  @Index({ unique: true }) @Column() idempotencyKey!: string;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('loyalty_tiers')
export class LoyaltyTier {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() code!: string;
  @Column('int') threshold!: number;
  @Column('jsonb', { default: {} }) benefits!: any;
}

@Entity('benefit_rules')
export class BenefitRule {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @Column('jsonb') criteria!: any;
  @Column('jsonb') effect!: any;
}

@Entity('reward_catalog')
export class RewardCatalogItem {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @Column('int') cost!: number;
  @Column('jsonb', { default: {} }) payload!: any;
  @Column({ default: true }) active!: boolean;
}

@Entity('reward_redemptions')
export class RewardRedemption {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Index() @Column() rewardId!: string;
  @Index({ unique: true }) @Column() idempotencyKey!: string;
  @Column('jsonb', { default: {} }) result!: any;
  @CreateDateColumn() createdAt!: Date;
}
