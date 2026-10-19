import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { API } from '../../lib/apiPaths';

const FILTERS = [
  { value: 'all', label: 'All registrants' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
];

const PRESETS = [
  { subject: 'Schedule update', body: 'Hi {{name}},\n\nWe have an update to the event schedule. Check the event page for details.\n\n— Techastra' },
  { subject: 'Submission reminder', body: 'Hi {{name}},\n\nFriendly reminder to submit your project before the deadline.\n\n— Techastra' },
];

export function OrganizerCommunications() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get(`${API.communications}/preview`).then((res) => setCounts(res.data.counts || {}));
  }, []);

  const send = async () => {
    if (!subject.trim() || !body.trim()) {
      setMsg('Subject and body are required.');
      return;
    }
    if (!window.confirm(`Send to ${counts[filterStatus] ?? counts.all ?? 0} recipient(s)?`)) return;
    setSending(true);
    try {
      const res = await api.post('/api/v1/communications/send', { subject, body, filterStatus });
      setMsg(res.data.message || `Sent to ${res.data.sent ?? 0} participants`);
    } catch {
      setMsg('Failed to send');
    } finally {
      setSending(false);
    }
  };

  const audience = counts[filterStatus] ?? counts.all ?? 0;

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-lg font-semibold">Communications</h2>
      <p className="text-sm text-neutral-500">Email participants via MailerHub-backed campaigns (in-app + delivery log).</p>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilterStatus(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              filterStatus === f.value
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-neutral-100 dark:bg-neutral-800'
            }`}
          >
            {f.label} ({counts[f.value] ?? 0})
          </button>
        ))}
      </div>

      <p className="text-xs text-neutral-500">Audience: {audience} participant(s)</p>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.subject}
            type="button"
            className="text-xs underline text-neutral-500"
            onClick={() => {
              setSubject(p.subject);
              setBody(p.body);
            }}
          >
            {p.subject}
          </button>
        ))}
      </div>

      <input
        className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-900"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-900"
        rows={6}
        placeholder="Body ({{name}} supported)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button
        type="button"
        disabled={sending}
        onClick={send}
        className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {sending ? 'Sending…' : 'Send announcement'}
      </button>
      {msg && <p className="text-sm text-green-600 dark:text-green-400">{msg}</p>}
    </div>
  );
}
