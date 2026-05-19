import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FnbProduct, FnbOutlet, FnbInventoryLevel, FnbStockMovement, FnbReceipt } from './entities';

@Injectable()
export class FnbService {
  constructor(
    @InjectRepository(FnbProduct) private products: Repository<FnbProduct>,
    @InjectRepository(FnbOutlet) private outlets: Repository<FnbOutlet>,
    @InjectRepository(FnbInventoryLevel) private inv: Repository<FnbInventoryLevel>,
    @InjectRepository(FnbStockMovement) private moves: Repository<FnbStockMovement>,
    @InjectRepository(FnbReceipt) private receipts: Repository<FnbReceipt>,
    private data: DataSource,
  ) {}

  // Catalog & Outlets
  upsertProduct(p: { sku: string; name: string; price: number; meta?: any }) {
    const row = this.products.create({ sku: p.sku, name: p.name, price: p.price, meta: p.meta || {} } as any);
    (row as any).id = (p as any).id; // allow update when id present
    return this.products.save(row);
  }
  upsertOutlet(o: { code: string; name: string; meta?: any }) {
    const row = this.outlets.create({ code: o.code, name: o.name, meta: o.meta || {} } as any);
    (row as any).id = (o as any).id;
    return this.outlets.save(row);
  }

  async setStock(outletId: string, productId: string, onHand: number) {
    let lvl = await this.inv.findOne({ where: { outletId, productId } });
    if (!lvl) lvl = this.inv.create({ outletId, productId, onHand });
    lvl.onHand = onHand;
    return this.inv.save(lvl);
  }

  async adjustStock(outletId: string, productId: string, delta: number, meta: any = {}) {
    return this.data.transaction(async tx => {
      const repo = tx.getRepository(FnbInventoryLevel);
      let lvl = await repo.findOne({ where: { outletId, productId }, lock: { mode: 'pessimistic_write' } });
      if (!lvl) lvl = repo.create({ outletId, productId, onHand: 0 });
      const newOnHand = lvl.onHand + delta;
      if (newOnHand < 0) throw new BadRequestException('insufficient stock');
      lvl.onHand = newOnHand;
      await repo.save(lvl);
      await tx.getRepository(FnbStockMovement).save(tx.getRepository(FnbStockMovement).create({ outletId, productId, kind: delta>=0?'in':'out', quantity: Math.abs(delta), meta }));
      return lvl;
    });
  }

  // POS sale ingestion: deduct stock, write receipt, emit CDP/Loyalty hooks (placeholder)
  async ingestSale(payload: { externalId: string; outletCode: string; userId?: string; lines: Array<{ sku: string; qty: number; unitPrice: number }> }) {
    // idempotent by externalId
    const exists = await this.receipts.findOne({ where: { externalId: payload.externalId } });
    if (exists) return exists;
    const outlet = await this.outlets.findOneOrFail({ where: { code: payload.outletCode } });
    return this.data.transaction(async tx => {
      const prodRepo = tx.getRepository(FnbProduct);
      const lvlRepo = tx.getRepository(FnbInventoryLevel);
      const moveRepo = tx.getRepository(FnbStockMovement);
      let total = 0;
      const lines: any[] = [];
      for (const l of payload.lines) {
        const prod = await prodRepo.findOneOrFail({ where: { sku: l.sku } });
        // deduct
        let lvl = await lvlRepo.findOne({ where: { outletId: outlet.id, productId: prod.id }, lock: { mode: 'pessimistic_write' } });
        if (!lvl) lvl = lvlRepo.create({ outletId: outlet.id, productId: prod.id, onHand: 0 });
        if (lvl.onHand < l.qty) throw new BadRequestException('insufficient stock');
        lvl.onHand -= l.qty; await lvlRepo.save(lvl);
        await moveRepo.save(moveRepo.create({ outletId: outlet.id, productId: prod.id, kind: 'out', quantity: l.qty, meta: { reason: 'sale', externalId: payload.externalId } }));
        const subtotal = l.qty * l.unitPrice;
        total += subtotal;
        lines.push({ productId: prod.id, sku: prod.sku, qty: l.qty, unitPrice: l.unitPrice, subtotal });
      }
      const receipt = await tx.getRepository(FnbReceipt).save(tx.getRepository(FnbReceipt).create({ externalId: payload.externalId, outletId: outlet.id, userId: (payload.userId || 'anonymous') as any, total, lines }));
      // TODO: publish CDP event + loyalty earn via adapters; placeholder comments left for worker integration.
      return receipt;
    });
  }

  listInventory(outletId: string) { return this.inv.find({ where: { outletId } }); }
}
