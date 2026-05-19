import { useEffect, useState } from 'react';
import { api } from '../components/Layout';
import { useAuth } from '../components/AuthContext';

type Section = { id: string; name: string; capacity: number };
type FanEvent = { id: string; name: string; date: string; sections?: Section[] };
type Ticket   = { id: string; eventId: string; sectionId: string; status: string; qrCode?: string };

function formatDate(d: string) {
  try { return new Date(d).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return d; }
}

export default function Tickets() {
  const { user } = useAuth();
  const [events, setEvents]     = useState<FanEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<FanEvent | null>(null);
  const [section, setSection]   = useState('');
  const [tickets, setTickets]   = useState<Ticket[]>([]);
  const [msg, setMsg]           = useState('');
  const [busy, setBusy]         = useState(false);

  useEffect(() => {
    api<FanEvent[]>('/membership-ticketing/events').then(r => {
      if (r.ok) setEvents(r.data);
      setLoading(false);
    });
  }, []);

  const reserve = async () => {
    if (!user) { setMsg('Please sign in first.'); return; }
    if (!selected || !section) { setMsg('Pick a section.'); return; }
    setBusy(true); setMsg('');
    const res = await api<Ticket>('/membership-ticketing/reserve', {
      method: 'POST',
      token: user.token,
      body: { userId: user.id, eventId: selected.id, sectionId: section },
    });
    setBusy(false);
    if (!res.ok) { setMsg(res.error); return; }
    setTickets(prev => [res.data, ...prev]);
    setMsg('Ticket reserved!');
  };

  return (
    <>
      <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, color: '#18181b' }}>Tickets</h1>
      <p style={{ margin: '0 0 28px', color: '#71717a', fontSize: 14 }}>
        Pick an event, choose your section, reserve your seat.
      </p>

      {loading && <p style={{ color: '#71717a' }}>Loading events…</p>}

      {/* event list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 32 }}>
        {events.map(ev => (
          <button
            key={ev.id}
            onClick={() => { setSelected(ev); setSection(''); setMsg(''); }}
            style={{
              textAlign: 'left', padding: '18px 20px', border: `2px solid ${selected?.id === ev.id ? '#18181b' : '#e4e4e7'}`,
              borderRadius: 12, background: selected?.id === ev.id ? '#18181b' : '#fff',
              color: selected?.id === ev.id ? '#fff' : '#18181b', cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{ev.name}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{formatDate(ev.date)}</div>
          </button>
        ))}
      </div>

      {/* section picker */}
      {selected && (
        <div style={{ padding: '24px', border: '1px solid #e4e4e7', borderRadius: 12, background: '#fff', maxWidth: 520, marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>
            {selected.name} — {formatDate(selected.date)}
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#71717a' }}>Select a section:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {(selected.sections ?? []).map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                style={{
                  padding: '8px 14px', borderRadius: 8, border: `2px solid ${section === s.id ? '#18181b' : '#e4e4e7'}`,
                  background: section === s.id ? '#18181b' : '#fff',
                  color: section === s.id ? '#fff' : '#18181b',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {s.name}
                <span style={{ marginLeft: 6, opacity: 0.6, fontWeight: 400 }}>({s.capacity})</span>
              </button>
            ))}
          </div>

          {msg && (
            <div style={{ fontSize: 13, padding: '8px 12px', borderRadius: 6, marginBottom: 12,
              background: msg.includes('!') ? '#f0fdf4' : '#fef2f2',
              color: msg.includes('!') ? '#16a34a' : '#dc2626',
            }}>
              {msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={reserve}
              disabled={busy || !section}
              style={{
                padding: '10px 24px', borderRadius: 8, background: '#18181b', color: '#fff',
                fontSize: 14, fontWeight: 700, border: 'none', cursor: section ? 'pointer' : 'not-allowed', opacity: section ? 1 : 0.4,
              }}
            >
              {busy ? 'Reserving…' : 'Reserve seat (Pix placeholder)'}
            </button>
            <span style={{ fontSize: 12, color: '#a1a1aa' }}>Free reserve · Pix payment TBD</span>
          </div>
        </div>
      )}

      {/* my tickets */}
      {tickets.length > 0 && (
        <section>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 12px', color: '#18181b' }}>My tickets this session</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tickets.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', border: '1px solid #e4e4e7', borderRadius: 10, background: '#fff' }}>
                {/* QR placeholder */}
                <div style={{ width: 48, height: 48, background: '#18181b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
                    <rect x="18" y="18" width="3" height="3"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Ticket #{t.id.slice(-8)}</div>
                  <div style={{ fontSize: 12, color: '#71717a' }}>Section: {t.sectionId} · Status: {t.status}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 20, background: t.status === 'active' ? '#dcfce7' : '#f4f4f5',
                  color: t.status === 'active' ? '#16a34a' : '#71717a',
                }}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
