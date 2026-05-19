import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../components/Layout';
import { useAuth } from '../components/AuthContext';

const DEMO_EMAIL = 'fan@coxa.com';
const DEMO_PASSWORD = 'demo1234';

const inputStyle: Record<string, string | number> = {
  width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 8,
  border: '1px solid #d4d4d8', outline: 'none', boxSizing: 'border-box' as const,
  background: '#fff', marginTop: 4,
};
const btnStyle: Record<string, string | number> = {
  width: '100%', padding: '12px', fontSize: 15, fontWeight: 700,
  borderRadius: 8, border: 'none', background: '#18181b', color: '#fff',
  cursor: 'pointer', marginTop: 8,
};
const cardStyle: Record<string, string | number> = {
  maxWidth: 420, margin: '60px auto', padding: '36px 32px',
  border: '1px solid #e4e4e7', borderRadius: 14, background: '#fff',
};

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) void router.replace('/');
  }, [ready, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const path = mode === 'signin' ? '/auth/signin' : '/auth/signup';
    const res = await api<{ access_token: string; user: { id: string; email: string } }>(path, {
      method: 'POST',
      body: { email, password },
    });
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    login({ id: res.data.user.id, email: res.data.user.email, token: res.data.access_token });
    router.push('/');
  };

  return (
      <div style={cardStyle}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#18181b' }}>
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>
        <p style={{ margin: '0 0 24px', color: '#71717a', fontSize: 14 }}>
          {mode === 'signin'
            ? 'Welcome back to your Coxa ID.'
            : 'One account for everything — tickets, shop, loyalty.'}
        </p>
        <div style={{ marginBottom: 20, padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#166534' }}>
          Demo: <strong>{DEMO_EMAIL}</strong> / <strong>{DEMO_PASSWORD}</strong>
          <button
            type="button"
            onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); setError(''); }}
            style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: '1px solid #86efac', background: '#fff', cursor: 'pointer', color: '#166534' }}
          >
            Fill
          </button>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46' }}>Email</label>
            <input
              style={inputStyle}
              type="email" required placeholder="you@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46' }}>Password</label>
            <input
              style={inputStyle}
              type="password" required placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', padding: '8px 12px', borderRadius: 6, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#71717a' }}>
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#18181b', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
  );
}
