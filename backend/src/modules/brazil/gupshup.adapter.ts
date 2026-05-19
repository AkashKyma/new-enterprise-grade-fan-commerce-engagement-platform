import { Injectable } from '@nestjs/common';
import { WhatsAppBroker, WhatsAppMessage, WhatsAppInbound } from './whatsapp.broker';

@Injectable()
export class GupshupAdapter implements WhatsAppBroker {
  async send(_msg: WhatsAppMessage): Promise<{ id: string; provider: string }> { return { id: 'gshp-'+Math.random().toString(36).slice(2), provider: 'gupshup' }; }
  normalizeWebhook(payload: any): WhatsAppInbound[] {
    if (payload?.payload?.type === 'message') {
      return [{ from: payload.payload.sender?.phone || payload.sender?.phone, body: payload.payload.text, payload, provider: 'gupshup' }];
    }
    return [];
  }
}
