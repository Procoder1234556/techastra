import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function SuperadminInvites() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('organizer');
  const [msg, setMsg] = useState('');
  const [rows, setRows] = useState<{ email: string; role: string; sentAt?: string }[]>([]);

  const load = () => {
    api.get<{ invites: { email: string; role: string; sentAt: string }[] }>('/api/v1/invites/admin/all').then((res) => {
      setRows(res.data.invites || []);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const send = async () => {
    const res = await api.post('/api/v1/invites/send', { email, role });
    setMsg(res.data.message || 'Sent');
    setEmail('');
    load();
  };

  const exportCsv = () => {
    window.open('/api/v1/invites/admin/export', '_blank');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Organizer invites</h1>
      <p className="mt-2 text-sm text-neutral-500">Send and track invites (email delivery via MailerHub in production).</p>

      <div className="mt-8 flex flex-wrap gap-2">
        <input
          className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 dark:border-white/20"
          placeholder="email@college.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-950"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="organizer">Organizer</option>
          <option value="manager">Manager</option>
        </select>
        <button
          type="button"
          onClick={send}
          className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-gray-900"
        >
          Send invite
        </button>
        <button type="button" onClick={exportCsv} className="rounded-full border px-4 py-2 text-sm dark:border-white/20">
          Export CSV
        </button>
      </div>
      {msg && <p className="mt-3 text-sm text-green-600">{msg}</p>}

      <ul className="mt-8 space-y-2 text-sm">
        {rows.map((r, i) => (
          <li key={i} className="flex justify-between rounded-lg border px-3 py-2 dark:border-white/10">
            <span>{r.email}</span>
            <span className="text-neutral-500">{r.role}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="text-neutral-500">No invites logged yet.</li>}
      </ul>
    </div>
  );
}
