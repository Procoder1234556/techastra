import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { API } from '../../lib/apiPaths';
import type { Event } from '../../lib/api';

export function OrganizerOverview() {
  const [stats, setStats] = useState<{ eventsHosted: number; totalRegistrations: number } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    api.get(`${API.organizer}/dashboard`).then((res) => setStats(res.data));
    api.get<Event[]>(API.organizerEvents).then((res) => setEvents(res.data));
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border p-6 dark:border-white/10">
          <p className="text-sm text-neutral-500">Events hosted</p>
          <p className="text-3xl font-bold">{stats?.eventsHosted ?? '—'}</p>
        </div>
        <div className="rounded-2xl border p-6 dark:border-white/10">
          <p className="text-sm text-neutral-500">Registrations</p>
          <p className="text-3xl font-bold">{stats?.totalRegistrations ?? '—'}</p>
        </div>
      </div>
      <div>
        <h2 className="font-semibold">Your events</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {events.map((e) => (
            <li key={e._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 dark:border-white/10">
              <Link to={`/event/${e.hackathon}`} className="font-medium underline">{e.name}</Link>
              <Link to={`/HostEvent?edit=${encodeURIComponent(e.hackathon)}`} className="text-xs text-neutral-500 underline">
                Edit
              </Link>
            </li>
          ))}
          {events.length === 0 && <p className="text-neutral-500">No events yet — use Host Event from the nav.</p>}
        </ul>
      </div>
    </div>
  );
}
