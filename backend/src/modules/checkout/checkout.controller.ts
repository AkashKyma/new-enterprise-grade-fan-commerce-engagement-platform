import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly svc: CheckoutService) {}

  @Post('order')
  create(@Body() b: { userId: string }) { return this.svc.createOrder(b.userId); }

  @Post('order/:orderId/line')
  addLine(@Param('orderId') orderId: string, @Body() b: { itemType: 'ticket'|'retail'|'fnb'|'marketplace'|'service'; itemRef: string; unitPrice: number; quantity: number; meta?: any }) {
    return this.svc.addLine(orderId, b);
  }

  @Post('order/:orderId/payment')
  initPayment(@Param('orderId') orderId: string, @Body() b: { method: any }) { return this.svc.initPayment(orderId, b.method); }

  @Post('payment/:paymentId/pix/charge')
  pixCharge(@Param('paymentId') pid: string, @Body() b: { amount: number; description?: string }) { return this.svc.pixCharge(pid, b); }

  @Post('payment/:paymentId/reconcile')
  reconcile(@Param('paymentId') pid: string, @Body() b: any) { return this.svc.reconcilePaid(pid, b); }

  @Post('offline/queue')
  queueOffline(@Body() b: { deviceId: string; payload: any }) { return this.svc.queueOffline(b.deviceId, b.payload); }

  @Post('offline/:id/synced')
  markSynced(@Param('id') id: string) { return this.svc.markSynced(id); }
}
