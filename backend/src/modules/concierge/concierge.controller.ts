import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConciergeService } from './concierge.service';

@Controller('concierge')
export class ConciergeController {
  constructor(private readonly svc: ConciergeService) {}

  @Post('session') start(@Body() b: { userId?: string; context?: any }) { return this.svc.startSession(b); }
  @Post('session/:id/message') msg(@Param('id') id: string, @Body() b: { role: 'user'|'assistant'|'system'; content: string; meta?: any }) { return this.svc.logMessage(id, b.role, b.content, b.meta); }
  @Get('session/:id/prompt') prompt(@Param('id') id: string) { return this.svc.safePrompt(id); }

  @Get('identity/:userId') identity(@Param('userId') uid: string) { return this.svc.lookupIdentity(uid); }
  @Get('loyalty/:userId/balance') balance(@Param('userId') uid: string) { return this.svc.loyaltyBalance(uid); }
  @Get('ticket/:userId/eligibility/:eventId') eligibility(@Param('userId') uid: string, @Param('eventId') eid: string) { return this.svc.ticketEligibility(uid, eid); }
  @Get('checkin/:userId/:eventId/:sectionId') checkin(@Param('userId') uid: string, @Param('eventId') eid: string, @Param('sectionId') sid: string) { return this.svc.checkinStatus(uid, eid, sid); }
  @Get('order/:orderId/status') order(@Param('orderId') oid: string) { return this.svc.orderStatus(oid); }
}
