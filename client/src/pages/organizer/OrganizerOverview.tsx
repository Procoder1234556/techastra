import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export function OrganizerOverview() {
  const [stats, setStats] = useState<{ eventsHosted: number; totalRegistrations: number } | null>(
    null,
  );

  useEffect(() => {
    api.get('/api/v1/organizer/dashboard').then((res) => setStats(res.data));
  }, []);

  return (
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
  );
}
