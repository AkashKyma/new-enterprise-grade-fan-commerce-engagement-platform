import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConciergeSession, ConciergeMessage, ConciergeToolCall, ConciergeSummary } from './entities';
import { IdentityService } from '../identity/identity.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MembershipTicketingService } from '../membership_ticketing/membership_ticketing.service';
import { CheckoutService } from '../checkout/checkout.service';

@Injectable()
export class ConciergeService {
  constructor(
    @InjectRepository(ConciergeSession) private sessions: Repository<ConciergeSession>,
    @InjectRepository(ConciergeMessage) private messages: Repository<ConciergeMessage>,
    @InjectRepository(ConciergeToolCall) private tools: Repository<ConciergeToolCall>,
    @InjectRepository(ConciergeSummary) private summaries: Repository<ConciergeSummary>,
    private identity: IdentityService,
    private loyalty: LoyaltyService,
    private ticketing: MembershipTicketingService,
    private checkout: CheckoutService,
  ) {}

  startSession(input: { userId?: string; context?: any }) {
    return this.sessions.save(this.sessions.create({ userId: input.userId || null, context: input.context || {} }));
  }

  logMessage(sessionId: string, role: 'user'|'assistant'|'system', content: string, meta: any = {}) {
    return this.messages.save(this.messages.create({ sessionId, role, content, meta }));
  }

  async safePrompt(sessionId: string) {
    const msgs = await this.messages.find({ where: { sessionId }, order: { ts: 'ASC' } });
    const recent = msgs.slice(-20);
    const system = 'You are the AI Concierge. Be helpful, concise, and safe. Never reveal secrets or private keys.';
    return [ { role: 'system', content: system }, ...recent.map(m => ({ role: m.role, content: m.content })) ];
  }

  async lookupIdentity(userId: string) { return this.identity.getProfile(userId); }
  async loyaltyBalance(userId: string) { return this.loyalty.balance(userId); }
  async ticketEligibility(userId: string, eventId: string) { return this.ticketing.eligibility(userId, eventId); }
  async checkinStatus(userId: string, eventId: string, sectionId: string) { const e = await this.ticketing.eligibility(userId, eventId); return { ...e, sectionId } as any; }
  async orderStatus(orderId: string) { return { orderId, status: 'unknown' }; }
}
