import { Injectable } from '@nestjs/common';
import { FallbackProvider } from './fallback.provider';
import { RecommendationProvider } from './personalization.types';

@Injectable()
export class PersonalizationService {
  private providers: RecommendationProvider[];
  constructor(private fallback: FallbackProvider) {
    this.providers = [this.fallback];
  }
  private async firstNonEmpty<T>(fn: (p: RecommendationProvider) => Promise<T[]>): Promise<T[]> {
    for (const p of this.providers) {
      try { const items = await fn(p); if (items && items.length) return items; } catch (_) {}
    }
    return fn(this.fallback);
  }
  nextBestAction(input: { userId?: string; context?: any }) { return this.firstNonEmpty(p => p.nextBestActions(input)); }
  offers(input: { userId?: string; context?: any }) { return this.firstNonEmpty(p => p.offers(input)); }
  rewards(input: { userId?: string; context?: any }) { return this.firstNonEmpty(p => p.rewards(input)); }
  events(input: { userId?: string; context?: any }) { return this.firstNonEmpty(p => p.events(input)); }
  blocks(input: { userId?: string; context?: any }) { return this.firstNonEmpty(p => p.blocks(input)); }
}
