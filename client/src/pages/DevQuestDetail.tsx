import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function DevQuestDetail() {
  const { id } = useParams();
  const { user, loginAs } = useAuth();
  const [quest, setQuest] = useState<{ title: string; description?: string } | null>(null);
  const [url, setUrl] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/v1/quests/${id}`).then((res) => setQuest(res.data));
  }, [id]);

  const submit = async () => {
    if (!user) return loginAs('student@techastra.local');
    await api.post(`/api/v1/quests/${id}/submit`, { url });
    setDone(true);
  };

  if (!quest) return <p className="p-8 text-center">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-2xl font-bold">{quest.title}</h1>
      <p className="mt-3 text-neutral-600">{quest.description}</p>
      <input
        className="mt-6 w-full rounded-lg border px-3 py-2 dark:border-white/20"
        placeholder="Submission URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button type="button" onClick={submit} className="mt-3 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">
        Submit
      </button>
      {done && <p className="mt-3 text-sm text-green-600">Submitted — +10 XP</p>}
    </div>
  );
}
