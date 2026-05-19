import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RetailProduct, RetailVariant, RetailLocation, RetailCentralLevel, RetailLocationLevel, RetailStockMovement, RetailSaleReceipt, RetailReturnRecord } from './entities';

@Injectable()
export class RetailService {
  constructor(
    @InjectRepository(RetailProduct) private products: Repository<RetailProduct>,
    @InjectRepository(RetailVariant) private variants: Repository<RetailVariant>,
    @InjectRepository(RetailLocation) private locations: Repository<RetailLocation>,
    @InjectRepository(RetailCentralLevel) private central: Repository<RetailCentralLevel>,
    @InjectRepository(RetailLocationLevel) private levels: Repository<RetailLocationLevel>,
    @InjectRepository(RetailStockMovement) private moves: Repository<RetailStockMovement>,
    @InjectRepository(RetailSaleReceipt) private receipts: Repository<RetailSaleReceipt>,
    @InjectRepository(RetailReturnRecord) private returns: Repository<RetailReturnRecord>,
    private data: DataSource,
  ) {}

  // Catalog
  upsertProduct(p: { id?: string; sku: string; name: string; meta?: any }) { const row = this.products.create({ ...(p.id?{id:p.id}:{}) as any, sku: p.sku, name: p.name, meta: p.meta || {} }); return this.products.save(row); }
  upsertVariant(v: { id?: string; productId: string; sku: string; attrs?: any; price: number }) { const row = this.variants.create({ ...(v.id?{id:v.id}:{}) as any, productId: v.productId, sku: v.sku, attrs: v.attrs || {}, price: v.price }); return this.variants.save(row); }
  upsertLocation(l: { id?: string; code: string; name: string; meta?: any }) { const row = this.locations.create({ ...(l.id?{id:l.id}:{}) as any, code: l.code, name: l.name, meta: l.meta || {} }); return this.locations.save(row); }

  // Central stock
  async setCentral(variantId: string, onHand: number) { let lvl = await this.central.findOne({ where: { variantId } }); if (!lvl) lvl = this.central.create({ variantId, onHand }); lvl.onHand = onHand; return this.central.save(lvl); }

  // Per-location stock adjustment with movement logging
  async adjustLocation(locationId: string, variantId: string, delta: number, meta: any = {}) {
    return this.data.transaction(async tx => {
      const lvlRepo = tx.getRepository(RetailLocationLevel);
      let lvl = await lvlRepo.findOne({ where: { locationId, variantId }, lock: { mode: 'pessimistic_write' } });
      if (!lvl) lvl = lvlRepo.create({ locationId, variantId, onHand: 0 });
      const next = lvl.onHand + delta; if (next < 0) throw new BadRequestException('insufficient stock');
      lvl.onHand = next; await lvlRepo.save(lvl);
      await tx.getRepository(RetailStockMovement).save(tx.getRepository(RetailStockMovement).create({ variantId, locationId, kind: delta>=0?'in':'out', quantity: Math.abs(delta), meta }));
      return lvl;
    });
  }

  // Transfer central -> location
  async transferToLocation(variantId: string, locationId: string, qty: number) {
    if (qty <= 0) throw new BadRequestException('qty must be > 0');
    return this.data.transaction(async tx => {
      const centralRepo = tx.getRepository(RetailCentralLevel);
      const locRepo = tx.getRepository(RetailLocationLevel);
      const moveRepo = tx.getRepository(RetailStockMovement);
      let c = await centralRepo.findOne({ where: { variantId }, lock: { mode: 'pessimistic_write' } });
      if (!c || c.onHand < qty) throw new BadRequestException('insufficient central');
      c.onHand -= qty; await centralRepo.save(c);
      let l = await locRepo.findOne({ where: { locationId, variantId }, lock: { mode: 'pessimistic_write' } });
      if (!l) l = locRepo.create({ locationId, variantId, onHand: 0 });
      l.onHand += qty; await locRepo.save(l);
      await moveRepo.save(moveRepo.create({ variantId, locationId: null, kind: 'transfer', quantity: -qty, meta: { to: locationId } }));
      await moveRepo.save(moveRepo.create({ variantId, locationId, kind: 'transfer', quantity: qty, meta: { from: 'central' } }));
      return { central: c, location: l };
    });
  }

  // Sale ingestion (per-location)
  async ingestSale(payload: { externalId: string; locationCode: string; userId?: string; lines: Array<{ sku: string; qty: number; unitPrice: number }> }) {
    const exists = await this.receipts.findOne({ where: { externalId: payload.externalId } }); if (exists) return exists;
    const loc = await this.locations.findOneOrFail({ where: { code: payload.locationCode } });
    return this.data.transaction(async tx => {
      const varRepo = tx.getRepository(RetailVariant);
      const lvlRepo = tx.getRepository(RetailLocationLevel);
      const moveRepo = tx.getRepository(RetailStockMovement);
      let total = 0; const lines: any[] = [];
      for (const l of payload.lines) {
        const variant = await varRepo.findOneOrFail({ where: { sku: l.sku } });
        let lvl = await lvlRepo.findOne({ where: { locationId: loc.id, variantId: variant.id }, lock: { mode: 'pessimistic_write' } });
        if (!lvl || lvl.onHand < l.qty) throw new BadRequestException('insufficient stock');
        lvl.onHand -= l.qty; await lvlRepo.save(lvl);
        await moveRepo.save(moveRepo.create({ variantId: variant.id, locationId: loc.id, kind: 'out', quantity: l.qty, meta: { reason: 'sale', externalId: payload.externalId } }));
        const subtotal = l.qty * l.unitPrice; total += subtotal; lines.push({ variantId: variant.id, sku: variant.sku, qty: l.qty, unitPrice: l.unitPrice, subtotal });
      }
      const receipt = await tx.getRepository(RetailSaleReceipt).save(tx.getRepository(RetailSaleReceipt).create({ externalId: payload.externalId, locationId: loc.id, userId: (payload.userId || 'anonymous') as any, total, lines }));
      return receipt;
    });
  }

  // Returns
  async returnItems(payload: { saleReceiptId: string; items: Array<{ variantId: string; qty: number }> }) {
    return this.data.transaction(async tx => {
      const sale = await tx.getRepository(RetailSaleReceipt).findOneOrFail({ where: { id: payload.saleReceiptId } });
      const lvlRepo = tx.getRepository(RetailLocationLevel);
      const retRepo = tx.getRepository(RetailReturnRecord);
      const moveRepo = tx.getRepository(RetailStockMovement);
      for (const it of payload.items) {
        let lvl = await lvlRepo.findOne({ where: { locationId: sale.locationId, variantId: it.variantId }, lock: { mode: 'pessimistic_write' } });
        if (!lvl) lvl = lvlRepo.create({ locationId: sale.locationId, variantId: it.variantId, onHand: 0 });
        lvl.onHand += it.qty; await lvlRepo.save(lvl);
        await moveRepo.save(moveRepo.create({ variantId: it.variantId, locationId: sale.locationId, kind: 'return', quantity: it.qty, meta: { saleReceiptId: sale.id } }));
        await retRepo.save(retRepo.create({ saleReceiptId: sale.id, variantId: it.variantId, locationId: sale.locationId, qty: it.qty, meta: {} }));
      }
      return { ok: true };
    });
  }

  // Visibility helpers
  centralView(variantId: string) { return this.central.findOne({ where: { variantId } }); }
  locationView(locationId: string, variantId: string) { return this.levels.findOne({ where: { locationId, variantId } }); }
}
