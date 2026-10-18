import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export function OrganizerCheckIn() {
  const [stats, setStats] = useState<{ total: number } | null>(null);

  useEffect(() => {
    api.get('/api/v1/checkin/stats').then((res) => setStats(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold">QR check-in</h2>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Checked in (session): <strong>{stats?.total ?? 0}</strong>
      </p>
      <p className="mt-4 text-sm text-neutral-500">
        Production uses jsQR + /api/v1/checkin/scan — wired as a lightweight stub here.
      </p>
    </div>
  );
}
