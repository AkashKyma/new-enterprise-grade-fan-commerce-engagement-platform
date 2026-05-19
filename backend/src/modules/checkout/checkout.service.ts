import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderLine, Payment, PaymentAttempt, OfflineSyncRecord } from './entities';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Order) private orders: Repository<Order>,
    @InjectRepository(OrderLine) private lines: Repository<OrderLine>,
    @InjectRepository(Payment) private payments: Repository<Payment>,
    @InjectRepository(PaymentAttempt) private attempts: Repository<PaymentAttempt>,
    @InjectRepository(OfflineSyncRecord) private syncs: Repository<OfflineSyncRecord>,
    private data: DataSource,
  ) {}

  async createOrder(userId: string) {
    return this.orders.save(this.orders.create({ userId, status: 'draft', total: 0, subtotal: 0, discount: 0, meta: {} }));
  }

  async addLine(orderId: string, item: { itemType: OrderLine['itemType']; itemRef: string; unitPrice: number; quantity: number; meta?: any }) {
    return this.data.transaction(async tx => {
      const oRepo = tx.getRepository(Order);
      const lRepo = tx.getRepository(OrderLine);
      const order = await oRepo.findOneOrFail({ where: { id: orderId } });
      const line = lRepo.create({ orderId, ...item, meta: item.meta || {} });
      await lRepo.save(line);
      const lines = await lRepo.find({ where: { orderId } });
      const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
      order.subtotal = subtotal;
      order.total = Math.max(0, subtotal - order.discount);
      await oRepo.save(order);
      return { order, line };
    });
  }

  async initPayment(orderId: string, method: any) {
    const order = await this.orders.findOneOrFail({ where: { id: orderId } });
    if (order.total <= 0) throw new BadRequestException('order total must be > 0');
    order.status = 'pending_payment';
    await this.orders.save(order);
    return this.payments.save(this.payments.create({ orderId: order.id, state: 'initialized', status: 'unpaid', amount: order.total, method }));
  }

  async recordAttempt(paymentId: string, request: any, response: any, outcome: 'pending'|'success'|'error') {
    const attempt = await this.attempts.save(this.attempts.create({ paymentId, request, response, outcome }));
    if (outcome === 'success') {
      const payment = await this.payments.findOneOrFail({ where: { id: paymentId } });
      payment.state = 'captured';
      payment.status = 'paid';
      await this.payments.save(payment);
      const order = await this.orders.findOneOrFail({ where: { id: payment.orderId } });
      order.status = 'paid';
      await this.orders.save(order);
    }
    if (outcome === 'error') {
      const payment = await this.payments.findOneOrFail({ where: { id: paymentId } });
      payment.state = 'failed';
      await this.payments.save(payment);
    }
    return attempt;
  }

  // Pix-ready adapter: create a placeholder charge
  async pixCharge(paymentId: string, details: { amount: number; description?: string }) {
    const payment = await this.payments.findOneOrFail({ where: { id: paymentId } });
    const req = { provider: 'pix', op: 'charge', details };
    const resp = { qr: `PIX:${paymentId}:${details.amount}`, expiresIn: 300 };
    return this.recordAttempt(paymentId, req, resp, 'pending');
  }

  // Reconciliation webhook (e.g., Pix paid notification)
  async reconcilePaid(paymentId: string, providerPayload: any) {
    const attempt = await this.recordAttempt(paymentId, { provider: 'pix', op: 'reconcile' }, providerPayload, 'success');
    return attempt;
  }

  // Offline queue for POS; device stores locally and later syncs here
  async queueOffline(deviceId: string, payload: any) {
    return this.syncs.save(this.syncs.create({ deviceId, payload, state: 'queued' }));
  }

  async markSynced(id: string) {
    const rec = await this.syncs.findOneOrFail({ where: { id } });
    rec.state = 'synced';
    return this.syncs.save(rec);
  }
}
