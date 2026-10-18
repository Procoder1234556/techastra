import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export function OrganizerCommunications() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/api/v1/communications/preview').then((res) => setCounts(res.data.counts || {}));
  }, []);

  const send = async () => {
    const res = await api.post('/api/v1/communications/send', { subject, body, filterStatus: 'all' });
    setMsg(res.data.message || 'Sent (stub)');
  };

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-sm text-neutral-500">Recipients by status: {JSON.stringify(counts)}</p>
      <input
        className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-900"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-900"
        rows={4}
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button
        type="button"
        onClick={send}
        className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-900"
      >
        Send (stub)
      </button>
      {msg && <p className="text-sm text-green-600">{msg}</p>}
    </div>
  );
}
