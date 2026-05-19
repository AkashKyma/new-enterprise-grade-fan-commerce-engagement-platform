import { useEffect, useRef, useState } from 'react';
import { api } from '../components/Layout';
import { useAuth } from '../components/AuthContext';

type Message = { role: 'user' | 'assistant' | 'system'; content: string; ts?: number };

const QUICK = [
  'How many loyalty points do I have?',
  'Show me my next match ticket.',
  'What offers are available for me?',
  'How do I renew my membership?',
  'What is my account status?',
];

/* Cheap rule-based reply so the chat feels alive even before an LLM is wired */
async function botReply(sessionId: string, userMsg: string, userId: string, token: string): Promise<string> {
  const lower = userMsg.toLowerCase();

  if (lower.includes('point') || lower.includes('loyalty') || lower.includes('saldo')) {
    const r = await api<{ points: number }>(`/concierge/loyalty/${userId}/balance`);
    if (r.ok) return `You currently have **${r.data.points ?? 0} points** in your loyalty wallet.`;
    return 'I could not retrieve your balance right now. Try again in a moment.';
  }

  if (lower.includes('identity') || lower.includes('profile') || lower.includes('conta')) {
    const r = await api<{ email?: string; role?: string }>(`/concierge/identity/${userId}`);
    if (r.ok) return `Your Coxa ID: **${r.data.email ?? userId}** · role: ${r.data.role ?? 'customer'}`;
    return 'Could not load your profile. Make sure you are signed in.';
  }

  /* log message and return generic answer */
  await api(`/concierge/session/${sessionId}/message`, {
    method: 'POST', token,
    body: { role: 'user', content: userMsg },
  });
  const r = await api<{ prompt: string }>(`/concierge/session/${sessionId}/prompt`);
  if (r.ok && r.data.prompt) {
    return `Here is what I know about your account:\n\n${r.data.prompt.slice(0, 400)}…\n\n_Full AI response coming soon — connect an LLM to \`ConciergeService.safePrompt\`._`;
  }
  return `I heard: "${userMsg}". Full conversational AI is coming — an LLM integration will be plugged into the Concierge module. For now I can answer: loyalty points, identity, ticket eligibility.`;
}

export default function Concierge() {
  const { user } = useAuth();
  const [sessionId, setSessionId]   = useState<string | null>(null);
  const [messages, setMessages]     = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your Coxa ID concierge. Ask me about your points, tickets, membership, or anything fan-related.', ts: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* start a session once we have a user */
  useEffect(() => {
    if (!user || sessionId) return;
    api<{ id: string }>('/concierge/session', {
      method: 'POST',
      token: user.token,
      body: { userId: user.id },
    }).then(r => { if (r.ok) setSessionId(r.data.id); });
  }, [user, sessionId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text = input.trim()) => {
    if (!text) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setBusy(true);

    let reply: string;
    if (!user) {
      reply = 'Please sign in so I can look up your account.';
    } else {
      const sid = sessionId ?? '__no-session';
      reply = await botReply(sid, text, user.id, user.token);
    }

    setBusy(false);
    setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
  };

  return (
    <>
      <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, color: '#18181b' }}>Concierge</h1>
      <p style={{ margin: '0 0 20px', color: '#71717a', fontSize: 14 }}>
        Ask anything about your account — points, tickets, membership, orders.
        {sessionId && <span style={{ marginLeft: 8, fontSize: 11, color: '#a1a1aa' }}>Session #{sessionId.slice(-8)}</span>}
      </p>

      {/* quick actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {QUICK.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, border: '1px solid #e4e4e7', background: '#fff', cursor: 'pointer', color: '#3f3f46' }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* chat window */}
      <div style={{
        height: 420, overflowY: 'auto', border: '1px solid #e4e4e7', borderRadius: 12,
        background: '#fff', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
            {/* avatar */}
            <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: m.role === 'user' ? '#18181b' : '#f4f4f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: m.role === 'user' ? '#fff' : '#71717a',
            }}>
              {m.role === 'user' ? (user?.email?.[0]?.toUpperCase() ?? 'U') : 'AI'}
            </div>
            {/* bubble */}
            <div style={{
              maxWidth: '72%', padding: '10px 14px', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: m.role === 'user' ? '#18181b' : '#f4f4f5',
              color: m.role === 'user' ? '#fff' : '#18181b',
              fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#71717a' }}>AI</div>
            <div style={{ padding: '10px 14px', background: '#f4f4f5', borderRadius: '12px 12px 12px 2px', fontSize: 14, color: '#a1a1aa' }}>
              Thinking<span className="typing-dots">…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <form
        onSubmit={e => { e.preventDefault(); send(); }}
        style={{ display: 'flex', gap: 8, marginTop: 10 }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask something…"
          disabled={busy}
          style={{ flex: 1, padding: '11px 14px', fontSize: 14, borderRadius: 8, border: '1px solid #d4d4d8', outline: 'none' }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          style={{ padding: '11px 20px', borderRadius: 8, background: '#18181b', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: input.trim() ? 1 : 0.4 }}
        >
          Send
        </button>
      </form>
    </>
  );
}
