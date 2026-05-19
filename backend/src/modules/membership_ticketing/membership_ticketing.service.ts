import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MembershipPlan, MembershipSubscription, MatchEvent, VenueSection, TicketInventory, TicketEntitlement, Allocation, CheckInRecord } from './entities';

@Injectable()
export class MembershipTicketingService {
  constructor(
    @InjectRepository(MembershipPlan) private plans: Repository<MembershipPlan>,
    @InjectRepository(MembershipSubscription) private subs: Repository<MembershipSubscription>,
    @InjectRepository(MatchEvent) private events: Repository<MatchEvent>,
    @InjectRepository(VenueSection) private sections: Repository<VenueSection>,
    @InjectRepository(TicketInventory) private inv: Repository<TicketInventory>,
    @InjectRepository(TicketEntitlement) private ent: Repository<TicketEntitlement>,
    @InjectRepository(Allocation) private alloc: Repository<Allocation>,
    @InjectRepository(CheckInRecord) private checkins: Repository<CheckInRecord>,
    private data: DataSource,
  ) {}

  // Membership
  createPlan(input: { code: string; name: string; benefits?: any }) { return this.plans.save(this.plans.create({ ...input, benefits: input.benefits || {} })); }
  async subscribe(userId: string, planCode: string) {
    const plan = await this.plans.findOneOrFail({ where: { code: planCode } });
    const sub = this.subs.create({ userId, planId: plan.id, active: true });
    return this.subs.save(sub);
  }

  // Events & venue
  async createEvent(input: { name: string; date: string; sections: { name: string; capacity: number }[] }) {
    const ev = await this.events.save(this.events.create({ name: input.name, date: input.date, meta: {} }));
    for (const s of input.sections) {
      const sec = await this.sections.save(this.sections.create({ eventId: ev.id, name: s.name, capacity: s.capacity }));
      await this.inv.save(this.inv.create({ eventId: ev.id, sectionId: sec.id, total: s.capacity, reserved: 0, sold: 0 }));
    }
    return ev;
  }

  // Eligibility
  async eligibility(userId: string, eventId: string) {
    const sub = await this.subs.findOne({ where: { userId, active: true } });
    const event = await this.events.findOneOrFail({ where: { id: eventId } });
    const now = new Date();
    const eventDate = new Date(event.date);
    const isMember = !!sub;
    const windowOpen = isMember ? true : (eventDate.getTime() - now.getTime()) < 1000*60*60*24*7;
    if (!windowOpen) return { eligible: false, reason: 'window_closed' };
    return { eligible: true, isMember };
  }

  // Reserve as inventory
  async reserve(userId: string, eventId: string, sectionId: string) {
    return this.data.transaction(async (tx) => {
      const invRepo = tx.getRepository(TicketInventory);
      const entRepo = tx.getRepository(TicketEntitlement);
      let row = await invRepo.findOneOrFail({ where: { eventId, sectionId }, lock: { mode: 'pessimistic_write' } });
      if (row.reserved + row.sold >= row.total) throw new BadRequestException('sold_out');
      row.reserved += 1; await invRepo.save(row);
      return entRepo.save(entRepo.create({ userId, eventId, sectionId, status: 'reserved', meta: { reservedAt: new Date().toISOString() } }));
    });
  }

  // Check-in flow
  async checkin(userId: string, eventId: string, sectionId: string) {
    return this.data.transaction(async (tx) => {
      const entRepo = tx.getRepository(TicketEntitlement);
      const chkRepo = tx.getRepository(CheckInRecord);
      const ent = await entRepo.findOneOrFail({ where: { userId, eventId, sectionId, status: 'reserved' }, lock: { mode: 'pessimistic_write' } });
      ent.status = 'checked_in';
      await entRepo.save(ent);
      return chkRepo.save(chkRepo.create({ userId, eventId, sectionId, meta: {} }));
    });
  }
}
