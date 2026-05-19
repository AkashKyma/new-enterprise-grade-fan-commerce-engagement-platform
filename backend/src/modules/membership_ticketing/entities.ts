import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('membership_plans')
export class MembershipPlan {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() code!: string; // BRONZE/PRATA/OURO
  @Column() name!: string;
  @Column('jsonb', { default: {} }) benefits!: any; // {discountPct, priorityWindowMins, includedMatches}
}

@Entity('memberships')
export class MembershipSubscription {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Index() @Column() planId!: string;
  @Column({ default: true }) active!: boolean;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('events')
export class MatchEvent {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @Column() date!: string; // ISO
  @Column('jsonb', { default: {} }) meta!: any; // opponent, competition
}

@Entity('venue_sections')
export class VenueSection {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() eventId!: string;
  @Column() name!: string; // e.g., Norte A
  @Column('int') capacity!: number;
}

@Entity('ticket_inventory')
export class TicketInventory {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() eventId!: string;
  @Index() @Column() sectionId!: string;
  @Column('int') total!: number;
  @Column('int') reserved!: number;
  @Column('int') sold!: number;
}

@Entity('ticket_entitlements')
export class TicketEntitlement {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Index() @Column() eventId!: string;
  @Index() @Column() sectionId!: string;
  @Column({ default: 'eligible' }) status!: 'eligible'|'reserved'|'checked_in';
  @Column('jsonb', { default: {} }) meta!: any; // reservation timestamp, price, discount
}

@Entity('allocations')
export class Allocation {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() eventId!: string;
  @Index() @Column() sectionId!: string;
  @Column() kind!: 'sponsor'|'hospitality'|'waiting_list'|'resale_pool';
  @Column('int') qty!: number;
}

@Entity('checkins')
export class CheckInRecord {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Index() @Column() eventId!: string;
  @Index() @Column() sectionId!: string;
  @CreateDateColumn() ts!: Date;
  @Column('jsonb', { default: {} }) meta!: any; // gate, device, fr_ref
}

@Entity('access_refs')
export class AccessCredentialReference {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Column({ type: 'varchar', nullable: true }) providerId!: string | null; // future FR system
  @Column('jsonb', { default: {} }) meta!: any;
}
