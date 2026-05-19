import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cdp_profiles')
export class CdpProfile {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index({ unique: true }) @Column() userId!: string;
  @Column('jsonb', { default: {} }) traits!: Record<string, any>;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('cdp_events')
export class CdpEvent {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Index() @Column() type!: string;
  @Column('jsonb', { default: {} }) payload!: Record<string, any>;
  @CreateDateColumn() ts!: Date;
}

@Entity('cdp_segments')
export class Segment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @Column('jsonb') criteria!: any; // simple JSON criteria for demo (e.g., { trait.path: value } or event types)
  @UpdateDateColumn() updatedAt!: Date;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('cdp_campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @Column('jsonb', { default: {} }) config!: any; // channel, templateId, segmentId, schedule
  @UpdateDateColumn() updatedAt!: Date;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('cdp_journeys')
export class Journey {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @Column('jsonb') steps!: any[]; // [{when:event:type, action:{channel, templateId}}]
  @UpdateDateColumn() updatedAt!: Date;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('cdp_templates')
export class Template {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() name!: string;
  @Column() channel!: string; // whatsapp|push|email|sms
  @Column('text') body!: string;
  @UpdateDateColumn() updatedAt!: Date;
  @CreateDateColumn() createdAt!: Date;
}

@Entity('cdp_dispatches')
export class ChannelDispatch {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() userId!: string;
  @Column() channel!: string;
  @Column('jsonb', { default: {} }) payload!: any;
  @Column({ type: 'varchar', length: 16, default: 'queued' }) status!: 'queued' | 'sent' | 'failed';
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
