import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, CustomerProfile, MembershipReference } from '../modules/identity/entities';
import { IdentityService } from '../modules/identity/identity.service';
import { LoyaltyService } from '../modules/loyalty/loyalty.service';
import { MarketplaceService } from '../modules/marketplace/marketplace.service';
import { MembershipTicketingService } from '../modules/membership_ticketing/membership_ticketing.service';
import { RewardCatalogItem } from '../modules/loyalty/entities';
import { MatchEvent } from '../modules/membership_ticketing/entities';
import { MarketplaceItem } from '../modules/marketplace/entities';

const DEMO_EMAIL = 'fan@coxa.com';
const DEMO_PASSWORD = 'demo1234';

@Injectable()
export class DemoSeedService implements OnModuleInit {
  private readonly log = new Logger(DemoSeedService.name);

  constructor(
    private readonly identity: IdentityService,
    private readonly loyalty: LoyaltyService,
    private readonly marketplace: MarketplaceService,
    private readonly ticketing: MembershipTicketingService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(CustomerProfile) private readonly profiles: Repository<CustomerProfile>,
    @InjectRepository(MembershipReference) private readonly memberships: Repository<MembershipReference>,
    @InjectRepository(RewardCatalogItem) private readonly rewards: Repository<RewardCatalogItem>,
    @InjectRepository(MatchEvent) private readonly events: Repository<MatchEvent>,
    @InjectRepository(MarketplaceItem) private readonly items: Repository<MarketplaceItem>,
  ) {}

  async onModuleInit() {
    if (process.env.SEED_DEMO === 'false') return;
    try {
      await this.run();
    } catch (e) {
      this.log.warn(`Demo seed skipped or partial: ${e instanceof Error ? e.message : e}`);
    }
  }

  async run() {
    const user = await this.ensureDemoUser();
    await this.ensurePlan();
    await this.ensureMembership(user.id);
    await this.ensureLoyalty(user.id);
    await this.ensureRewards();
    await this.ensureEvents();
    await this.ensureShop();
    this.log.log(`Demo data ready — sign in with ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }

  private async ensureDemoUser() {
    let user = await this.users.findOne({ where: { email: DEMO_EMAIL } });
    if (!user) {
      const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
      user = await this.identity.createUser({ email: DEMO_EMAIL, passwordHash: hash, role: 'customer' });
      this.log.log('Created demo fan account');
    }
    const profile = await this.profiles.findOne({ where: { userId: user.id } });
    if (profile) {
      profile.traits = { ...profile.traits, name: 'João Silva', city: 'Curitiba', fanSince: 2018 };
      await this.profiles.save(profile);
    }
    return user;
  }

  private async ensurePlan() {
    try {
      await this.ticketing.createPlan({
        code: 'OURO',
        name: 'Sócio Ouro',
        benefits: { discountPct: 15, priorityWindowMins: 120 },
      });
    } catch {
      /* plan already exists */
    }
  }

  private async ensureMembership(userId: string) {
    const ref = await this.memberships.findOne({ where: { userId } });
    if (ref && !ref.membershipId) {
      ref.membershipId = 'SOCIO-OURO-2026';
      ref.meta = { plan: 'Ouro', since: '2024-01-15' };
      await this.memberships.save(ref);
    }
    try {
      await this.ticketing.subscribe(userId, 'OURO');
    } catch {
      /* plan may already exist */
    }
  }

  private async ensureLoyalty(userId: string) {
    const acc = await this.loyalty.ensureAccount(userId);
    if (acc.points < 2500) {
      await this.loyalty.earn({
        userId,
        amount: 2500 - acc.points,
        idempotencyKey: `demo-seed-${userId}`,
        meta: { source: 'demo_seed', note: 'Welcome bonus' },
      });
    }
  }

  private async ensureRewards() {
    if (await this.rewards.count()) return;
    await this.loyalty.upsertReward({ name: 'Free soda at kiosk', cost: 500, payload: { kind: 'voucher' }, active: true });
    await this.loyalty.upsertReward({ name: '10% off official store', cost: 1200, payload: { kind: 'discount', pct: 10 }, active: true });
    await this.loyalty.upsertReward({ name: 'Match-day parking pass', cost: 2000, payload: { kind: 'parking' }, active: true });
    await this.loyalty.upsertReward({ name: 'VIP lounge upgrade', cost: 5000, payload: { kind: 'upgrade' }, active: true });
  }

  private async ensureEvents() {
    if (await this.events.count()) return;
    const sections = [
      { name: 'North Stand', capacity: 1200 },
      { name: 'South Stand', capacity: 1200 },
      { name: 'East Tribine', capacity: 800 },
      { name: 'VIP Box', capacity: 150 },
    ];
    await this.ticketing.createEvent({
      name: 'Coxa vs Athletico-PR',
      date: new Date(Date.now() + 5 * 86400000).toISOString(),
      sections,
    });
    await this.ticketing.createEvent({
      name: 'Coxa vs Coritiba (Derby)',
      date: new Date(Date.now() + 12 * 86400000).toISOString(),
      sections,
    });
  }

  private async ensureShop() {
    if (await this.items.count()) return;
    const vendorResult = await this.marketplace.upsertVendor({ code: 'CLUB_STORE', name: 'Official Club Store' });
    const vendor = Array.isArray(vendorResult) ? vendorResult[0] : vendorResult;
    const products = [
      { sku: 'JERSEY-HOME-24', title: 'Home Jersey 2024/25', price: 249, meta: { category: 'jersey' } },
      { sku: 'SCARF-GREEN', title: 'Green Supporter Scarf', price: 89, meta: { category: 'accessory' } },
      { sku: 'CAP-LOGO', title: 'Club Logo Cap', price: 69, meta: { category: 'accessory' } },
      { sku: 'MUG-STADIUM', title: 'Stadium Mug', price: 45, meta: { category: 'gift' } },
      { sku: 'BUNDLE-MATCHDAY', title: 'Matchday Bundle (scarf + pin)', price: 119, meta: { category: 'bundle' } },
    ];
    for (const p of products) {
      await this.marketplace.upsertItem({ ...p, vendorId: vendor.id });
    }
  }
}
