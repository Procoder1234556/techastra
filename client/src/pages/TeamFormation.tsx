import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function TeamFormation() {
  const { eventId } = useParams();
  const { user, loginAs } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [team, setTeam] = useState<{ teamCode: string; name: string } | null>(null);

  const create = async () => {
    if (!user) return loginAs('student@techastra.local');
    const res = await api.post('/api/v1/teams/create', { eventId, name: teamName });
    setTeam(res.data);
  };

  const join = async () => {
    if (!user) return loginAs('student@techastra.local');
    const res = await api.post('/api/v1/teams/join', { teamCode: joinCode });
    setTeam(res.data);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-2xl font-bold">Team formation</h1>
      <p className="text-sm text-neutral-500 mt-1">Event: {eventId}</p>
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="font-medium">Create team</h2>
          <input
            className="mt-2 w-full rounded-lg border px-3 py-2 dark:border-white/20"
            placeholder="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <button type="button" onClick={create} className="mt-2 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">
            Create
          </button>
        </div>
        <div>
          <h2 className="font-medium">Join with code</h2>
          <input
            className="mt-2 w-full rounded-lg border px-3 py-2 dark:border-white/20"
            placeholder="Team code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button type="button" onClick={join} className="mt-2 rounded-full border px-4 py-2 text-sm">
            Join
          </button>
        </div>
        {team && (
          <p className="text-sm">
            Team <strong>{team.name}</strong> — share code <code>{team.teamCode}</code>
          </p>
        )}
      </div>
    </div>
  );
}
