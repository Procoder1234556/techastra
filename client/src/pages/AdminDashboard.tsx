import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Event, type User } from '../lib/api';
import { API } from '../lib/apiPaths';

export function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [providers, setProviders] = useState<{ smtp: boolean; zepto: boolean } | null>(null);
  const [mailerOverview, setMailerOverview] = useState<{ campaigns: number; totalSent: number } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [emails, setEmails] = useState<{ email: string; name: string; role: string }[]>([]);
  const [appointEventId, setAppointEventId] = useState('');
  const [appointEmail, setAppointEmail] = useState('');
  const [appointMsg, setAppointMsg] = useState('');

  useEffect(() => {
    api.get<Event[]>('/api/v1/events').then((res) => setEvents(res.data));
    api.get<{ count: number }>('/api/v1/mailerhub/userbase/count').then((res) => setUserCount(res.data.count));
    api.get('/api/v1/mailerhub/providers/status').then((res) => setProviders(res.data));
    api.get('/api/v1/mailerhub/analytics/overview').then((res) => setMailerOverview(res.data));
    api.get<{ users: User[] }>(API.users, { params: { limit: 20 } }).then((res) => setUsers(res.data.users || []));
    api.get<{ email: string; name: string; role: string }[]>(API.usersEmails).then((res) => setEmails(res.data));
  }, []);

  const toggleVerify = async (slug: string, verified: boolean) => {
    await api.patch(`/api/v1/events/verify/${encodeURIComponent(slug)}`, { verified: !verified });
    setEvents((prev) =>
      prev.map((e) => (e.hackathon === slug ? { ...e, verified: !verified } : e)),
    );
  };

  const duplicateEvent = async (e: Event) => {
    const res = await api.post<Event>('/api/v1/events/duplicate', {
      eventId: e.hackathon,
      name: `${e.name} (Copy)`,
    });
    setEvents((prev) => [res.data, ...prev]);
  };

  const deleteEvent = async (e: Event) => {
    if (!window.confirm(`Delete "${e.name}"?`)) return;
    await api.delete(`/api/v1/events/delete/${encodeURIComponent(e.hackathon)}`);
    setEvents((prev) => prev.filter((x) => x._id !== e._id));
  };

  const appointOrganizer = async () => {
    if (!appointEventId || !appointEmail.trim()) {
      setAppointMsg('Pick an event and user email.');
      return;
    }
    const listed = await api.get<{ users: User[] }>(API.users, {
      params: { email: appointEmail.trim(), limit: 1 },
    });
    const userRow = listed.data.users[0];
    if (!userRow) {
      setAppointMsg('No user with that email.');
      return;
    }
    await api.post(API.eventsAppointOrganizer, { eventId: appointEventId, userId: userRow._id });
    setAppointMsg(`Organizer added for ${userRow.email}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Superadmin Dashboard</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        MailerHub, events verification, and platform health.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border p-4 dark:border-white/10">
          <p className="text-xs text-neutral-500">Users</p>
          <p className="text-2xl font-bold">{userCount}</p>
        </div>
        <div className="rounded-2xl border p-4 dark:border-white/10">
          <p className="text-xs text-neutral-500">Events</p>
          <p className="text-2xl font-bold">{events.length}</p>
        </div>
        <div className="rounded-2xl border p-4 dark:border-white/10">
          <p className="text-xs text-neutral-500">MailerHub</p>
          <p className="text-sm mt-1">
            {mailerOverview?.campaigns ?? 0} campaigns · {mailerOverview?.totalSent ?? 0} sends
          </p>
          <p className="text-xs mt-1 text-neutral-500">
            SMTP {providers?.smtp ? 'on' : 'off'} · Zepto {providers?.zepto ? 'on' : 'off'}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link to="/superadmin/invites" className="underline">Invites</Link>
        <Link to="/admin/mailerhub" className="underline">MailerHub console</Link>
        <Link to="/organizer/event-mailer" className="underline">Organizer mailer</Link>
      </div>

      <h2 className="mt-10 font-semibold">Appoint organizer</h2>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <select
          className="rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-950"
          value={appointEventId}
          onChange={(e) => setAppointEventId(e.target.value)}
        >
          <option value="">Event</option>
          {events.map((e) => (
            <option key={e._id} value={e._id}>{e.name}</option>
          ))}
        </select>
        <input
          className="min-w-[200px] rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-neutral-950"
          placeholder="organizer@techastra.local"
          value={appointEmail}
          onChange={(e) => setAppointEmail(e.target.value)}
          list="admin-user-emails"
        />
        <datalist id="admin-user-emails">
          {emails.map((e) => (
            <option key={e.email} value={e.email} />
          ))}
        </datalist>
        <button type="button" onClick={appointOrganizer} className="rounded-full bg-neutral-900 px-4 py-2 text-white dark:bg-white dark:text-neutral-900">
          Appoint
        </button>
      </div>
      {appointMsg && <p className="mt-2 text-sm text-green-600">{appointMsg}</p>}

      <h2 className="mt-10 font-semibold">Users (sample)</h2>
      <ul className="mt-3 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
        {users.slice(0, 10).map((u) => (
          <li key={u._id}>{u.name} · {u.email} · {u.role}</li>
        ))}
      </ul>

      <h2 className="mt-10 font-semibold">Event verification</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {events.slice(0, 15).map((e) => (
          <li key={e._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 dark:border-white/10">
            <span>{e.name}</span>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => duplicateEvent(e)} className="text-xs underline">
                Duplicate
              </button>
              <button type="button" onClick={() => deleteEvent(e)} className="text-xs text-red-600 underline">
                Delete
              </button>
              <button
                type="button"
                onClick={() => toggleVerify(e.hackathon, !!e.verified)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  e.verified
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'
                    : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                }`}
              >
                {e.verified ? 'Verified' : 'Verify'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
