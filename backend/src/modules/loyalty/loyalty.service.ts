import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LoyaltyAccount, LedgerEntry, LoyaltyTier, BenefitRule, RewardCatalogItem, RewardRedemption } from './entities';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyAccount) private accounts: Repository<LoyaltyAccount>,
    @InjectRepository(LedgerEntry) private ledger: Repository<LedgerEntry>,
    @InjectRepository(LoyaltyTier) private tiers: Repository<LoyaltyTier>,
    @InjectRepository(BenefitRule) private rules: Repository<BenefitRule>,
    @InjectRepository(RewardCatalogItem) private catalog: Repository<RewardCatalogItem>,
    @InjectRepository(RewardRedemption) private redemptions: Repository<RewardRedemption>,
    private dataSource: DataSource,
  ) {}

  async ensureAccount(userId: string) {
    let acc = await this.accounts.findOne({ where: { userId } });
    if (!acc) acc = await this.accounts.save(this.accounts.create({ userId, points: 0 }));
    return acc;
  }

  async balance(userId: string) {
    const acc = await this.ensureAccount(userId);
    return { userId, points: acc.points };
  }

  async history(userId: string) {
    const rows = await this.ledger.find({ where: { userId }, order: { createdAt: 'DESC' } });
    return rows;
  }

  async earn(input: { userId: string; amount: number; idempotencyKey: string; meta?: any }) {
    if (input.amount <= 0) throw new BadRequestException('amount must be > 0');
    const existing = await this.ledger.findOne({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;
    return await this.dataSource.transaction(async (tx) => {
      const accRepo = tx.getRepository(LoyaltyAccount);
      const ledRepo = tx.getRepository(LedgerEntry);
      let acc = await accRepo.findOne({ where: { userId: input.userId }, lock: { mode: 'pessimistic_write' } });
      if (!acc) acc = accRepo.create({ userId: input.userId, points: 0 });
      acc.points += input.amount;
      await accRepo.save(acc);
      const entry = ledRepo.create({ userId: input.userId, direction: 'earn', amount: input.amount, meta: input.meta || {}, idempotencyKey: input.idempotencyKey });
      return ledRepo.save(entry);
    });
  }

  async redeem(input: { userId: string; rewardId: string; idempotencyKey: string }) {
    const existing = await this.redemptions.findOne({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;
    const reward = await this.catalog.findOneOrFail({ where: { id: input.rewardId, active: true } });
    return await this.dataSource.transaction(async (tx) => {
      const accRepo = tx.getRepository(LoyaltyAccount);
      const redRepo = tx.getRepository(RewardRedemption);
      const ledRepo = tx.getRepository(LedgerEntry);
      let acc = await accRepo.findOne({ where: { userId: input.userId }, lock: { mode: 'pessimistic_write' } });
      if (!acc || acc.points < reward.cost) throw new BadRequestException('insufficient points');
      acc.points -= reward.cost;
      await accRepo.save(acc);
      await ledRepo.save(ledRepo.create({ userId: input.userId, direction: 'redeem', amount: reward.cost, meta: { rewardId: input.rewardId }, idempotencyKey: input.idempotencyKey }));
      const result = { voucher: `VCHR-${Math.random().toString(36).slice(2,10)}`, payload: reward.payload };
      return redRepo.save(redRepo.create({ userId: input.userId, rewardId: input.rewardId, idempotencyKey: input.idempotencyKey, result }));
    });
  }

  async listRewards() { return this.catalog.find({ where: { active: true } }); }

  async upsertReward(i: { id?: string; name: string; cost: number; payload?: any; active?: boolean }) {
    const row = this.catalog.create({ ...(i.id ? { id: i.id } : {}), name: i.name, cost: i.cost, payload: i.payload || {}, active: i.active ?? true });
    return this.catalog.save(row);
  }
}
