import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MembershipTicketingService } from './membership_ticketing.service';

@Controller('membership-ticketing')
export class MembershipTicketingController {
  constructor(private readonly svc: MembershipTicketingService) {}

  // Membership
  @Post('plan')
  createPlan(@Body() b: { code: string; name: string; benefits?: any }) { return this.svc.createPlan(b); }
  @Post('subscribe')
  subscribe(@Body() b: { userId: string; planCode: string }) { return this.svc.subscribe(b.userId, b.planCode); }

  // Events & venue
  @Post('event')
  createEvent(@Body() b: { name: string; date: string; sections: { name: string; capacity: number }[] }) { return this.svc.createEvent(b); }

  // Eligibility
  @Get('eligibility/:userId/:eventId')
  eligibility(@Param('userId') userId: string, @Param('eventId') eventId: string) { return this.svc.eligibility(userId, eventId); }

  // Reserve and check-in
  @Post('reserve')
  reserve(@Body() b: { userId: string; eventId: string; sectionId: string }) { return this.svc.reserve(b.userId, b.eventId, b.sectionId); }
  @Post('checkin')
  checkin(@Body() b: { userId: string; eventId: string; sectionId: string }) { return this.svc.checkin(b.userId, b.eventId, b.sectionId); }
}
