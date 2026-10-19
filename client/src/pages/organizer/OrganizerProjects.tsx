import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { API } from '../../lib/apiPaths';

type OrgEvent = { _id: string; name: string; hackathon: string };

type TeamRow = {
  _id: string;
  name: string;
  teamCode: string;
  submissionUrl?: string;
  projectScore?: number | null;
};

export function OrganizerProjects() {
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [eventId, setEventId] = useState('');
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<OrgEvent[]>(API.organizerEvents).then((res) => {
      setEvents(res.data);
      if (res.data[0]) setEventId(res.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!eventId) return;
    api.get<any>(`${API.projectsEvent}/${eventId}`).then((res) => {
      const list = Array.isArray(res.data) ? res.data : (res.data?.submissions || res.data?.teams || []);
      setRows(list);
    });
    api.get(`${API.projectsConfig}/${eventId}/manage`).then((res) => setConfig(res.data));
  }, [eventId]);

  const saveScore = async (teamId: string) => {
    const score = Number(scores[teamId]);
    if (!Number.isFinite(score)) return;
    const res = await api.post(`${API.projectsScore}/${teamId}`, { score });
    setRows((prev) =>
      prev.map((t) => (t._id === teamId ? { ...t, projectScore: res.data.projectScore } : t)),
    );
  };

  const approveTeam = async (teamId: string) => {
    await api.patch(`${API.registrationsTeam}/${teamId}/status`, { status: 'approved' });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">Project scoring</h2>
      <p className="mt-1 text-sm text-neutral-500">Judging pipeline via projects API (reference parity).</p>
      {events.length > 0 && (
        <select
          className="mt-3 w-full max-w-md rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-neutral-900"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          {events.map((e) => (
            <option key={e._id} value={e._id}>{e.name}</option>
          ))}
        </select>
      )}
      {config && (
        <p className="mt-2 text-xs text-neutral-500">
          Team size: {String(config.teamSize)} · deadline: {String(config.submissionDeadline || '—')}
        </p>
      )}
      <ul className="mt-4 space-y-3 text-sm">
        {rows.map((t) => (
          <li key={t._id} className="rounded-lg border p-4 dark:border-white/10">
            <div className="font-medium">{t.name}</div>
            <div className="text-neutral-500">code {t.teamCode}</div>
            {t.submissionUrl ? (
              <a href={t.submissionUrl} className="mt-1 block truncate text-blue-600 underline" target="_blank" rel="noreferrer">
                {t.submissionUrl}
              </a>
            ) : (
              <p className="mt-1 text-neutral-400">No submission URL yet</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                className="w-24 rounded-lg border px-2 py-1 dark:border-white/20 dark:bg-neutral-900"
                placeholder="Score"
                value={scores[t._id] ?? (t.projectScore != null ? String(t.projectScore) : '')}
                onChange={(e) => setScores((s) => ({ ...s, [t._id]: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => saveScore(t._id)}
                className="rounded-full bg-neutral-900 px-3 py-1 text-xs text-white dark:bg-white dark:text-neutral-900"
              >
                Save score
              </button>
              <button type="button" onClick={() => approveTeam(t._id)} className="text-xs underline">
                Approve team regs
              </button>
              {t.projectScore != null && <span className="text-xs text-green-600">Saved: {t.projectScore}</span>}
            </div>
          </li>
        ))}
        {rows.length === 0 && <p className="text-neutral-500">No teams for this event yet.</p>}
      </ul>
    </div>
  );
}
