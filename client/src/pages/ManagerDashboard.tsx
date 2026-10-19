import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Event } from '../lib/api';

type ManagerPayload = {
  event: Event | null;
  events: Event[];
  stats: { registrations: number; eventsManaged: number };
  participants: { name: string; email: string; status: string }[];
};

export function ManagerDashboard() {
  const [data, setData] = useState<ManagerPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ManagerPayload>('/api/v1/manager/event')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8 text-center text-neutral-500">Loading manager dashboard…</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Manager dashboard</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">Cross-event operations and registration oversight.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border p-5 dark:border-white/10">
          <p className="text-sm text-neutral-500">Events</p>
          <p className="text-3xl font-bold">{data?.stats.eventsManaged ?? 0}</p>
        </div>
        <div className="rounded-2xl border p-5 dark:border-white/10">
          <p className="text-sm text-neutral-500">Registrations (selected)</p>
          <p className="text-3xl font-bold">{data?.stats.registrations ?? 0}</p>
        </div>
      </div>

      {data?.event && (
        <div className="mt-8 rounded-2xl border p-5 dark:border-white/10">
          <h2 className="font-semibold">{data.event.name}</h2>
          <p className="text-sm text-neutral-500">{data.event.organizationName}</p>
        </div>
      )}

      <h2 className="mt-10 font-semibold">Recent participants</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {(data?.participants || []).slice(0, 10).map((p, i) => (
          <li key={i} className="flex justify-between border-b border-neutral-100 py-2 dark:border-white/5">
            <span>{p.name}</span>
            <span className="text-neutral-500">{p.status}</span>
          </li>
        ))}
      </ul>

      <Link to="/organizer/participants" className="mt-6 inline-block text-sm underline">
        Open organizer participants →
      </Link>
    </div>
  );
}
