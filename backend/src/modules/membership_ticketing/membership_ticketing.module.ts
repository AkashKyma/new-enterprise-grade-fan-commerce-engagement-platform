import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipPlan, MembershipSubscription, MatchEvent, VenueSection, TicketInventory, TicketEntitlement, Allocation, CheckInRecord, AccessCredentialReference } from './entities';
import { MembershipTicketingService } from './membership_ticketing.service';
import { MembershipTicketingController } from './membership_ticketing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipPlan, MembershipSubscription, MatchEvent, VenueSection, TicketInventory, TicketEntitlement, Allocation, CheckInRecord, AccessCredentialReference])],
  providers: [MembershipTicketingService],
  controllers: [MembershipTicketingController],
  exports: [MembershipTicketingService],
})
export class MembershipTicketingModule {}
