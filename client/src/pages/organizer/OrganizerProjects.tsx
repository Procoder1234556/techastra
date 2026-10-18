import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type TeamRow = {
  _id: string;
  name: string;
  teamCode: string;
  eventName?: string;
  submissionUrl?: string;
  projectScore?: number | null;
};

export function OrganizerProjects() {
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<TeamRow[]>('/api/v1/organizer/projects').then((res) => setRows(res.data));
  }, []);

  const saveScore = async (teamId: string) => {
    const score = Number(scores[teamId]);
    if (!Number.isFinite(score)) return;
    const res = await api.patch(`/api/v1/organizer/projects/${teamId}/score`, { score });
    setRows((prev) => prev.map((t) => (t._id === teamId ? { ...t, projectScore: res.data.projectScore } : t)));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">Project scoring</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Teams linked to your events. Score hackathon submissions locally (production uses a full judging pipeline).
      </p>
      <ul className="mt-4 space-y-3 text-sm">
        {rows.map((t) => (
          <li key={t._id} className="rounded-lg border p-4 dark:border-white/10">
            <div className="font-medium">{t.name}</div>
            <div className="text-neutral-500">{t.eventName} · code {t.teamCode}</div>
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
              {t.projectScore != null && <span className="text-xs text-green-600">Saved: {t.projectScore}</span>}
            </div>
          </li>
        ))}
        {rows.length === 0 && <p className="text-neutral-500">No teams for your events yet.</p>}
      </ul>
    </div>
  );
}
