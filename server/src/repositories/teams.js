import { randomBytes } from 'crypto';
import { query } from '../db.js';

function makeCode() {
  return randomBytes(3).toString('hex').toUpperCase();
}

export async function createTeam({ eventId, name, leaderId }) {
  const code = makeCode();
  const { rows } = await query(
    `INSERT INTO techastra_teams (event_id, team_code, name, leader_id, member_ids)
     VALUES ($1, $2, $3, $4, ARRAY[$4]::uuid[])
     RETURNING *`,
    [eventId, code, name, leaderId],
  );
  return formatTeam(rows[0]);
}

export async function joinTeam({ teamCode, userId }) {
  const { rows } = await query('SELECT * FROM techastra_teams WHERE team_code = $1', [teamCode]);
  if (!rows[0]) return null;
  const members = rows[0].member_ids || [];
  if (members.includes(userId)) return formatTeam(rows[0]);
  const { rows: updated } = await query(
    `UPDATE techastra_teams SET member_ids = array_append(member_ids, $2::uuid)
     WHERE team_code = $1 RETURNING *`,
    [teamCode, userId],
  );
  return formatTeam(updated[0]);
}

export async function leaveTeam({ teamCode, userId }) {
  await query(
    `UPDATE techastra_teams SET member_ids = array_remove(member_ids, $2::uuid)
     WHERE team_code = $1`,
    [teamCode, userId],
  );
}

export async function findTeamById(teamId) {
  const { rows } = await query(
    `SELECT t.*, e.name AS event_name, e.hackathon
     FROM techastra_teams t
     LEFT JOIN techastra_events e ON e.id = t.event_id
     WHERE t.id = $1`,
    [teamId],
  );
  if (!rows[0]) return null;
  const base = formatTeam(rows[0]);
  return {
    ...base,
    eventName: rows[0].event_name || rows[0].hackathon || '',
    hackathon: rows[0].hackathon || '',
    isSubmitted: Boolean(rows[0].submission_url),
  };
}

export async function getTeamByCode(teamCode) {
  const { rows } = await query(
    `SELECT t.*, e.name AS event_name, e.hackathon
     FROM techastra_teams t
     LEFT JOIN techastra_events e ON e.id = t.event_id
     WHERE UPPER(t.team_code) = UPPER($1)`,
    [teamCode],
  );
  if (!rows[0]) return null;
  const base = formatTeam(rows[0]);
  return {
    ...base,
    eventName: rows[0].event_name || rows[0].hackathon || '',
    hackathon: rows[0].hackathon || '',
    isSubmitted: Boolean(rows[0].submission_url),
  };
}

export async function listTeamsForUser(userId) {
  const { rows } = await query(
    'SELECT * FROM techastra_teams WHERE $1 = ANY(member_ids) OR leader_id = $1',
    [userId],
  );
  return rows.map(formatTeam);
}

export async function submitProject({ teamCode, url }) {
  const { rows } = await query(
    `UPDATE techastra_teams SET submission_url = $2 WHERE team_code = $1 RETURNING *`,
    [teamCode, url],
  );
  return formatTeam(rows[0]);
}

export async function listTeamsByEvent(eventId) {
  const { rows } = await query('SELECT * FROM techastra_teams WHERE event_id = $1 ORDER BY created_at DESC', [
    eventId,
  ]);
  return rows.map(formatTeam);
}

export async function listTeamsForOrganizer(organizerId) {
  const { rows } = await query(
    `SELECT t.*, e.event_name, e.hackathon
     FROM techastra_teams t
     JOIN techastra_events e ON e.id = t.event_id
     WHERE $1 = ANY(e.organizers) OR e.created_by = $1
     ORDER BY t.created_at DESC`,
    [organizerId],
  );
  return rows.map((row) => ({
    ...formatTeam(row),
    eventName: row.event_name,
    hackathon: row.hackathon,
    projectScore: row.project_score,
  }));
}

export async function setProjectScore(teamId, score) {
  const { rows } = await query(
    `UPDATE techastra_teams SET project_score = $2 WHERE id = $1 RETURNING *`,
    [teamId, score],
  );
  return formatTeam(rows[0]);
}

function formatTeam(row) {
  if (!row) return null;
  return {
    _id: row.id,
    eventId: row.event_id,
    teamCode: row.team_code,
    name: row.name,
    leaderId: row.leader_id,
    memberIds: row.member_ids,
    submissionUrl: row.submission_url,
    projectScore: row.project_score ?? null,
  };
}
