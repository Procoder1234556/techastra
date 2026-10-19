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

export async function updateUserCollege(id, college) {
  const { rows } = await query(
    'UPDATE techastra_users SET college = $2, updated_at = now() WHERE id = $1 RETURNING *',
    [id, college],
  );
  return formatUser(rows[0]);
}

export async function listUserEmails() {
  const { rows } = await query('SELECT email, name, role FROM techastra_users ORDER BY email');
  return rows;
}

export async function listUsers({
  page = 1,
  limit = 25,
  email,
  sortBy = 'email',
  sortOrder = 'asc',
} = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;
  const orderCol = sortBy === 'name' ? 'name' : sortBy === 'role' ? 'role' : 'email';
  const orderDir = sortOrder === 'desc' ? 'DESC' : 'ASC';
  const params = [];
  const filters = [];
  if (email) {
    params.push(`%${email}%`);
    filters.push(`email ILIKE $${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  params.push(safeLimit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;
  const countSql = `SELECT COUNT(*)::int AS c FROM techastra_users ${where}`;
  const listSql = `SELECT * FROM techastra_users ${where} ORDER BY ${orderCol} ${orderDir} LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
  const [{ rows: countRows }, { rows }] = await Promise.all([
    query(countSql, email ? [params[0]] : []),
    query(listSql, params),
  ]);
  return {
    users: rows.map(formatUser),
    total: countRows[0].c,
    page: safePage,
    limit: safeLimit,
  };
}
