import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Event } from '../lib/api';

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Event[]>('/api/v1/events')
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-8 text-center text-neutral-500">Loading events…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Browse Events</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Live and upcoming hackathons, workshops, and challenges.
      </p>
      {events.length === 0 ? (
        <p className="mt-12 text-center text-neutral-500">No events found. Run npm run seed in server.</p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <li key={event._id}>
              <Link
                to={`/event/${event.hackathon}`}
                className="block rounded-2xl border border-neutral-200 p-5 hover:shadow-md transition dark:border-white/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-lg">{event.name}</h2>
                  {event.isFeatured && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-500">{event.organizationName}</p>
                <p className="mt-3 text-sm">
                  {event.startDate} · {event.location}
                </p>
                {event.hasRegistered && (
                  <span className="mt-3 inline-block text-xs font-medium text-green-600">Registered</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
