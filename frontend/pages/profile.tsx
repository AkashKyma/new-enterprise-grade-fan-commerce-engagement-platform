import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../components/Layout';
import { useAuth } from '../components/AuthContext';

type Profile   = { id: string; email: string | null; phone: string | null; role: string; walletId?: string; membershipId?: string };
type Balance   = { userId: string; points: number };
type Reward    = { id: string; name: string; cost: number; active: boolean };
type HistoryTx = { id: string; amount: number; direction: string; createdAt: string };
type IdentityMe = {
  user: { id: string; email: string | null; phone: string | null; role: string };
  membership: { membershipId: string | null } | null;
  wallet: { walletId: string | null } | null;
};

function currency(n: number) { return `R$ ${n.toFixed(2).replace('.', ',')}` }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #e4e4e7', borderRadius: 12, background: '#fff', marginBottom: 20 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f4f4f5', fontWeight: 700, fontSize: 15, color: '#18181b' }}>{title}</div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: '1px solid #f9f9f9' }}>
      <span style={{ color: '#71717a' }}>{label}</span>
      <span style={{ color: '#18181b', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [balance,  setBalance]  = useState<Balance | null>(null);
  const [history,  setHistory]  = useState<HistoryTx[]>([]);
  const [rewards,  setRewards]  = useState<Reward[]>([]);
  const [msg,      setMsg]      = useState('');
  const [busy,     setBusy]     = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setBalance(null);
      setHistory([]);
      setRewards([]);
      void router.replace('/login');
      return;
    }
    api<IdentityMe>('/identity/me', { token: user.token }).then(r => {
      if (!r.ok) return;
      const d = r.data;
      setProfile({
        id: d.user.id,
        email: d.user.email,
        phone: d.user.phone,
        role: d.user.role,
        membershipId: d.membership?.membershipId ?? null,
        walletId: d.wallet?.walletId ?? null,
      });
    });
    api<Balance>(`/loyalty/${user.id}/balance`).then(r => { if (r.ok) setBalance(r.data); });
    api<HistoryTx[]>(`/loyalty/${user.id}/history`).then(r => { if (r.ok) setHistory(r.data); });
    api<Reward[]>('/loyalty/rewards').then(r => { if (r.ok) setRewards(r.data.filter((r: Reward) => r.active)); });
  }, [user, router]);

  const redeem = async (reward: Reward) => {
    if (!user) return;
    setBusy(true); setMsg('');
    const res = await api('/loyalty/redeem', {
      method: 'POST', token: user.token,
      body: { userId: user.id, rewardId: reward.id, idempotencyKey: `${user.id}-${reward.id}-${Date.now()}` },
    });
    setBusy(false);
    if (!res.ok) { setMsg((res as { error: string }).error); return; }
    setMsg(`Redeemed: ${reward.name}!`);
    api<Balance>(`/loyalty/${user.id}/balance`).then(r => { if (r.ok) setBalance(r.data); });
  };

  if (!user) {
    return <p style={{ color: '#71717a' }}>Redirecting to sign in…</p>;
  }

  return (
    <>
      <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, color: '#18181b' }}>My Account</h1>
      <p style={{ margin: '0 0 28px', color: '#71717a', fontSize: 14 }}>Sócio card, loyalty wallet, and redemption.</p>

      {/* sócio card */}
      <div style={{
        borderRadius: 16, padding: '24px 28px', marginBottom: 24,
        background: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)',
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ fontSize: 11, letterSpacing: '0.12em', opacity: 0.6, textTransform: 'uppercase', marginBottom: 12 }}>Coxa ID · Sócio Card</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
          {profile?.email ?? user.email ?? 'Loading…'}
        </div>
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 16 }}>
          {profile?.membershipId ? `Membership #${profile.membershipId}` : 'No active membership plan'}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>Loyalty balance</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{balance?.points ?? '—'} pts</div>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>Role</div>
            <div style={{ fontSize: 22, fontWeight: 800, textTransform: 'capitalize' }}>{profile?.role ?? '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>Fan ID</div>
            <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.8 }}>{user.id.slice(-10)}</div>
          </div>
        </div>
      </div>

      {msg && (
        <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16,
          background: msg.includes('!') ? '#f0fdf4' : '#fef2f2',
          color: msg.includes('!') ? '#16a34a' : '#dc2626',
        }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          {/* profile info */}
          <Section title="Identity">
            <Row label="Email"  value={profile?.email ?? '—'} />
            <Row label="Phone"  value={profile?.phone ?? '—'} />
            <Row label="Wallet" value={profile?.walletId ? profile.walletId.slice(-12) : '—'} />
          </Section>

          {/* point history */}
          <Section title="Points history">
            {history.length === 0 && <p style={{ color: '#a1a1aa', fontSize: 13, margin: 0 }}>No transactions yet.</p>}
            {history.slice(0, 8).map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f4f4f5' }}>
                <span style={{ color: '#71717a' }}>{tx.direction}</span>
                <span style={{ fontWeight: 700, color: tx.amount > 0 ? '#16a34a' : '#dc2626' }}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} pts
                </span>
              </div>
            ))}
          </Section>
        </div>

        {/* rewards catalogue */}
        <Section title="Redeem points">
          {rewards.length === 0 && <p style={{ color: '#a1a1aa', fontSize: 13, margin: 0 }}>No rewards available yet.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rewards.map(rw => {
              const canRedeem = (balance?.points ?? 0) >= rw.cost;
              return (
                <div key={rw.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid #e4e4e7', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{rw.name}</div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>{rw.cost} pts</div>
                  </div>
                  <button
                    onClick={() => redeem(rw)}
                    disabled={busy || !canRedeem}
                    style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 6,
                      background: canRedeem ? '#18181b' : '#f4f4f5',
                      color: canRedeem ? '#fff' : '#a1a1aa',
                      border: 'none', cursor: canRedeem ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Redeem
                  </button>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </>
  );
}
