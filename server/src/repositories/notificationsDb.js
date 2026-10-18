import { query } from '../db.js';

export async function listForUser(userId) {
  const { rows } = await query(
    'SELECT * FROM techastra_notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [userId],
  );
  return rows.map((r) => ({
    _id: r.id,
    title: r.title,
    body: r.body,
    read: r.read,
    createdAt: r.created_at,
  }));
}

export async function unreadCount(userId) {
  const { rows } = await query(
    'SELECT COUNT(*)::int AS c FROM techastra_notifications WHERE user_id = $1 AND read = false',
    [userId],
  );
  return rows[0].c;
}

export async function markAllRead(userId) {
  await query('UPDATE techastra_notifications SET read = true WHERE user_id = $1', [userId]);
}

export async function createNotification({ userId, title, body }) {
  await query(
    'INSERT INTO techastra_notifications (user_id, title, body) VALUES ($1, $2, $3)',
    [userId, title, body],
  );
}
