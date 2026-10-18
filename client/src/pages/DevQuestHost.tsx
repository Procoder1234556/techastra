import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function DevQuestHost() {
  const { user, loginAs } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardXp, setRewardXp] = useState('50');
  const [featured, setFeatured] = useState(false);
  const [msg, setMsg] = useState('');
  const [questId, setQuestId] = useState('');

  const submit = async () => {
    if (!user) return loginAs('organizer@techastra.local');
    const res = await api.post('/api/v1/quests', {
      title,
      description,
      rewardXp: Number(rewardXp) || 50,
      featured,
    });
    setQuestId(res.data._id);
    setMsg('Quest published.');
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Host a DevQuest</h1>
        <Link to="/devquests" className="text-sm underline">All quests</Link>
      </div>
      <div className="mt-6 space-y-3">
        <input
          className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
          rows={4}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          className="w-full rounded-lg border px-3 py-2 dark:border-white/20"
          placeholder="Reward XP"
          value={rewardXp}
          onChange={(e) => setRewardXp(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured on DevQuests home
        </label>
        <button type="button" onClick={submit} className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">
          Create quest
        </button>
        {msg && (
          <p className="text-sm text-green-600">
            {msg}{' '}
            {questId && (
              <Link to={`/devquests/quest/${questId}`} className="underline">
                View quest
              </Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
