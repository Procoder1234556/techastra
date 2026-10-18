import { query } from '../db.js';
import { formatCommunity } from '../util/format.js';

export async function listCommunities() {
  const { rows } = await query('SELECT * FROM techastra_communities ORDER BY member_count DESC');
  return rows.map(formatCommunity);
}

export async function findCommunityById(id) {
  const { rows } = await query('SELECT * FROM techastra_communities WHERE id = $1', [id]);
  return formatCommunity(rows[0]);
}

export async function insertCommunities(items) {
  for (const c of items) {
    await query(
      `INSERT INTO techastra_communities (name, description, type, member_count)
       VALUES ($1, $2, $3, $4)`,
      [c.name, c.description || null, c.type || 'general', c.memberCount || 0],
    );
  }
}
