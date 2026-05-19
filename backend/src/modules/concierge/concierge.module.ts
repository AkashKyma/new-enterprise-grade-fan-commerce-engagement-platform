import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConciergeController } from './concierge.controller';
import { ConciergeService } from './concierge.service';
import { ConciergeSession, ConciergeMessage, ConciergeToolCall, ConciergeSummary } from './entities';
import { IdentityModule } from '../identity/identity.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { MembershipTicketingModule } from '../membership_ticketing/membership_ticketing.module';
import { CheckoutModule } from '../checkout/checkout.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConciergeSession, ConciergeMessage, ConciergeToolCall, ConciergeSummary]),
    IdentityModule,
    LoyaltyModule,
    MembershipTicketingModule,
    CheckoutModule,
  ],
  providers: [ConciergeService],
  controllers: [ConciergeController],
  exports: [ConciergeService],
})
export class ConciergeModule {}
