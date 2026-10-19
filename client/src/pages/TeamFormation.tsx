import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { API } from '../lib/apiPaths';
import { useAuth } from '../context/AuthContext';

type Team = {
  _id: string;
  teamCode: string;
  name: string;
  memberIds?: string[];
  submissionUrl?: string;
  eventId?: string;
};

export function TeamFormation() {
  const { eventId, eventName, teamCode: routeTeamCode } = useParams();
  const { user, loginAs } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState(routeTeamCode || '');
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Team[]>([]);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [resolvedEventId, setResolvedEventId] = useState(eventId || '');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (eventName && !eventId) {
      api.get<{ _id: string }>(`/api/v1/events/name/${encodeURIComponent(eventName)}`).then((res) => {
        setResolvedEventId(res.data._id);
      });
    }
  }, [eventName, eventId]);

  useEffect(() => {
    if (!user?._id || !resolvedEventId) return;
    api.get<Team[]>(`${API.teamsUser}/${user._id}`).then((res) => {
      const forEvent = res.data.find((t) => t.eventId === resolvedEventId);
      if (forEvent) {
        setTeam(forEvent);
        setJoinCode(forEvent.teamCode);
        if (forEvent.submissionUrl) setSubmissionUrl(forEvent.submissionUrl);
      }
    });
    api.get<Team | null>(`${API.projectsMine}/${resolvedEventId}`).then((res) => {
      if (res.data) {
        setTeam(res.data);
        setJoinCode(res.data.teamCode);
        if (res.data.submissionUrl) setSubmissionUrl(res.data.submissionUrl);
      }
    });
  }, [user?._id, resolvedEventId]);

  useEffect(() => {
    if (!team?.teamCode) return;
    api.get<Team>(`/api/v1/teams/members/${team.teamCode}`).then((res) => setMembers([res.data]));
  }, [team?.teamCode]);

  const create = async () => {
    if (!user) return loginAs('student@techastra.local');
    const eid = resolvedEventId || eventId;
    if (!eid) {
      setMsg('Event not loaded yet.');
      return;
    }
    const res = await api.post<Team>('/api/v1/teams/create', { eventId: eid, name: teamName });
    setTeam(res.data);
    setJoinCode(res.data.teamCode);
  };

  const join = async () => {
    if (!user) return loginAs('student@techastra.local');
    const res = await api.post<Team>('/api/v1/teams/join', { teamCode: joinCode });
    setTeam(res.data);
  };

  const leave = async () => {
    if (!team?.teamCode) return;
    await api.post('/api/v1/teams/leave', { teamCode: team.teamCode });
    setTeam(null);
    setMembers([]);
    setMsg('Left team');
  };

  const submitProject = async () => {
    if (!team?.teamCode || !submissionUrl.trim() || !resolvedEventId) return;
    await api.post(`${API.projectsSubmit}/${resolvedEventId}`, {
      teamCode: team.teamCode,
      submissionUrl: submissionUrl.trim(),
    });
    setMsg('Submission saved');
  };

  const label = eventName || eventId || resolvedEventId;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-2xl font-bold">Team formation</h1>
      <p className="text-sm text-neutral-500 mt-1">Event: {label}</p>
      <div className="mt-8 space-y-6">
        {!team && (
          <>
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
          </>
        )}
        {team && (
          <div className="rounded-xl border p-4 dark:border-white/10 space-y-3">
            <p className="text-sm">
              Team <strong>{team.name}</strong> — code <code>{team.teamCode}</code>
            </p>
            {members.length > 0 && (
              <p className="text-xs text-neutral-500">{members[0].memberIds?.length ?? 1} member(s)</p>
            )}
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20"
              placeholder="Project submission URL"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={submitProject} className="rounded-full bg-neutral-900 px-3 py-1 text-xs text-white">
                Submit project
              </button>
              <button type="button" onClick={leave} className="rounded-full border px-3 py-1 text-xs dark:border-white/20">
                Leave team
              </button>
            </div>
          </div>
        )}
        {msg && <p className="text-sm text-green-600">{msg}</p>}
      </div>
    </div>
  );
}
