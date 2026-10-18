import { query } from '../db.js';
import { formatEvent } from '../util/format.js';

export async function registrationExists(userId, eventId) {
  const { rowCount } = await query(
    'SELECT 1 FROM techastra_registrations WHERE user_id = $1 AND event_id = $2',
    [userId, eventId],
  );
  return rowCount > 0;
}

export async function createRegistration({ userId, eventId, answers }) {
  await query(
    `INSERT INTO techastra_registrations (user_id, event_id, answers, status)
     VALUES ($1, $2, $3::jsonb, 'approved')`,
    [userId, eventId, answers ? JSON.stringify(answers) : null],
  );
}

export async function listAppliedEvents(userId) {
  const { rows } = await query(
    `SELECT e.* FROM techastra_registrations r
     JOIN techastra_events e ON e.id = r.event_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId],
  );
  return rows.map((r) => formatEvent(r));
}

export async function countRegistrations() {
  const { rows } = await query('SELECT COUNT(*)::int AS c FROM techastra_registrations');
  return rows[0].c;
}

export async function listParticipants(eventId) {
  const sql = eventId
    ? `SELECT r.*, u.name, u.email, u.college, e.hackathon, e.doc->>'name' AS event_title
       FROM techastra_registrations r
       JOIN techastra_users u ON u.id = r.user_id
       JOIN techastra_events e ON e.id = r.event_id
       WHERE r.event_id = $1`
    : `SELECT r.*, u.name, u.email, u.college, e.hackathon, e.doc->>'name' AS event_title
       FROM techastra_registrations r
       JOIN techastra_users u ON u.id = r.user_id
       JOIN techastra_events e ON e.id = r.event_id`;
  const { rows } = await query(sql, eventId ? [eventId] : []);
  return rows;
}
