export interface PixChargeRequest { amount: number; description?: string }
export interface PixAdapter { createCharge(input: PixChargeRequest): Promise<{ qr: string; expiresIn: number }>; normalizeWebhook(payload: any): { paymentId?: string; status: 'paid'|'failed'|'pending'; raw: any } }

export class PixPlaceholderAdapter implements PixAdapter {
  async createCharge(input: PixChargeRequest) { return { qr: 'PIX:' + JSON.stringify(input), expiresIn: 300 }; }
  normalizeWebhook(payload: any) { return { status: 'paid', raw: payload }; }
}
