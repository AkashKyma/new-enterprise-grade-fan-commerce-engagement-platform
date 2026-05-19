import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RetailService } from './retail_pos.service';

@Controller('retail')
export class RetailController {
  constructor(private readonly svc: RetailService) {}

  // Catalog
  @Post('product') upsertProduct(@Body() b: { id?: string; sku: string; name: string; meta?: any }) { return this.svc.upsertProduct(b); }
  @Post('variant') upsertVariant(@Body() b: { id?: string; productId: string; sku: string; attrs?: any; price: number }) { return this.svc.upsertVariant(b); }
  @Post('location') upsertLocation(@Body() b: { id?: string; code: string; name: string; meta?: any }) { return this.svc.upsertLocation(b); }

  // Stock
  @Post('central/set') setCentral(@Body() b: { variantId: string; onHand: number }) { return this.svc.setCentral(b.variantId, b.onHand); }
  @Post('stock/adjust') adjust(@Body() b: { locationId: string; variantId: string; delta: number; meta?: any }) { return this.svc.adjustLocation(b.locationId, b.variantId, b.delta, b.meta); }
  @Post('stock/transfer') transfer(@Body() b: { variantId: string; locationId: string; qty: number }) { return this.svc.transferToLocation(b.variantId, b.locationId, b.qty); }

  // Sales/returns
  @Post('pos/ingest') ingest(@Body() b: { externalId: string; locationCode: string; userId?: string; lines: Array<{ sku: string; qty: number; unitPrice: number }> }) { return this.svc.ingestSale(b); }
  @Post('return') returnItems(@Body() b: { saleReceiptId: string; items: Array<{ variantId: string; qty: number }> }) { return this.svc.returnItems(b); }

  // Views
  @Get('central/:variantId') central(@Param('variantId') variantId: string) { return this.svc.centralView(variantId); }
  @Get('stock/:locationId/:variantId') location(@Param('locationId') lid: string, @Param('variantId') vid: string) { return this.svc.locationView(lid, vid); }
}
