import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyAccount, LedgerEntry, LoyaltyTier, BenefitRule, RewardCatalogItem, RewardRedemption } from './entities';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltyAccount, LedgerEntry, LoyaltyTier, BenefitRule, RewardCatalogItem, RewardRedemption])],
  providers: [LoyaltyService],
  controllers: [LoyaltyController],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
