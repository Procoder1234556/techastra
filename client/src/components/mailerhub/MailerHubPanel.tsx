import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { API } from '../../lib/apiPaths';

type Props = {
  type: 'certificate' | 'invitation' | 'notification';
  startLabel: string;
  subtitle: string;
  defaultSubject: string;
  defaultBody: string;
};

export function MailerHubPanel({ type, startLabel, subtitle, defaultSubject, defaultBody }: Props) {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [eventId, setEventId] = useState('');
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get<{ events: { id: string; name: string }[] }>('/api/v1/organizer-mailer/events').then((res) => {
      setEvents(res.data.events || []);
      if (res.data.events?.[0]) setEventId(res.data.events[0].id);
    });
  }, []);

  const start = async () => {
    setBusy(true);
    setMsg('');
    try {
      if (type === 'certificate') {
        const res = await api.post('/api/v1/mailerhub/certificates/send', {
          subject,
          bodyHtml: body.split('\n').map((l) => `<p>${l}</p>`).join(''),
          eventId: eventId || undefined,
        });
        setMsg(`Certificate batch: ${res.data.sent ?? 0} recipients`);
      } else {
        const created = await api.post('/api/v1/mailerhub/campaigns', {
          name: `${type} — ${subject}`,
          subject,
          bodyHtml: body.split('\n').map((l) => `<p>${l}</p>`).join(''),
          templateSlug: type === 'invitation' ? 'event_update' : 'registration_reminder',
          eventId: eventId || undefined,
          filterStatus: 'all',
        });
        const sent = await api.post(API.mailerhubCampaignsSend, { campaignId: created.data._id });
        setMsg(`Sent to ${sent.data.sent} (${sent.data.mode || 'done'})`);
      }
    } catch {
      setMsg('Send failed — check provider config in .env');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/50">{subtitle}</p>
      {events.length > 0 && (
        <select
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          {events.map((e) => (
            <option key={e.id} value={e.id} className="text-black">{e.name}</option>
          ))}
        </select>
      )}
      <input
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        rows={8}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 font-mono"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={start}
        className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 disabled:opacity-50"
      >
        {busy ? 'Sending…' : startLabel}
      </button>
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}
    </div>
  );
}
