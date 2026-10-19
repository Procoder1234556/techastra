import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { API } from '../lib/apiPaths';

type Quest = { _id: string; title: string; description?: string; rewardXp?: number; featured?: boolean };
type Submission = { questTitle: string; status: string; submissionUrl?: string };

export function DevQuests() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [mine, setMine] = useState<Submission[]>([]);
  const [enableMsg, setEnableMsg] = useState('');
  const [questProfile, setQuestProfile] = useState<{ xp?: number } | null>(null);

  useEffect(() => {
    api.get<any>('/api/v1/quests').then((res) => {
      const list = Array.isArray(res.data) ? res.data : res.data?.quests || [];
      setQuests(list);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get<any>('/api/v1/quests/mine').then((res) => {
      const list = Array.isArray(res.data) ? res.data : res.data?.quests || [];
      setMine(list);
    }).catch(() => setMine([]));
    api.get(API.questsMe).then(() => setQuestProfile({ xp: user.xp }));
  }, [user]);

  const enableQuests = async () => {
    const res = await api.post<{ message?: string }>('/api/v1/quests/enable');
    setEnableMsg(res.data.message || 'DevQuests enabled');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-3xl font-bold">DevQuests</h1>
        <div className="flex items-center gap-3 text-sm">
          {user && (
            <button type="button" onClick={enableQuests} className="underline">
              Enable / connect
            </button>
          )}
          <Link to="/devquests/leaderboard" className="underline">Leaderboard</Link>
        </div>
      </div>
      {enableMsg && <p className="mt-2 text-sm text-green-600">{enableMsg}</p>}
      {questProfile && user && (
        <p className="mt-2 text-xs text-neutral-500">Quest profile active · {user.xp ?? 0} XP</p>
      )}
      {mine.length > 0 && (
        <div className="mt-6 rounded-xl border p-4 dark:border-white/10">
          <h2 className="font-medium text-sm">Your submissions</h2>
          <ul className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            {mine.map((s, i) => (
              <li key={i}>{s.questTitle} — {s.status}</li>
            ))}
          </ul>
        </div>
      )}
      <ul className="mt-8 space-y-3">
        {quests.map((q) => (
          <li key={q._id}>
            <Link
              to={`/devquests/quest/${q._id}`}
              className="block rounded-xl border p-4 hover:border-neutral-400 dark:border-white/10"
            >
              <span className="font-semibold">{q.title}</span>
              {q.featured && (
                <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Featured</span>
              )}
              <p className="text-sm text-neutral-500 mt-1">{q.description}</p>
              <p className="text-xs mt-2">{q.rewardXp} XP</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
