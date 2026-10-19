import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export function OrganizerInvite() {
  const [link, setLink] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get<{ url: string }>('/api/v1/organizer/invite-link').then((res) => setLink(res.data.url));
  }, []);

  const send = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      const res = await api.post('/api/v1/invites/send', { email, role: 'organizer' });
      setMsg(res.data.message || 'Invite sent');
      setEmail('');
    } catch {
      setMsg('Could not send invite');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-lg font-semibold">Invite co-organizers</h2>
      <p className="text-sm text-neutral-500">
        Share a magic link for local demos, or log an invite for MailerHub delivery when SMTP is configured.
      </p>
      {link && (
        <div className="rounded-lg border p-3 text-xs break-all dark:border-white/10">
          {link}
          <button
            type="button"
            className="mt-2 block text-sm underline"
            onClick={() => navigator.clipboard.writeText(link)}
          >
            Copy link
          </button>
        </div>
      )}
      <input
        className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-900"
        placeholder="Organizer email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        type="button"
        disabled={sending}
        onClick={send}
        className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {sending ? 'Sending…' : 'Send invite'}
      </button>
      {msg && <p className="text-sm text-green-600">{msg}</p>}
    </div>
  );
}
