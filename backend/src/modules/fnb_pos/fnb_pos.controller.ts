import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FnbService } from './fnb_pos.service';

@Controller('fnb')
export class FnbController {
  constructor(private readonly svc: FnbService) {}

  // Catalog & outlets
  @Post('product') upsertProduct(@Body() b: { id?: string; sku: string; name: string; price: number; meta?: any }) { return this.svc.upsertProduct(b); }
  @Post('outlet') upsertOutlet(@Body() b: { id?: string; code: string; name: string; meta?: any }) { return this.svc.upsertOutlet(b); }

  // Inventory
  @Post('stock/set') setStock(@Body() b: { outletId: string; productId: string; onHand: number }) { return this.svc.setStock(b.outletId, b.productId, b.onHand); }
  @Post('stock/adjust') adjust(@Body() b: { outletId: string; productId: string; delta: number; meta?: any }) { return this.svc.adjustStock(b.outletId, b.productId, b.delta, b.meta); }
  @Get('stock/:outletId') list(@Param('outletId') outletId: string) { return this.svc.listInventory(outletId); }

  // POS sale ingest
  @Post('pos/ingest') ingest(@Body() b: { externalId: string; outletCode: string; userId?: string; lines: Array<{ sku: string; qty: number; unitPrice: number }> }) { return this.svc.ingestSale(b); }
}
