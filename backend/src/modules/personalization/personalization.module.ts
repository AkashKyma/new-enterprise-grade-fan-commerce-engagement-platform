import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalizationController } from './personalization.controller';
import { PersonalizationService } from './personalization.service';
import { FallbackProvider } from './fallback.provider';
import { RewardCatalogItem } from '../loyalty/entities';
import { MatchEvent } from '../membership_ticketing/entities';

@Module({
  imports: [TypeOrmModule.forFeature([RewardCatalogItem, MatchEvent])],
  providers: [PersonalizationService, FallbackProvider],
  controllers: [PersonalizationController],
  exports: [PersonalizationService],
})
export class PersonalizationModule {}
