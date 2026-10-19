import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type DataRecord = {
  _id: string;
  name: string;
  email: string;
  status: string;
  eventName: string;
  createdAt: string;
};

export function MailerHubDataTab() {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<{ records: DataRecord[] }>('/api/v1/mailerhub/data', { params: { limit: 100 } })
      .then((r) => setRecords(r.data.records || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const open = (id: string) => {
    api.get<{ record: Record<string, unknown> }>(`/api/v1/mailerhub/data/${id}`).then((r) => setSelected(r.data.record));
  };

  const download = (id: string) => {
    window.open(`/api/v1/mailerhub/data/${id}/download`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold">Registration data</h2>
        <p className="mt-1 text-sm text-white/40">Recent registrations across events — open or download CSV.</p>
      </div>
      {loading ? (
        <p className="text-sm text-white/40">Loading…</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {records.map((r) => (
            <li
              key={r._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 px-4 py-3"
            >
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-white/40">{r.eventName} · {r.status}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="text-xs underline" onClick={() => open(r._id)}>View</button>
                <button type="button" className="text-xs underline" onClick={() => download(r._id)}>CSV</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/70">
          {JSON.stringify(selected, null, 2)}
        </pre>
      )}
    </div>
  );
}
