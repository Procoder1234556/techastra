import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function MyCertificates() {
  const [certs, setCerts] = useState<{ title: string; eventName?: string; issuedAt: string }[]>([]);

  useEffect(() => {
    api.get('/api/v1/certificates/my').then((res) => setCerts(res.data));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold">My certificates</h1>
      <ul className="mt-6 space-y-3">
        {certs.map((c, i) => (
          <li key={i} className="rounded-xl border p-4 dark:border-white/10">
            <p className="font-medium">{c.title}</p>
            <p className="text-sm text-neutral-500">{c.eventName}</p>
          </li>
        ))}
        {certs.length === 0 && <p className="text-neutral-500">No certificates yet.</p>}
      </ul>
    </div>
  );
}
