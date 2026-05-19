import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoSeedService } from './demo-seed.service';
import { IdentityModule } from '../modules/identity/identity.module';
import { LoyaltyModule } from '../modules/loyalty/loyalty.module';
import { MarketplaceModule } from '../modules/marketplace/marketplace.module';
import { MembershipTicketingModule } from '../modules/membership_ticketing/membership_ticketing.module';
import { User, CustomerProfile, MembershipReference } from '../modules/identity/entities';
import { RewardCatalogItem } from '../modules/loyalty/entities';
import { MatchEvent } from '../modules/membership_ticketing/entities';
import { MarketplaceItem } from '../modules/marketplace/entities';

@Module({
  imports: [
    IdentityModule,
    LoyaltyModule,
    MarketplaceModule,
    MembershipTicketingModule,
    TypeOrmModule.forFeature([User, CustomerProfile, MembershipReference, RewardCatalogItem, MatchEvent, MarketplaceItem]),
  ],
  providers: [DemoSeedService],
})
export class SeedModule {}
