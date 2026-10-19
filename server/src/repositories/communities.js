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

export async function listCommunitiesByType(type) {
  const { rows } = await query(
    'SELECT * FROM techastra_communities WHERE type = $1 ORDER BY member_count DESC',
    [type],
  );
  return rows.map(formatCommunity);
}

export async function createCommunity(body) {
  const { rows } = await query(
    `INSERT INTO techastra_communities (name, description, type, member_count, cover_image)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      body.name,
      body.description || null,
      body.type || 'general',
      body.memberCount || 0,
      body.coverImage || null,
    ],
  );
  return formatCommunity(rows[0]);
}

export async function updateCommunity(id, body) {
  const { rows } = await query(
    `UPDATE techastra_communities
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         type = COALESCE($4, type),
         member_count = COALESCE($5, member_count),
         cover_image = COALESCE($6, cover_image),
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      body.name ?? null,
      body.description ?? null,
      body.type ?? null,
      body.memberCount ?? null,
      body.coverImage ?? null,
    ],
  );
  return formatCommunity(rows[0]);
}

export async function duplicateCommunity(id, overrides = {}) {
  const source = await findCommunityById(id);
  if (!source) return null;
  return createCommunity({
    name: overrides.name || `${source.name} (Copy)`,
    description: source.description,
    type: source.type,
    memberCount: 0,
    coverImage: source.coverImage,
  });
}
