import { Body, Controller, Get, Param, Post } from @nestjs/common;
import { CdpService } from ./cdp.service;

@Controller(cdp)
export class CdpController {
  constructor(private readonly svc: CdpService) {}

  @Post(ingest)
  ingest(@Body() body: { userId: string; type: string; payload?: any }) {
    return this.svc.ingest(body);
  }

  @Post(segment)
  upsertSegment(@Body() body: { id?: string; name: string; criteria: any }) {
    return this.svc.upsertSegment(body);
  }

  @Get(segment/:id/run)
  runSegment(@Param(id) id: string) {
    return this.svc.runSegment(id);
  }

  @Post(template)
  createTemplate(@Body() body: { name: string; channel: string; body: string }) {
    return this.svc.createTemplate(body);
  }

  @Post(campaign)
  createCampaign(@Body() body: { name: string; config: any }) {
    return this.svc.createCampaign(body);
  }

  @Post(campaign/:id/trigger)
  triggerCampaign(@Param(id) id: string) {
    return this.svc.triggerCampaign(id);
  }
}
