import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

type Quest = { _id: string; title: string; description?: string; rewardXp?: number; featured?: boolean };

export function DevQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    api.get<Quest[]>('/api/v1/quests').then((res) => setQuests(res.data));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">DevQuests</h1>
        <Link to="/devquests/leaderboard" className="text-sm underline">Leaderboard</Link>
      </div>
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
