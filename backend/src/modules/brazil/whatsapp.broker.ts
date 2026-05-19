export interface WhatsAppMessage { to: string; body: string; mediaUrl?: string; template?: { name: string; params: any[] } }
export interface WhatsAppInbound { from: string; body?: string; payload?: any; provider: 'gupshup'|'zenvia' }
export interface WhatsAppBroker {
  send(msg: WhatsAppMessage): Promise<{ id: string; provider: string }>
  normalizeWebhook(payload: any): WhatsAppInbound[]
}
