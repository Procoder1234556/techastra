import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type Campaign = {
  _id: string;
  name: string;
  subject: string;
  status: string;
  sentCount: number;
};

export function OrganizerEventMailer() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [template, setTemplate] = useState('registration_reminder');
  const [templates, setTemplates] = useState<{ slug: string; name: string }[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [eventId, setEventId] = useState('');
  const [mailerMsg, setMailerMsg] = useState('');

  useEffect(() => {
    api.get('/api/v1/communications/preview').then((res) => setCounts(res.data.counts || {}));
    api.get('/api/v1/mailerhub/templates').then((res) => setTemplates(res.data));
    api.get('/api/v1/mailerhub/campaigns').then((res) => setCampaigns(res.data));
  }, []);

  const sendBulk = async () => {
    const res = await api.post('/api/v1/communications/send', {
      subject,
      body,
      eventId: eventId || undefined,
      filterStatus: 'all',
      template,
    });
    setMailerMsg(res.data.message || 'Sent');
    const list = await api.get('/api/v1/mailerhub/campaigns');
    setCampaigns(list.data);
  };

  const createAndSendCampaign = async () => {
    const created = await api.post('/api/v1/mailerhub/campaigns', {
      template,
      subject,
      bodyHtml: body ? `<p>${body}</p>` : undefined,
      eventId: eventId || undefined,
      filterStatus: 'all',
    });
    const sent = await api.post(`/api/v1/mailerhub/campaigns/${created.data._id}/send`);
    setMailerMsg(`MailerHub sent to ${sent.data.sent} recipients`);
    const list = await api.get('/api/v1/mailerhub/campaigns');
    setCampaigns(list.data);
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-lg font-semibold">Event mailer</h2>
      <p className="text-sm text-neutral-500">
        MailerHub subset: templates, campaigns, send, and delivery stats (in-app + log; add SMTP for email).
      </p>
      <p className="text-xs text-neutral-500">Audience: {JSON.stringify(counts)}</p>
      <input
        className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-900"
        placeholder="Event ID (optional — limits to registrants)"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
      />
      <select
        className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-900"
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
      >
        {templates.map((t) => (
          <option key={t.slug} value={t.slug}>{t.name}</option>
        ))}
      </select>
      <input
        className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-900"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-900"
        rows={4}
        placeholder="Body (use {{name}} in templates)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={sendBulk}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-900"
        >
          Send via communications
        </button>
        <button
          type="button"
          onClick={createAndSendCampaign}
          className="rounded-full border px-4 py-2 text-sm dark:border-white/20"
        >
          Create & send campaign
        </button>
      </div>
      {mailerMsg && <p className="text-sm text-amber-700 dark:text-amber-400">{mailerMsg}</p>}
      {campaigns.length > 0 && (
        <ul className="text-xs text-neutral-500 space-y-1 border-t pt-3 dark:border-white/10">
          {campaigns.slice(0, 5).map((c) => (
            <li key={c._id}>
              {c.subject} — {c.status} ({c.sentCount} sent)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
