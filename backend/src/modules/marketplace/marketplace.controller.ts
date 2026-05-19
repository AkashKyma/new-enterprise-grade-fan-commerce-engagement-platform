import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly svc: MarketplaceService) {}

  // Vendor + Items
  @Post('vendor') upsertVendor(@Body() b: { id?: string; code: string; name: string; meta?: any }) { return this.svc.upsertVendor(b); }
  @Post('item') upsertItem(@Body() b: { id?: string; sku: string; title: string; price: number; vendorId?: string|null; meta?: any }) { return this.svc.upsertItem(b); }
  @Get('items') list() { return this.svc.listItems(); }

  // Cart
  @Post('cart/add') add(@Body() b: { userId: string; sku: string; qty: number }) { return this.svc.addToCart(b.userId, b.sku, b.qty); }
  @Get('cart/:userId') view(@Param('userId') uid: string) { return this.svc.viewCart(uid); }
  @Post('cart/:userId/clear') clear(@Param('userId') uid: string) { return this.svc.clearCart(uid); }

  // Order
  @Post('order/:userId/create') createOrder(@Param('userId') uid: string) { return this.svc.createOrderFromCart(uid); }
  @Post('order/:orderId/status') setStatus(@Param('orderId') oid: string, @Body() b: { status: 'created'|'pending_payment'|'paid'|'fulfilled'|'cancelled' }) { return this.svc.markOrderStatus(oid, b.status); }
}
