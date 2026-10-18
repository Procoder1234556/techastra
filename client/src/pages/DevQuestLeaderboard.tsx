import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function DevQuestLeaderboard() {
  const [rows, setRows] = useState<{ name: string; xp: number; college?: string }[]>([]);

  useEffect(() => {
    api.get('/api/v1/quests/leaderboard').then((res) => setRows(res.data));
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-display text-2xl font-bold">Leaderboard</h1>
      <ol className="mt-6 space-y-2">
        {rows.map((r, i) => (
          <li key={r.name + i} className="flex justify-between rounded-lg border px-3 py-2 dark:border-white/10">
            <span>{i + 1}. {r.name}</span>
            <span className="text-neutral-500">{r.xp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
