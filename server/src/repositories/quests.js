import { query } from '../db.js';

export async function listQuests() {
  const { rows } = await query(
    'SELECT * FROM techastra_quests WHERE status = $1 ORDER BY featured DESC, created_at DESC',
    ['active'],
  );
  return rows.map(formatQuest);
}

export async function getQuest(id) {
  const { rows } = await query('SELECT * FROM techastra_quests WHERE id = $1', [id]);
  return formatQuest(rows[0]);
}

export async function submitQuest(questId, userId, submissionUrl) {
  await query(
    `INSERT INTO techastra_quest_submissions (quest_id, user_id, submission_url, status)
     VALUES ($1, $2, $3, 'pending')
     ON CONFLICT (quest_id, user_id) DO UPDATE SET submission_url = $3, status = 'pending'`,
    [questId, userId, submissionUrl],
  );
  await query('UPDATE techastra_users SET xp = xp + 10, updated_at = now() WHERE id = $1', [userId]);
}

export async function leaderboard({ limit = 25 } = {}) {
  const { rows } = await query(
    'SELECT id, name, email, xp, college FROM techastra_users ORDER BY xp DESC LIMIT $1',
    [Math.min(limit, 100)],
  );
  return rows.map((r) => ({
    _id: r.id,
    name: r.name,
    email: r.email,
    xp: r.xp,
    college: r.college,
  }));
}

export async function createQuest({ title, description, rewardXp, featured }) {
  const { rows } = await query(
    `INSERT INTO techastra_quests (title, description, reward_xp, featured, status)
     VALUES ($1, $2, $3, $4, 'active')
     RETURNING *`,
    [title, description || '', rewardXp || 50, featured || false],
  );
  return formatQuest(rows[0]);
}

export async function listSubmissions() {
  const { rows } = await query(
    `SELECT s.*, q.title AS quest_title, u.name AS user_name, u.email AS user_email
     FROM techastra_quest_submissions s
     JOIN techastra_quests q ON q.id = s.quest_id
     JOIN techastra_users u ON u.id = s.user_id
     ORDER BY s.created_at DESC`,
  );
  return rows.map((r) => ({
    _id: r.id,
    questId: r.quest_id,
    questTitle: r.quest_title,
    userId: r.user_id,
    userName: r.user_name,
    userEmail: r.user_email,
    submissionUrl: r.submission_url,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function listUserSubmissions(userId) {
  const { rows } = await query(
    `SELECT s.*, q.title AS quest_title
     FROM techastra_quest_submissions s
     JOIN techastra_quests q ON q.id = s.quest_id
     WHERE s.user_id = $1
     ORDER BY s.created_at DESC`,
    [userId],
  );
  return rows.map((r) => ({
    _id: r.id,
    questId: r.quest_id,
    questTitle: r.quest_title,
    status: r.status,
    submissionUrl: r.submission_url,
    createdAt: r.created_at,
  }));
}

export async function listPendingSubmissions() {
  const { rows } = await query(
    `SELECT s.*, q.title AS quest_title, u.name AS user_name
     FROM techastra_quest_submissions s
     JOIN techastra_quests q ON q.id = s.quest_id
     JOIN techastra_users u ON u.id = s.user_id
     WHERE s.status = 'pending'
     ORDER BY s.created_at DESC`,
  );
  return rows;
}

export async function updateSubmissionStatus(submissionId, status) {
  const { rows } = await query(
    `UPDATE techastra_quest_submissions SET status = $2 WHERE id = $1 RETURNING *`,
    [submissionId, status],
  );
  return rows[0];
}

export async function insertQuests(quests) {
  for (const q of quests) {
    await query(
      `INSERT INTO techastra_quests (title, description, reward_xp, featured, doc)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [q.title, q.description, q.rewardXp || 50, q.featured || false, JSON.stringify(q.doc || {})],
    );
  }
}

function formatQuest(row) {
  if (!row) return null;
  return {
    _id: row.id,
    title: row.title,
    description: row.description,
    rewardXp: row.reward_xp,
    status: row.status,
    featured: row.featured,
    ...row.doc,
  };
}
