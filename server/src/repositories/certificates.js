import { query } from '../db.js';

export async function listMyCertificates(userId) {
  const { rows } = await query(
    `SELECT c.*, e.hackathon, e.doc->>'name' AS event_name
     FROM techastra_certificates c
     JOIN techastra_events e ON e.id = c.event_id
     WHERE c.user_id = $1 ORDER BY c.issued_at DESC`,
    [userId],
  );
  return rows.map((r) => ({
    _id: r.id,
    title: r.title,
    eventId: r.event_id,
    eventName: r.event_name,
    hackathon: r.hackathon,
    issuedAt: r.issued_at,
  }));
}

export async function issueCertificate({ userId, eventId, title }) {
  const { rows } = await query(
    `INSERT INTO techastra_certificates (user_id, event_id, title)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, event_id) DO UPDATE SET title = $3
     RETURNING *`,
    [userId, eventId, title],
  );
  return rows[0];
}
