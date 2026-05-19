import { useEffect, useState } from 'react';
import { api } from '../components/Layout';
import { useAuth } from '../components/AuthContext';

type Item = { id: string; sku: string; title: string; price: number; vendorId?: string | null; meta?: Record<string, string> };
type CartLine = { sku: string; qty: number; title: string; price: number };
type Order = { id: string; total?: number; status: string };

function currency(n: number) { return `R$ ${n.toFixed(2).replace('.', ',')}` }

export default function Marketplace() {
  const { user } = useAuth();
  const uid = user?.id ?? 'guest';

  const [items, setItems]   = useState<Item[]>([]);
  const [cart, setCart]     = useState<CartLine[]>([]);
  const [order, setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState('');
  const [busy, setBusy]     = useState(false);

  const fetchItems = () => api<Item[]>('/marketplace/items').then(r => { if (r.ok) setItems(r.data); setLoading(false); });
  const fetchCart  = () => {
    if (!user) return;
    api<{ lines: CartLine[] }>(`/marketplace/cart/${uid}`).then(r => { if (r.ok) setCart(r.data.lines ?? []); });
  };

  useEffect(() => { fetchItems(); fetchCart(); }, [uid]);

  const addToCart = async (it: Item) => {
    if (!user) { setMsg('Sign in to add to cart.'); return; }
    setBusy(true);
    await api('/marketplace/cart/add', { method: 'POST', token: user.token, body: { userId: uid, sku: it.sku, qty: 1 } });
    await fetchCart();
    setBusy(false);
  };

  const checkout = async () => {
    if (!user || cart.length === 0) return;
    setBusy(true); setMsg('');
    const res = await api<Order>(`/marketplace/order/${uid}/create`, { method: 'POST', token: user.token });
    setBusy(false);
    if (!res.ok) { setMsg(res.error); return; }
    setOrder(res.data);
    setCart([]);
    setMsg('Order created! Payment via Pix — QR coming soon.');
  };

  const total = cart.reduce((s, l) => s + l.price * l.qty, 0);

  return (
    <>
      <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, color: '#18181b' }}>Shop</h1>
      <p style={{ margin: '0 0 28px', color: '#71717a', fontSize: 14 }}>
        Club merchandise, partner products, and stadium exclusives.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>
        {/* product grid */}
        <div>
          {loading && <p style={{ color: '#71717a' }}>Loading products…</p>}
          {!loading && items.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', border: '1px dashed #e4e4e7', borderRadius: 12, color: '#a1a1aa' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>No products yet</p>
              <p style={{ margin: '6px 0 0', fontSize: 13 }}>
                POST to <code>/marketplace/item</code> to seed products.
              </p>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
            {items.map(it => (
              <div key={it.id} style={{ border: '1px solid #e4e4e7', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
                {/* image placeholder */}
                <div style={{ height: 120, background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#18181b', marginBottom: 2 }}>{it.title}</div>
                  <div style={{ fontSize: 12, color: '#71717a', marginBottom: 10 }}>{it.sku}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{currency(it.price)}</span>
                    <button
                      onClick={() => addToCart(it)}
                      disabled={busy}
                      style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 6, background: '#18181b', color: '#fff', border: 'none', cursor: 'pointer' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* cart */}
        <div style={{ position: 'sticky', top: 72 }}>
          <div style={{ border: '1px solid #e4e4e7', borderRadius: 12, background: '#fff', padding: '20px' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#18181b' }}>
              Cart {cart.length > 0 && <span style={{ fontSize: 13, color: '#71717a', fontWeight: 500 }}>({cart.length} items)</span>}
            </h2>

            {cart.length === 0 && <p style={{ color: '#a1a1aa', fontSize: 13, margin: 0 }}>Your cart is empty.</p>}

            {cart.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #f4f4f5' }}>
                <span style={{ color: '#18181b' }}>{l.title} × {l.qty}</span>
                <span style={{ fontWeight: 700 }}>{currency(l.price * l.qty)}</span>
              </div>
            ))}

            {cart.length > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15, padding: '12px 0 0' }}>
                  <span>Total</span>
                  <span>{currency(total)}</span>
                </div>
                <button
                  onClick={checkout}
                  disabled={busy}
                  style={{ width: '100%', marginTop: 14, padding: '11px', borderRadius: 8, background: '#18181b', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  {busy ? 'Processing…' : 'Checkout (Pix)'}
                </button>
              </>
            )}
          </div>

          {msg && (
            <div style={{ marginTop: 10, fontSize: 13, padding: '10px 12px', borderRadius: 8,
              background: msg.includes('Order') ? '#f0fdf4' : '#fef2f2',
              color: msg.includes('Order') ? '#16a34a' : '#dc2626',
            }}>
              {msg}
            </div>
          )}

          {order && (
            <div style={{ marginTop: 12, padding: '14px', border: '1px solid #e4e4e7', borderRadius: 10, background: '#fff', fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Order #{order.id.slice(-8)}</div>
              <div style={{ color: '#71717a' }}>Status: {order.status}</div>
              <div style={{ marginTop: 10, padding: 12, background: '#f4f4f5', borderRadius: 6, textAlign: 'center', color: '#a1a1aa' }}>
                Pix QR code will appear here
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
