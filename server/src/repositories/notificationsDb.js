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

export async function markRead(userId, notificationId) {
  const { rows } = await query(
    'UPDATE techastra_notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING id',
    [notificationId, userId],
  );
  return rows[0];
}

export async function listForEvent(eventId) {
  const { rows } = await query(
    `SELECT n.* FROM techastra_notifications n
     JOIN techastra_registrations r ON r.user_id = n.user_id AND r.event_id = $1
     ORDER BY n.created_at DESC LIMIT 100`,
    [eventId],
  );
  return rows.map((r) => ({
    _id: r.id,
    title: r.title,
    body: r.body,
    read: r.read,
    createdAt: r.created_at,
  }));
}

export async function createNotification({ userId, title, body }) {
  await query(
    'INSERT INTO techastra_notifications (user_id, title, body) VALUES ($1, $2, $3)',
    [userId, title, body],
  );
}
