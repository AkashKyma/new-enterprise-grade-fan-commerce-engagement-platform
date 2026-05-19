import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { RewardCatalogItem } from '../modules/loyalty/entities';
import { MatchEvent } from '../modules/membership_ticketing/entities';

const ds = new DataSource({
  type: 'postgres', host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT||'5432',10),
  username: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD || 'postgres', database: process.env.DB_NAME || 'fan_platform',
  synchronize: true, entities: [RewardCatalogItem, MatchEvent]
});

(async () => {
  await ds.initialize();
  const rewards = ds.getRepository(RewardCatalogItem);
  const events = ds.getRepository(MatchEvent);
  if (!(await rewards.count())) {
    await rewards.save(rewards.create({ name: 'Free Soda', cost: 500, payload: { kind: 'voucher', sku: 'SODA' }, active: true }));
    await rewards.save(rewards.create({ name: 'Merch Discount 10%', cost: 1200, payload: { kind: 'discount', pct: 10 }, active: true }));
  }
  if (!(await events.count())) {
    await events.save(events.create({ name: 'Home Match A', date: new Date(Date.now()+86400000).toISOString(), meta: { opponent: 'Rivals' } }));
    await events.save(events.create({ name: 'Home Match B', date: new Date(Date.now()+172800000).toISOString(), meta: { opponent: 'Derby' } }));
  }
  console.log('Seeded demo rewards and events');
  process.exit(0);
})();
