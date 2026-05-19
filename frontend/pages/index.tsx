import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../components/Layout';
import { useAuth } from '../components/AuthContext';

type Card = { id: string; kind: string; title: string; subtitle?: string; meta?: Record<string, string>; cta?: string };

const chip = (label: string, color = '#f4f4f5', text = '#52525b') => (
  <span style={{ fontSize: 11, background: color, color: text, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
    {label}
  </span>
);

function OfferCard({ c }: { c: Card }) {
  return (
    <div style={{ padding: '18px 20px', border: '1px solid #e4e4e7', borderRadius: 12, background: '#fff' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {c.kind}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b', lineHeight: 1.4, marginBottom: c.subtitle ? 4 : 0 }}>
        {c.title}
      </div>
      {c.subtitle && <div style={{ fontSize: 13, color: '#71717a', marginBottom: 10 }}>{c.subtitle}</div>}
      {c.meta && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {Object.entries(c.meta).map(([k, v]) => chip(`${k}: ${v}`))}
        </div>
      )}
      {c.cta && (
        <button style={{
          marginTop: 14, fontSize: 13, fontWeight: 600, padding: '7px 16px',
          borderRadius: 6, border: '1px solid #e4e4e7', background: '#18181b',
          color: '#fff', cursor: 'pointer',
        }}>
          {c.cta}
        </button>
      )}
    </div>
  );
}

const quickLinks = [
  { href: '/tickets',     label: 'Buy tickets',     desc: 'Match events & seating' },
  { href: '/marketplace', label: 'Shop now',        desc: 'Club merchandise & partners' },
  { href: '/concierge',   label: 'Chat with AI',    desc: 'Ask anything about your account' },
  { href: '/profile',     label: 'My sócio card',   desc: 'Membership & loyalty points' },
];

export default function Home() {
  const { user, ready } = useAuth();
  const uid = user?.id;

  const [offers, setOffers]   = useState<Card[]>([]);
  const [rewards, setRewards] = useState<Card[]>([]);
  const [events, setEvents]   = useState<Card[]>([]);
  const [health, setHealth]   = useState<string | null>(null);

  useEffect(() => {
    api<{ status: string }>('/health').then(r => { if (r.ok) setHealth(r.data.status); });
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!uid) {
      setOffers([]);
      setRewards([]);
      setEvents([]);
      return;
    }
    const q = `userId=${uid}`;
    api<Card[]>(`/personalization/offers?${q}`).then(r => { if (r.ok) setOffers(r.data); });
    api<Card[]>(`/personalization/rewards?${q}`).then(r => { if (r.ok) setRewards(r.data); });
    api<Card[]>(`/personalization/events?${q}`).then(r => { if (r.ok) setEvents(r.data); });
  }, [uid, ready]);

  return (
    <>
      {/* hero */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#18181b' }}>
          {user ? `Welcome back${user.email ? `, ${user.email.split('@')[0]}` : ''}` : 'Welcome to Fan Platform'}
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 15, color: '#71717a' }}>
          One identity · one wallet · one access layer
          {health && <span style={{ marginLeft: 10, fontSize: 12, color: '#22c55e', fontWeight: 600 }}>● {health}</span>}
        </p>
        {!user && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#166534' }}>
            Demo account: <strong>fan@coxa.com</strong> / <strong>demo1234</strong>
          </div>
        )}
        {!user && (
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <Link href="/login" style={{
              padding: '10px 22px', borderRadius: 8, background: '#18181b',
              color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14,
            }}>
              Sign in
            </Link>
            <Link href="/login" style={{
              padding: '10px 22px', borderRadius: 8, border: '1px solid #e4e4e7',
              color: '#18181b', textDecoration: 'none', fontWeight: 600, fontSize: 14, background: '#fff',
            }}>
              Create account
            </Link>
          </div>
        )}
      </div>

      {/* quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 36 }}>
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href} style={{ textDecoration: 'none' }}>
            <div style={{ padding: '18px 20px', border: '1px solid #e4e4e7', borderRadius: 12, background: '#fff', cursor: 'pointer' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 4 }}>{l.label}</div>
              <div style={{ fontSize: 13, color: '#71717a' }}>{l.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* upcoming events */}
      {events.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#18181b', margin: '0 0 14px' }}>Upcoming events</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {events.map(c => <OfferCard key={c.id} c={c} />)}
          </div>
        </section>
      )}

      {/* offers */}
      {offers.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#18181b', margin: '0 0 14px' }}>Offers for you</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {offers.map(c => <OfferCard key={c.id} c={c} />)}
          </div>
        </section>
      )}

      {/* rewards */}
      {rewards.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#18181b', margin: '0 0 14px' }}>Redeem your points</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {rewards.map(c => <OfferCard key={c.id} c={c} />)}
          </div>
        </section>
      )}
    </>
  );
}
