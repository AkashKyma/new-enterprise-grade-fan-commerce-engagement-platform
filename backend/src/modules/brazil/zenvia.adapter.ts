import { Injectable } from '@nestjs/common';
import { WhatsAppBroker, WhatsAppMessage, WhatsAppInbound } from './whatsapp.broker';

@Injectable()
export class ZenviaAdapter implements WhatsAppBroker {
  async send(_msg: WhatsAppMessage): Promise<{ id: string; provider: string }> { return { id: 'znv-'+Math.random().toString(36).slice(2), provider: 'zenvia' }; }
  normalizeWebhook(payload: any): WhatsAppInbound[] {
    if (payload?.message) {
      return [{ from: payload.message.from, body: payload.message.contents?.[0]?.text, payload, provider: 'zenvia' }];
    }
    return [];
  }
}
