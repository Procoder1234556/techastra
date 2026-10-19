import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Trophy } from 'lucide-react';
import { api, type Event } from '../lib/api';

type FilterKey = 'all' | 'hackathon' | 'workshop' | 'meetup';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'hackathon', label: 'Hackathons' },
  { key: 'workshop', label: 'Workshops' },
  { key: 'meetup', label: 'Meetups' },
];

function isLive(event: Event) {
  return event.live === true || event.live === 'true';
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [past, setPast] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get<Event[]>('/api/v1/events')
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!search.trim()) {
        api.get<Event[]>('/api/v1/events').then((res) => setEvents(res.data));
        return;
      }
      api
        .get<Event[]>('/api/v1/events/search', { params: { q: search.trim() } })
        .then((res) => setEvents(res.data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const featured = useMemo(() => {
    const live = events.filter(isLive);
    const f = live.filter((e) => e.isFeatured);
    return f.length ? f.slice(0, 3) : live.slice(0, 3);
  }, [events]);

  const list = useMemo(() => {
    let rows = past ? events.filter((e) => !isLive(e)) : events.filter(isLive);
    if (filter !== 'all') {
      rows = rows.filter((e) => (e.eventType || '').toLowerCase() === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.subtitle?.toLowerCase().includes(q) ||
          e.organizationName?.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [events, filter, past, search]);

  if (loading) {
    return <p className="p-8 text-center text-neutral-500">Loading events…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Browse Events</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Live hackathons, workshops, and meetups — register in one click.
      </p>

      {featured.length > 0 && !past && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Featured</h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {featured.map((event) => (
              <li key={event._id}>
                <Link
                  to={`/event/${event.hackathon}`}
                  className="block h-full rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 dark:border-amber-500/20 dark:bg-amber-500/5"
                >
                  <Trophy className="h-5 w-5 text-amber-600" />
                  <h3 className="mt-2 font-semibold">{event.name}</h3>
                  <p className="text-sm text-neutral-500">{event.organizationName}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === f.key
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPast(false)}
            className={`rounded-full px-4 py-2 text-sm ${!past ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border dark:border-white/20'}`}
          >
            Live
          </button>
          <button
            type="button"
            onClick={() => setPast(true)}
            className={`rounded-full px-4 py-2 text-sm ${past ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border dark:border-white/20'}`}
          >
            Past
          </button>
        </div>
      </div>

      <div className="relative mt-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          className="w-full rounded-full border border-neutral-200 py-2 pl-10 pr-4 text-sm dark:border-white/20 dark:bg-neutral-900"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {list.length === 0 ? (
        <p className="mt-16 text-center text-neutral-500">No events found.</p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {list.map((event) => (
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
                <p className="mt-3 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Calendar className="h-4 w-4" />
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
