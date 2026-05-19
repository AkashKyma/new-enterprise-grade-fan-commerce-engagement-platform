import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('concierge_sessions')
export class ConciergeSession {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column({ nullable: true }) userId!: string | null;
  @Column('jsonb', { default: {} }) context!: any;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity('concierge_messages')
export class ConciergeMessage {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() sessionId!: string;
  @Column() role!: 'user'|'assistant'|'system';
  @Column('text') content!: string;
  @Column('jsonb', { default: {} }) meta!: any;
  @CreateDateColumn() ts!: Date;
}

@Entity('concierge_tool_calls')
export class ConciergeToolCall {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() sessionId!: string;
  @Column() tool!: string;
  @Column('jsonb', { default: {} }) request!: any;
  @Column('jsonb', { default: {} }) response!: any;
  @CreateDateColumn() ts!: Date;
}

@Entity('concierge_summaries')
export class ConciergeSummary {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column() sessionId!: string;
  @Column('text') summary!: string;
  @UpdateDateColumn() updatedAt!: Date;
}
