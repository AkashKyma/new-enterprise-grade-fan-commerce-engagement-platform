import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendationProvider, RecommendationItem } from './personalization.types';
import { RewardCatalogItem } from '../loyalty/entities';
import { MatchEvent } from '../membership_ticketing/entities';

@Injectable()
export class FallbackProvider implements RecommendationProvider {
  constructor(
    @InjectRepository(RewardCatalogItem) private rewardsRepo: Repository<RewardCatalogItem>,
    @InjectRepository(MatchEvent) private eventsRepo: Repository<MatchEvent>,
  ) {}

  async nextBestActions(input: { userId?: string; context?: any }): Promise<RecommendationItem[]> {
    const items: RecommendationItem[] = [];
    if (!input.userId) {
      items.push({ id: 'nba-signin', kind: 'block', title: 'Sign in to unlock personalized perks', cta: { label: 'Sign in', action: 'auth.signin' } });
    } else {
      items.push({ id: 'nba-rewards', kind: 'block', title: 'Check your rewards', subtitle: 'Redeem your points', cta: { label: 'View rewards', action: 'loyalty.open' } });
      items.push({ id: 'nba-events', kind: 'block', title: 'Upcoming events', subtitle: 'Reserve your place', cta: { label: 'Browse events', action: 'events.open' } });
    }
    return items;
  }

  async offers(_input: { userId?: string; context?: any }): Promise<RecommendationItem[]> {
    return [
      { id: 'offer-generic-1', kind: 'offer', title: '10% off kiosk purchases before kickoff', meta: { channel: 'kiosk' } },
      { id: 'offer-generic-2', kind: 'offer', title: 'Combo deal at concession stands', meta: { channel: 'fnb' } },
    ];
  }

  async rewards(_input: { userId?: string; context?: any }): Promise<RecommendationItem[]> {
    const rows = await this.rewardsRepo.find({ where: { active: true } });
    return rows.slice(0, 8).map(r => ({ id: r.id, kind: 'reward', title: r.name, subtitle: `${r.cost} pts`, meta: { rewardId: r.id, cost: r.cost } }));
  }

  async events(_input: { userId?: string; context?: any }): Promise<RecommendationItem[]> {
    const now = new Date().toISOString();
    const rows = await this.eventsRepo.createQueryBuilder('e').where('e.date >= :now', { now }).orderBy('e.date', 'ASC').limit(8).getMany();
    return rows.map(e => ({ id: e.id, kind: 'event', title: e.name, subtitle: new Date(e.date).toLocaleString(), meta: { eventId: e.id } }));
  }

  async blocks(input: { userId?: string; context?: any }): Promise<RecommendationItem[]> {
    const [offers, events, rewards] = await Promise.all([
      this.offers(input), this.events(input), this.rewards(input)
    ]);
    return [
      { id: 'hero', kind: 'block', title: 'Welcome to MatchDay', subtitle: input.userId ? 'Great to see you again' : 'Join to unlock more', meta: { layout: 'hero' } },
      { id: 'offers', kind: 'block', title: 'Recommended Offers', meta: { layout: 'carousel', items: offers } },
      { id: 'events', kind: 'block', title: 'Upcoming Events', meta: { layout: 'list', items: events } },
      { id: 'rewards', kind: 'block', title: 'Top Rewards', meta: { layout: 'carousel', items: rewards } },
    ];
  }
}
