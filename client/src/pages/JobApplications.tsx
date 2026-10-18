import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

export function JobApplications() {
  const { jobId } = useParams();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!jobId) return;
    api.get(`/api/v1/jobs/${jobId}/applications`).then((res) => setRows(res.data));
  }, [jobId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold">Job applications</h1>
      <ul className="mt-6 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={String(r.id)} className="border rounded-lg p-3 dark:border-white/10">
            {String(r.name)} — {String(r.email)} ({String(r.status)})
          </li>
        ))}
        {rows.length === 0 && <p className="text-neutral-500">No applications.</p>}
      </ul>
    </div>
  );
}
