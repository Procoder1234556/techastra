import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type Unsub = { _id: string; email: string; reason?: string; createdAt?: string };

export function MailerHubNewsletterTab() {
  const [preview, setPreview] = useState('');
  const [audience, setAudience] = useState(0);
  const [unsubs, setUnsubs] = useState<Unsub[]>([]);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');

  const refresh = () => {
    api.get<{ html?: string }>('/api/v1/mailerhub/newsletter/preview').then((r) => setPreview(r.data.html || ''));
    api.get<{ count: number }>('/api/v1/mailerhub/newsletter/userbase').then((r) => setAudience(r.data.count));
    api.get<{ unsubscribes: Unsub[] }>('/api/v1/mailerhub/unsubscribes').then((r) => setUnsubs(r.data.unsubscribes || []));
  };

  useEffect(() => {
    refresh();
  }, []);

  const addUnsub = async () => {
    if (!email.trim()) return;
    await api.post('/api/v1/mailerhub/unsubscribes', { email: email.trim(), reason });
    setEmail('');
    setReason('');
    setMsg('Unsubscribe recorded.');
    refresh();
  };

  const remove = async (id: string) => {
    await api.delete(`/api/v1/mailerhub/unsubscribes/${id}`);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold">Newsletter</h2>
        <p className="mt-1 text-sm text-white/40">
          Platform audience: <strong className="text-white">{audience.toLocaleString()}</strong> users. Send via a
          campaign with template slug <code className="text-white/60">newsletter</code>.
        </p>
        <div
          className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-medium">Unsubscribes</h3>
          <button
            type="button"
            className="text-xs text-blue-300 underline"
            onClick={async () => {
              const res = await api.get('/api/v1/mailerhub/unsubscribes/export', { responseType: 'blob' });
              const url = URL.createObjectURL(res.data);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'unsubscribes.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="flex-1 min-w-[160px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            type="button"
            onClick={addUnsub}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900"
          >
            Add
          </button>
        </div>
        {msg && <p className="mt-2 text-xs text-emerald-400">{msg}</p>}
        <ul className="mt-4 space-y-2 text-sm">
          {unsubs.length === 0 && <li className="text-white/40">No unsubscribes logged.</li>}
          {unsubs.map((u) => (
            <li key={u._id} className="flex items-center justify-between gap-2 border-b border-white/5 py-2">
              <span className="text-white/80">{u.email}</span>
              <button type="button" onClick={() => remove(u._id)} className="text-xs text-red-400">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
