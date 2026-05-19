import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { useAuth } from './AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function api<T>(
  path: string,
  opts?: { method?: string; body?: unknown; token?: string },
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API}${path}`, {
      method: opts?.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts?.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: data?.message ?? `${res.status}` };
    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/marketplace', label: 'Shop' },
  { href: '/concierge', label: 'Concierge' },
  { href: '/profile', label: 'My Account' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter(); // pathname for active nav link

  const handleLogout = () => {
    logout();
    /* Full reload so no stale page state / HMR session survives logout */
    window.location.href = '/login';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{
        background: '#18181b', color: '#fff', height: 56,
        display: 'flex', alignItems: 'center', padding: '0 24px',
        gap: 8, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', marginRight: 24 }}>
          Coxa ID
        </span>
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{
            padding: '6px 12px', borderRadius: 6,
            fontWeight: 500, fontSize: 14, textDecoration: 'none',
            color: router.pathname === l.href ? '#fff' : '#a1a1aa',
            background: router.pathname === l.href ? '#27272a' : 'transparent',
          }}>
            {l.label}
          </Link>
        ))}
        <div style={{ flex: 1 }} />
        {!ready ? (
          <span style={{ fontSize: 13, color: '#71717a' }}>…</span>
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#a1a1aa' }}>{user.email ?? 'fan'}</span>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                fontSize: 13, padding: '5px 12px', borderRadius: 6, border: '1px solid #3f3f46',
                background: 'transparent', color: '#a1a1aa', cursor: 'pointer',
              }}
            >
              Log out
            </button>
          </div>
        ) : (
          <Link href="/login" style={{
            fontSize: 13, fontWeight: 600, padding: '6px 14px',
            background: '#fff', color: '#18181b', borderRadius: 6, textDecoration: 'none',
          }}>
            Log in
          </Link>
        )}
      </nav>

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 20px' }}>
        {children}
      </main>

      <footer style={{
        borderTop: '1px solid #e4e4e7', textAlign: 'center',
        fontSize: 12, color: '#a1a1aa', padding: '20px 0 32px',
      }}>
        Fan Platform · Single-Tenant v1 · One Fan = One Identity = One Wallet = One Access
      </footer>
    </div>
  );
}
