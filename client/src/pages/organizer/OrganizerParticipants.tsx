import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export function OrganizerParticipants() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.get('/api/v1/organizer/participants').then((res) => setRows(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold">Participants</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={String(r.id)} className="rounded-lg border p-3 dark:border-white/10">
            {String(r.name)} · {String(r.email)} — {String(r.event_name || r.event_title)}
          </li>
        ))}
        {rows.length === 0 && <p className="text-neutral-500">No registrations yet.</p>}
      </ul>
    </div>
  );
}
