import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column({ nullable: true }) email!: string | null;
  @Index({ unique: true }) @Column({ nullable: true }) phone!: string | null;
  @Column({ select: false, nullable: true }) passwordHash!: string | null;
  @Column({ default: 'customer' }) role!: 'customer' | 'operator' | 'admin';
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('customer_profiles')
export class CustomerProfile {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() userId!: string;
  @Column('jsonb', { default: {} }) traits!: Record<string, any>; // name, cpf, address, preferences
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('identity_links')
export class IdentityLink {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Column() provider!: string; // ticketing|loyalty|marketplace|pos|fr
  @Column() providerId!: string;
  @Column('jsonb', { default: {} }) meta!: Record<string, any>;
  @CreateDateColumn() linkedAt!: Date;
}

@Entity('wallet_refs')
export class WalletReference {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Column({ nullable: true }) walletId!: string | null; // future stored-value/wallet system id
  @Column('jsonb', { default: {} }) meta!: Record<string, any>;
}

@Entity('membership_refs')
export class MembershipReference {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Index({ unique: true, nullable: true }) @Column({ nullable: true }) membershipId!: string | null;
  @Column('jsonb', { default: {} }) meta!: Record<string, any>;
}

@Entity('biometric_placeholders')
export class BiometricReferencePlaceholder {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Column({ default: 'pending' }) status!: 'pending' | 'enrolled' | 'revoked';
  @Column('jsonb', { default: {} }) providerMeta!: Record<string, any>; // provider name, enrollment ids
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Column() jwtId!: string;
  @Column({ default: true }) active!: boolean;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
