export type RecommendationItem = {
  id: string;
  kind: 'offer'|'reward'|'event'|'block';
  title: string;
  subtitle?: string;
  image?: string;
  cta?: { label: string; href?: string; action?: string; payload?: any };
  meta?: Record<string, any>;
};

export interface RecommendationProvider {
  nextBestActions(input: { userId?: string; context?: any }): Promise<RecommendationItem[]>;
  offers(input: { userId?: string; context?: any }): Promise<RecommendationItem[]>;
  rewards(input: { userId?: string; context?: any }): Promise<RecommendationItem[]>;
  events(input: { userId?: string; context?: any }): Promise<RecommendationItem[]>;
  blocks(input: { userId?: string; context?: any }): Promise<RecommendationItem[]>;
}
