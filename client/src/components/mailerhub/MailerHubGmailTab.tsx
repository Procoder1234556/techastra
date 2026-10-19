import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type GmailAccount = {
  _id: string;
  email: string;
  category: string;
  dailyLimit: number;
  isActive: boolean;
  sentToday: number;
  warmupEnabled: boolean;
};

const CATEGORIES = ['notifications', 'invitations', 'certificates', 'support'] as const;

export function MailerHubGmailTab() {
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);
  const [dailyLimitTotal, setDailyLimitTotal] = useState(0);
  const [deliverability, setDeliverability] = useState<{ score?: number; issues?: unknown[] } | null>(null);
  const [form, setForm] = useState({
    email: '',
    appPassword: '',
    dailyLimit: 430,
    warmupEnabled: true,
    category: 'notifications' as (typeof CATEGORIES)[number],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMsg, setScanMsg] = useState<string | null>(null);

  const load = () => {
    api.get<{ accounts: GmailAccount[]; dailyLimitTotal: number }>('/api/v1/mailerhub/gmail-accounts').then((r) => {
      setAccounts(r.data.accounts || []);
      setDailyLimitTotal(r.data.dailyLimitTotal ?? 0);
    });
    api.get('/api/v1/mailerhub/deliverability').then((r) => setDeliverability(r.data));
  };

  useEffect(() => {
    load();
  }, []);

  const addAccount = async () => {
    if (!form.email || !form.appPassword) return;
    setBusy(true);
    setError(null);
    try {
      await api.post('/api/v1/mailerhub/gmail-accounts', form);
      setForm({ email: '', appPassword: '', dailyLimit: 430, warmupEnabled: true, category: 'notifications' });
      load();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to add';
      setError(msg || 'Failed to add');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (acc: GmailAccount) => {
    await api.put(`/api/v1/mailerhub/gmail-accounts/${acc._id}`, { isActive: !acc.isActive });
    load();
  };

  const remove = async (acc: GmailAccount) => {
    if (!window.confirm(`Remove ${acc.email}?`)) return;
    await api.delete(`/api/v1/mailerhub/gmail-accounts/${acc._id}`);
    load();
  };

  const scan = async () => {
    setScanMsg(null);
    const res = await api.post('/api/v1/mailerhub/deliverability/scan');
    setScanMsg(`Score: ${res.data.score ?? 100}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold">Gmail sending pool</h2>
        <p className="mt-1 text-sm text-white/40">
          Add Gmail accounts with app passwords (Google Account → Security → 2-Step → App passwords). Pool capacity:{' '}
          <strong className="text-white/70">{dailyLimitTotal}</strong> emails/day across active accounts.
        </p>
        {deliverability && (
          <p className="mt-2 text-xs text-emerald-300/80">Deliverability score: {deliverability.score ?? 100}</p>
        )}
        <button
          type="button"
          onClick={scan}
          className="mt-3 rounded-full border border-white/20 px-4 py-1.5 text-xs hover:bg-white/5"
        >
          Run deliverability scan
        </button>
        {scanMsg && <p className="mt-2 text-xs text-white/50">{scanMsg}</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-medium">Add account</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            placeholder="sender@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            placeholder="App password"
            value={form.appPassword}
            onChange={(e) => setForm({ ...form, appPassword: e.target.value })}
          />
          <select
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as (typeof CATEGORIES)[number] })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            value={form.dailyLimit}
            onChange={(e) => setForm({ ...form, dailyLimit: Number(e.target.value) })}
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={addAccount}
          className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-900 disabled:opacity-50"
        >
          Add to pool
        </button>
        {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      </div>

      <ul className="space-y-2">
        {accounts.map((acc) => (
          <li
            key={acc._id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{acc.email}</p>
              <p className="text-xs text-white/40">
                {acc.category} · {acc.sentToday}/{acc.dailyLimit} today · {acc.isActive ? 'active' : 'paused'}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => toggle(acc)} className="text-xs underline text-white/60">
                {acc.isActive ? 'Pause' : 'Activate'}
              </button>
              <button type="button" onClick={() => remove(acc)} className="text-xs text-red-300/80">
                Remove
              </button>
            </div>
          </li>
        ))}
        {accounts.length === 0 && <p className="text-sm text-white/40">No Gmail accounts in the pool yet.</p>}
      </ul>
    </div>
  );
}
