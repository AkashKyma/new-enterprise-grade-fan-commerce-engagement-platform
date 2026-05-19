import { Body, Controller, Post } from '@nestjs/common';
import { GupshupAdapter } from './gupshup.adapter';
import { ZenviaAdapter } from './zenvia.adapter';

@Controller('webhooks')
export class WebhookController {
  constructor(private g: GupshupAdapter, private z: ZenviaAdapter) {}
  @Post('gupshup') gup(@Body() b: any) { return { events: this.g.normalizeWebhook(b) }; }
  @Post('zenvia') zen(@Body() b: any) { return { events: this.z.normalizeWebhook(b) }; }
}
