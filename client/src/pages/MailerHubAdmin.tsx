import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Award,
  Bell,
  History,
  Mail,
  Send,
  Settings,
  Shield,
  LifeBuoy,
  Users,
  Newspaper,
} from 'lucide-react';
import { api } from '../lib/api';
import { MailerHubPanel } from '../components/mailerhub/MailerHubPanel';
import { MailerHubGmailTab } from '../components/mailerhub/MailerHubGmailTab';
import { MailerHubContactsTab } from '../components/mailerhub/MailerHubContactsTab';
import { MailerHubDataTab } from '../components/mailerhub/MailerHubDataTab';
import { MailerHubSupportTab } from '../components/mailerhub/MailerHubSupportTab';
import { MailerHubAdminTab } from '../components/mailerhub/MailerHubAdminTab';
import { MailerHubNewsletterTab } from '../components/mailerhub/MailerHubNewsletterTab';

type Tab =
  | 'certificates'
  | 'invitations'
  | 'notifications'
  | 'gmail'
  | 'support'
  | 'admin'
  | 'contacts'
  | 'data'
  | 'analytics'
  | 'newsletter'
  | 'history'
  | 'settings';

const TABS: { id: Tab; label: string; icon: typeof Mail }[] = [
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'invitations', label: 'Invitations', icon: Send },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'gmail', label: 'Gmail pool', icon: Mail },
  { id: 'support', label: 'Support', icon: LifeBuoy },
  { id: 'admin', label: 'Admin', icon: Shield },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'data', label: 'Data', icon: History },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'newsletter', label: 'Newsletter', icon: Newspaper },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

type ProviderStatus = {
  smtp: boolean;
  zepto: boolean;
  active: string | null;
};

export function MailerHubAdmin() {
  const [tab, setTab] = useState<Tab>('certificates');
  const [providers, setProviders] = useState<ProviderStatus | null>(null);
  const [overview, setOverview] = useState<{ campaigns: number; totalSent: number; deliveryRate: number } | null>(
    null,
  );
  const [settings, setSettings] = useState<{
    provider?: string | null;
    fromName?: string;
    fromEmail?: string;
    smtpHost?: string | null;
    zeptoConfigured?: boolean;
  } | null>(null);
  const [history, setHistory] = useState<{ records: unknown[]; stats: Record<string, number> } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [campaignStats, setCampaignStats] = useState<{ id: string; name: string; sent: number; status: string }[]>(
    [],
  );

  const refresh = () => {
    api.get<ProviderStatus>('/api/v1/mailerhub/providers/status').then((r) => setProviders(r.data));
    api.get('/api/v1/mailerhub/analytics/overview').then((r) => setOverview(r.data));
    api.get('/api/v1/mailerhub/settings').then((r) => setSettings(r.data));
    api.get('/api/v1/mailerhub/userbase/count').then((r) => setUserCount(r.data.count));
    api.get('/api/v1/mailerhub/history', { params: { type: tab === 'certificates' ? 'certificate' : undefined } }).then(
      (r) => setHistory(r.data),
    );
    if (tab === 'analytics') {
      api.get('/api/v1/mailerhub/analytics/campaigns').then((r) => setCampaignStats(r.data));
    }
  };

  useEffect(() => {
    refresh();
  }, [tab]);

  const runTest = async () => {
    const res = await api.post('/api/v1/mailerhub/campaigns/test', { email: testEmail || undefined });
    setTestMsg(res.data.message || (res.data.sent ? 'Test email sent' : 'No provider configured'));
  };

  return (
    <div className="-mx-4 -mt-4 min-h-[calc(100vh-3.5rem)] bg-neutral-950 text-white md:-mx-0">
      <div className="border-b border-white/10 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">MailerHub</p>
            <h1 className="font-display text-2xl font-bold">Campaign console</h1>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span
              className={`rounded-full px-3 py-1 ${providers?.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-200'}`}
            >
              {providers?.active ? `Email: ${providers.active}` : 'In-app only (set .env)'}
            </span>
            <Link to="/admin" className="text-white/50 underline hover:text-white">← Admin</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                tab === t.id ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <t.icon className="h-4 w-4 shrink-0" />
              {t.label}
            </button>
          ))}
        </nav>

        <main className="min-w-0 space-y-6">
          {tab === 'certificates' && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">Certificate delivery</h2>
              <MailerHubPanel
                type="certificate"
                startLabel="Start certificate send"
                subtitle="Batch-send participation certificates to approved registrants for the selected event."
                defaultSubject="Your certificate of participation"
                defaultBody={`Hi {{name}},\n\nPlease find your certificate of participation attached.\n\nThe Techastra Team`}
              />
            </section>
          )}

          {tab === 'invitations' && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">Invitations</h2>
              <MailerHubPanel
                type="invitation"
                startLabel="Start invitations"
                subtitle="Invite recipients via the Invitations pool (SMTP or Zepto when configured)."
                defaultSubject="You're invited!"
                defaultBody={`Hi {{name}},\n\nYou're invited to join our upcoming event on Techastra.\n\nThe Techastra Team`}
              />
            </section>
          )}

          {tab === 'notifications' && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <MailerHubPanel
                type="notification"
                startLabel="Start notifications"
                subtitle="One-off announcements via the Notifications pool."
                defaultSubject="Announcement"
                defaultBody={`Hi {{name}},\n\nWe have an important update for you.\n\nThe Techastra Team`}
              />
            </section>
          )}

          {tab === 'gmail' && <MailerHubGmailTab />}

          {tab === 'support' && <MailerHubSupportTab />}

          {tab === 'admin' && <MailerHubAdminTab />}

          {tab === 'contacts' && <MailerHubContactsTab />}

          {tab === 'data' && <MailerHubDataTab />}

          {tab === 'analytics' && (
            <section className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Campaigns</p>
                  <p className="mt-2 text-3xl font-bold">{overview?.campaigns ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Total sends</p>
                  <p className="mt-2 text-3xl font-bold">{overview?.totalSent ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Userbase
                  </p>
                  <p className="mt-2 text-3xl font-bold">{userCount}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="font-medium">Campaign breakdown</h3>
                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  {campaignStats.length === 0 && <li className="text-white/40">No campaigns yet.</li>}
                  {campaignStats.map((c) => (
                    <li key={c.id} className="flex justify-between border-b border-white/5 py-2">
                      <span>{c.name}</span>
                      <span className="text-white/40">{c.status} · {c.sent} sent</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {tab === 'newsletter' && <MailerHubNewsletterTab />}

          {tab === 'history' && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">Delivery history</h2>
              <p className="mt-1 text-sm text-white/40">
                {history?.stats?.total ?? 0} campaigns · {history?.stats?.sent ?? 0} total deliveries logged
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {(history?.records as { subject?: string; status?: string; sentCount?: number }[] | undefined)
                  ?.slice(0, 20)
                  .map((r, i) => (
                    <li key={i} className="flex justify-between border-b border-white/5 py-2">
                      <span>{r.subject || 'Campaign'}</span>
                      <span className="text-white/40">{r.status} · {r.sentCount ?? 0}</span>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {tab === 'settings' && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5" /> Provider
                </h2>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-white/40">Active</dt>
                    <dd>{settings?.provider || 'none'}</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">From</dt>
                    <dd>{settings?.fromName} &lt;{String(settings?.fromEmail)}&gt;</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">SMTP</dt>
                    <dd>{settings?.smtpHost || 'not set'}</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Zepto</dt>
                    <dd>{settings?.zeptoConfigured ? 'configured' : 'not set'}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-white/40">
                  Configure <code className="text-white/60">EMAIL_HOST</code>, <code className="text-white/60">EMAIL_USER</code>,{' '}
                  <code className="text-white/60">EMAIL_PASS</code>, <code className="text-white/60">EMAIL_FROM</code> or{' '}
                  <code className="text-white/60">ZEPTOMAIL_TOKEN</code> in project root <code className="text-white/60">.env</code> and restart the API.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
                <p className="text-sm font-medium text-blue-200">Send test email</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
                    placeholder="you@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={runTest}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900"
                  >
                    Test provider
                  </button>
                </div>
                {testMsg && <p className="mt-2 text-xs text-blue-100/80">{testMsg}</p>}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
