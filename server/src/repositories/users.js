import { query } from '../db.js';
import { formatUser } from '../util/format.js';

export async function countUsers() {
  const { rows } = await query('SELECT COUNT(*)::int AS c FROM techastra_users');
  return rows[0].c;
}

export async function findUserById(id) {
  const { rows } = await query('SELECT * FROM techastra_users WHERE id = $1', [id]);
  return formatUser(rows[0]);
}

export async function findUserByEmail(email) {
  const { rows } = await query('SELECT * FROM techastra_users WHERE lower(email) = lower($1)', [email]);
  return formatUser(rows[0]);
}

export async function createUser(data) {
  const { rows } = await query(
    `INSERT INTO techastra_users (name, email, role, college, skills, xp)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)
     RETURNING *`,
    [
      data.name,
      data.email.toLowerCase(),
      data.role || 'student',
      data.college || null,
      JSON.stringify(data.skills || []),
      data.xp || 0,
    ],
  );
  return formatUser(rows[0]);
}

export async function updateUserRole(id, role) {
  const { rows } = await query(
    'UPDATE techastra_users SET role = $2, updated_at = now() WHERE id = $1 RETURNING *',
    [id, role],
  );
  return formatUser(rows[0]);
}
