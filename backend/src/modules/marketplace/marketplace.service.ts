import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Vendor, MarketplaceItem, Cart, CartLine, MpOrder, MpOrderLine, SettlementRef } from './entities';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Vendor) private vendors: Repository<Vendor>,
    @InjectRepository(MarketplaceItem) private items: Repository<MarketplaceItem>,
    @InjectRepository(Cart) private carts: Repository<Cart>,
    @InjectRepository(CartLine) private lines: Repository<CartLine>,
    @InjectRepository(MpOrder) private orders: Repository<MpOrder>,
    @InjectRepository(MpOrderLine) private orderLines: Repository<MpOrderLine>,
    @InjectRepository(SettlementRef) private settlements: Repository<SettlementRef>,
    private data: DataSource,
  ) {}

  // Vendor + Items
  upsertVendor(v: { id?: string; code: string; name: string; meta?: any }) { const row = this.vendors.create({ ...(v.id?{id:v.id}:{}) as any, code: v.code, name: v.name, meta: v.meta || {} }); return this.vendors.save(row); }
  upsertItem(i: { id?: string; sku: string; title: string; price: number; vendorId?: string|null; meta?: any }) { const row = this.items.create({ ...(i.id?{id:i.id}:{}) as any, sku: i.sku, title: i.title, price: i.price, vendorId: i.vendorId ?? null, meta: i.meta || {} }); return this.items.save(row); }
  listItems() { return this.items.find(); }

  // Cart
  async getOrCreateCart(userId: string) { let c = await this.carts.findOne({ where: { userId } }); if (!c) c = await this.carts.save(this.carts.create({ userId, meta: {} })); return c; }
  async addToCart(userId: string, itemSku: string, qty: number) {
    const [cart, item] = await Promise.all([this.getOrCreateCart(userId), this.items.findOneOrFail({ where: { sku: itemSku } })]);
    const line = this.lines.create({ cartId: cart.id, itemId: item.id, unitPrice: item.price, qty, meta: { vendorId: item.vendorId } });
    return this.lines.save(line);
  }
  async viewCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const lines = await this.lines.find({ where: { cartId: cart.id } });
    const itemIds = lines.map((l) => l.itemId);
    const items = itemIds.length ? await this.items.findBy({ id: In(itemIds) }) : [];
    const itemMap = new Map(items.map((i) => [i.id, i]));
    const enriched = lines.map((l) => {
      const item = itemMap.get(l.itemId);
      return { sku: item?.sku ?? '', title: item?.title ?? 'Item', price: l.unitPrice, qty: l.qty };
    });
    const total = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    return { cart, lines: enriched, total };
  }
  async clearCart(userId: string) { const cart = await this.getOrCreateCart(userId); await this.lines.delete({ cartId: cart.id as any }); return { ok: true }; }

  // Checkout: create marketplace order and delegate to unified checkout later
  async createOrderFromCart(userId: string) {
    return this.data.transaction(async tx => {
      const cart = await this.getOrCreateCart(userId);
      const lines = await tx.getRepository(CartLine).find({ where: { cartId: cart.id } });
      const itemMap = new Map((await tx.getRepository(MarketplaceItem).findByIds(lines.map(l=>l.itemId))).map(i=>[i.id,i]));
      const order = await tx.getRepository(MpOrder).save(tx.getRepository(MpOrder).create({ userId, status: 'created', total: 0, breakdown: {} }));
      let total = 0; const perVendor: Record<string,string|number|any> = {};
      for (const l of lines) {
        const item = itemMap.get(l.itemId)!;
        await tx.getRepository(MpOrderLine).save(tx.getRepository(MpOrderLine).create({ orderId: order.id, itemId: item.id, vendorId: item.vendorId, unitPrice: l.unitPrice, qty: l.qty, meta: {} }));
        total += l.unitPrice * l.qty;
        const key = item.vendorId || 'internal';
        perVendor[key] = (perVendor[key] || 0) + l.unitPrice * l.qty;
      }
      order.total = total; order.breakdown = perVendor; await tx.getRepository(MpOrder).save(order);
      // Prepare settlement refs (future payouts)
      for (const [vendorId, amount] of Object.entries(perVendor)) {
        await tx.getRepository(SettlementRef).save(tx.getRepository(SettlementRef).create({ orderId: order.id, vendorId: vendorId==='internal'? null : vendorId, meta: { amount } }));
      }
      // Clear cart on order creation
      await tx.getRepository(CartLine).delete({ cartId: cart.id as any });
      return order;
    });
  }

  async markOrderStatus(orderId: string, status: MpOrder['status']) {
    const order = await this.orders.findOneOrFail({ where: { id: orderId } });
    order.status = status;
    return this.orders.save(order);
  }
}
