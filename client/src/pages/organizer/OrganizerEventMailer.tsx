import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { API } from '../../lib/apiPaths';

type Campaign = {
  _id: string;
  name: string;
  subject: string;
  status: string;
  sentCount: number;
};

type MailerEvent = { id: string; name: string; hackathon: string };

export function OrganizerEventMailer() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<MailerEvent[]>([]);
  const [template, setTemplate] = useState('registration_reminder');
  const [templates, setTemplates] = useState<{ slug: string; name: string }[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [eventId, setEventId] = useState('');
  const [mailerMsg, setMailerMsg] = useState('');
  const [analytics, setAnalytics] = useState<{ totalSent: number; campaigns: number } | null>(null);
  const [eventMeta, setEventMeta] = useState<{ event: { name: string }; registrantCount: number } | null>(null);

  useEffect(() => {
    api.get('/api/v1/communications/preview').then((res) => setCounts(res.data.counts || {}));
    api.get('/api/v1/mailerhub/templates').then((res) => setTemplates(res.data));
    api.get('/api/v1/mailerhub/campaigns').then((res) => setCampaigns(res.data));
    api.get('/api/v1/mailerhub/analytics/overview').then((res) => setAnalytics(res.data));
    api.get<{ events: MailerEvent[] }>('/api/v1/organizer-mailer/events').then((res) => {
      setEvents(res.data.events || []);
      if (res.data.events?.[0]) setEventId(res.data.events[0].id);
    });
  }, []);

  useEffect(() => {
    if (!eventId) {
      setEventMeta(null);
      return;
    }
    api
      .get<{ event: { name: string }; registrantCount: number }>('/api/v1/organizer-mailer/event', {
        headers: { 'x-event-id': eventId },
      })
      .then((res) => setEventMeta(res.data))
      .catch(() => setEventMeta(null));
  }, [eventId]);

  const sendBulk = async () => {
    const res = await api.post('/api/v1/communications/send', {
      subject,
      body,
      eventId: eventId || undefined,
      filterStatus: 'all',
      template,
    });
    setMailerMsg(res.data.message || 'Sent');
    refreshCampaigns();
  };

  const createAndSendCampaign = async () => {
    const created = await api.post('/api/v1/mailerhub/campaigns', {
      templateSlug: template,
      subject,
      bodyHtml: body ? `<p>${body}</p>` : undefined,
      eventId: eventId || undefined,
      filterStatus: 'all',
    });
    const sent = await api.post(API.mailerhubCampaignsSend, { campaignId: created.data._id });
    setMailerMsg(`MailerHub sent to ${sent.data.sent} recipients`);
    refreshCampaigns();
  };

  const refreshCampaigns = () => {
    api.get('/api/v1/mailerhub/campaigns').then((res) => setCampaigns(res.data));
    api.get('/api/v1/mailerhub/analytics/overview').then((res) => setAnalytics(res.data));
  };

  const sendOrganizerMailer = async () => {
    const res = await api.post('/api/v1/organizer-mailer/send', {
      subject,
      bodyHtml: body ? `<p>${body}</p>` : undefined,
      eventId,
      filterStatus: 'all',
      template,
    });
    setMailerMsg(`Organizer mailer sent (${res.data.sent ?? 0} recipients)`);
    refreshCampaigns();
  };

  const sendCertificates = async () => {
    const res = await api.post('/api/v1/organizer-mailer/certificates', {
      subject: subject || 'Your certificate',
      bodyHtml: body ? `<p>${body}</p>` : undefined,
      eventId,
    });
    setMailerMsg(`Certificate batch queued (${res.data.sent ?? 0} sent)`);
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-lg font-semibold">Event mailer</h2>
      <p className="text-sm text-neutral-500">
        Templates, campaigns, and delivery stats for your event audience.
      </p>
      {analytics && (
        <p className="text-xs text-neutral-500">
          {analytics.campaigns} campaigns · {analytics.totalSent} total sends
        </p>
      )}
      <p className="text-xs text-neutral-500">Audience: {JSON.stringify(counts)}</p>
      {eventMeta && (
        <p className="text-xs text-neutral-500">
          {eventMeta.event.name} · {eventMeta.registrantCount} registrants
        </p>
      )}

      {events.length > 0 && (
        <select
          className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-900"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      )}

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
        <button
          type="button"
          onClick={sendOrganizerMailer}
          className="rounded-full border px-4 py-2 text-sm dark:border-white/20"
        >
          Organizer-mailer send
        </button>
        <button
          type="button"
          onClick={sendCertificates}
          className="rounded-full border px-4 py-2 text-sm dark:border-white/20"
        >
          Certificate batch
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
