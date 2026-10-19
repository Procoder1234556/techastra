import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { API } from '../lib/apiPaths';
type Submission = {
  _id: string;
  questTitle: string;
  userName: string;
  userEmail: string;
  submissionUrl?: string;
  status: string;
};

export function DevQuestAdmin() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [err, setErr] = useState('');

  const load = () => {
    api.get<{ pendingCount: number }>(API.questsAdmin).then((res) => setPendingCount(res.data.pendingCount ?? 0));
    api.get<Submission[]>(API.questsAdminPending).catch(() => []);
    api
      .get<Submission[]>(API.questsSubmissions)
      .then((res) => {
        setErr('');
        setRows(res.data);
      })
      .catch(() => {
        setErr('Admin access required — sign in as admin@techastra.local from the header.');
        setRows([]);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    await api.patch(`/api/v1/quests/admin/submissions/${id}`, { status });
    load();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Quest moderation</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Approve or reject DevQuest submissions · {pendingCount} pending in queue.
      </p>
      {err && <p className="mt-2 text-sm text-amber-600">{err}</p>}
      <ul className="mt-8 space-y-3 text-sm">
        {rows.map((s) => (
          <li key={s._id} className="rounded-xl border p-4 dark:border-white/10">
            <div className="font-medium">{s.questTitle}</div>
            <div className="text-neutral-500">{s.userName} · {s.userEmail}</div>
            {s.submissionUrl && (
              <a href={s.submissionUrl} className="mt-1 block truncate underline" target="_blank" rel="noreferrer">
                {s.submissionUrl}
              </a>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-white/10">{s.status}</span>
              {s.status === 'pending' && (
                <>
                  <button
                    type="button"
                    className="rounded-full bg-green-700 px-3 py-1 text-xs text-white"
                    onClick={() => setStatus(s._id, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rounded-full border px-3 py-1 text-xs dark:border-white/20"
                    onClick={() => setStatus(s._id, 'rejected')}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
        {rows.length === 0 && !err && <p className="text-neutral-500">No submissions yet.</p>}
      </ul>
    </div>
  );
}
