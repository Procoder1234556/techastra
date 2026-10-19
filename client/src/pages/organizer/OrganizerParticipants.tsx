import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { API } from '../../lib/apiPaths';
import type { Event } from '../../lib/api';

type RegistrationRow = {
  id: string;
  name: string;
  email: string;
  status: string;
  event_name?: string;
  event_title?: string;
  hackathon?: string;
};

export function OrganizerParticipants() {
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState('');

  const load = () => {
    if (eventId) {
      api.get<RegistrationRow[]>(API.organizerParticipants, { params: { eventId } }).then((res) => setRows(res.data));
      return;
    }
    api.get<RegistrationRow[]>('/api/v1/registrations').then((res) => setRows(res.data));
  };

  useEffect(() => {
    api.get<Event[]>(API.organizerEvents).then((res) => setEvents(res.data));
  }, []);

  useEffect(() => {
    load();
  }, [eventId]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setStatus = async (id: string, status: string) => {
    await api.patch(`/api/v1/registrations/${id}/status`, { status });
    load();
  };

  const bulkStatus = async (status: string) => {
    if (selected.size === 0) return;
    await api.patch('/api/v1/registrations/bulk/status', { ids: [...selected], status });
    setSelected(new Set());
    setMsg(`Updated ${selected.size} registrations to ${status}`);
    load();
  };

  const downloadCsv = async () => {
    const res = await api.get('/api/v1/registrations/downloadRegistrations', {
      params: { filterStatus: 'all' },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">Participants</h2>
      <p className="mt-1 text-sm text-neutral-500">Approve registrations, bulk updates, and CSV export.</p>
      {events.length > 0 && (
        <select
          className="mt-3 w-full max-w-md rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-neutral-900"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          <option value="">All events</option>
          {events.map((e) => (
            <option key={e._id} value={e._id}>{e.name}</option>
          ))}
        </select>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => bulkStatus('approved')}
          className="rounded-full bg-green-700 px-3 py-1 text-xs text-white"
        >
          Approve selected
        </button>
        <button
          type="button"
          onClick={() => bulkStatus('rejected')}
          className="rounded-full border px-3 py-1 text-xs dark:border-white/20"
        >
          Reject selected
        </button>
        <button type="button" onClick={downloadCsv} className="rounded-full border px-3 py-1 text-xs dark:border-white/20">
          Download CSV
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-green-600">{msg}</p>}
      <ul className="mt-4 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3 dark:border-white/10">
            <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
            <span className="flex-1 min-w-[200px]">
              {r.name} · {r.email} — {r.event_name || r.event_title}
            </span>
            <span className="text-xs text-neutral-500">{r.status}</span>
            {r.status !== 'approved' && (
              <button type="button" className="text-xs underline" onClick={() => setStatus(r.id, 'approved')}>
                Approve
              </button>
            )}
            {r.status !== 'rejected' && (
              <button type="button" className="text-xs underline" onClick={() => setStatus(r.id, 'rejected')}>
                Reject
              </button>
            )}
          </li>
        ))}
        {rows.length === 0 && <p className="text-neutral-500">No registrations yet.</p>}
      </ul>
    </div>
  );
}
