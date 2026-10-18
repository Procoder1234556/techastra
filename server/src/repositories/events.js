import { query } from '../db.js';
import { formatEvent } from '../util/format.js';

function buildEventInsert(body, createdBy) {
  const hackathon = body.hackathon || body.eventName;
  const eventName = body.eventName || hackathon;
  const doc = { ...body };
  delete doc.hackathon;
  delete doc.eventName;
  delete doc.createdBy;
  delete doc.organizers;
  return {
    hackathon,
    eventName,
    doc,
    createdBy,
    organizers: body.organizers || [createdBy],
  };
}

export async function listEvents({ search, live, userId }) {
  const clauses = ['approval_status = $1'];
  const params = ['approved'];
  if (live === true) {
    params.push(true);
    clauses.push(`live = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    clauses.push(`(doc->>'name' ILIKE $${params.length} OR doc->>'organizationName' ILIKE $${params.length})`);
  }
  const { rows } = await query(
    `SELECT * FROM techastra_events WHERE ${clauses.join(' AND ')} ORDER BY doc->>'startDate' DESC NULLS LAST, created_at DESC`,
    params,
  );

  const techastra_events = [];
  for (const row of rows) {
    let hasRegistered = false;
    if (userId) {
      const reg = await query(
        'SELECT 1 FROM techastra_registrations WHERE user_id = $1 AND event_id = $2',
        [userId, row.id],
      );
      hasRegistered = reg.rowCount > 0;
    }
    techastra_events.push(formatEvent(row, { hasRegistered }));
  }
  return techastra_events;
}

export async function searchEvents(q) {
  const { rows } = await query(
    `SELECT * FROM techastra_events
     WHERE approval_status = 'approved' AND doc->>'name' ILIKE $1
     ORDER BY created_at DESC LIMIT 20`,
    [`%${q}%`],
  );
  return rows.map((r) => formatEvent(r));
}

export async function findEventBySlug(slug, userId) {
  const { rows } = await query(
    'SELECT * FROM techastra_events WHERE hackathon = $1 OR event_name = $1 LIMIT 1',
    [slug],
  );
  if (!rows[0]) return null;
  let hasRegistered = false;
  if (userId) {
    const reg = await query(
      'SELECT 1 FROM techastra_registrations WHERE user_id = $1 AND event_id = $2',
      [userId, rows[0].id],
    );
    hasRegistered = reg.rowCount > 0;
  }
  return formatEvent(rows[0], { hasRegistered });
}

export async function findEventById(id) {
  const { rows } = await query('SELECT * FROM techastra_events WHERE id = $1', [id]);
  return rows[0] ? formatEvent(rows[0]) : null;
}

export async function createEvent(body, createdBy) {
  const { hackathon, eventName, doc, organizers } = buildEventInsert(body, createdBy);
  const { rows } = await query(
    `INSERT INTO techastra_events (hackathon, event_name, created_by, organizers, doc)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING *`,
    [hackathon, eventName, createdBy, organizers, JSON.stringify(doc)],
  );
  return formatEvent(rows[0]);
}

export async function setEventVerified(slug, verified) {
  const { rows } = await query(
    `UPDATE techastra_events SET doc = doc || $2::jsonb, updated_at = now()
     WHERE hackathon = $1 RETURNING *`,
    [slug, JSON.stringify({ verified })],
  );
  return rows[0] ? formatEvent(rows[0]) : null;
}

export async function incrementRegistrations(eventId) {
  await query(
    'UPDATE techastra_events SET number_of_registrations = number_of_registrations + 1, updated_at = now() WHERE id = $1',
    [eventId],
  );
}

export async function countEventsForOrganizer(userId) {
  const { rows } = await query(
    'SELECT COUNT(*)::int AS c FROM techastra_events WHERE $1 = ANY(organizers)',
    [userId],
  );
  return rows[0].c;
}

export async function listOrganizerEvents(userId) {
  const { rows } = await query('SELECT * FROM techastra_events WHERE $1 = ANY(organizers) ORDER BY created_at DESC', [
    userId,
  ]);
  return rows.map((r) => formatEvent(r));
}

export async function updateEvent(eventId, body, userId) {
  const existing = await query('SELECT * FROM techastra_events WHERE id = $1', [eventId]);
  if (!existing.rows[0]) return null;
  const row = existing.rows[0];
  if (!row.organizers?.includes(userId) && row.created_by !== userId) {
    return { forbidden: true };
  }
  const docPatch = { ...body };
  delete docPatch.live;
  delete docPatch.approvalStatus;
  const live = body.live !== undefined ? body.live : row.live;
  const { rows } = await query(
    `UPDATE techastra_events
     SET doc = doc || $2::jsonb, live = $3, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [eventId, JSON.stringify(docPatch), live],
  );
  return formatEvent(rows[0]);
}

export async function deleteEvent(eventId, userId) {
  const existing = await query('SELECT * FROM techastra_events WHERE id = $1', [eventId]);
  if (!existing.rows[0]) return null;
  const row = existing.rows[0];
  if (!row.organizers?.includes(userId) && row.created_by !== userId) {
    return { forbidden: true };
  }
  await query('DELETE FROM techastra_events WHERE id = $1', [eventId]);
  return { deleted: true };
}

export async function duplicateEvent(eventId, userId) {
  const event = await findEventById(eventId);
  if (!event) return null;
  if (!event.organizers?.includes(userId) && event.createdBy !== userId) {
    return { forbidden: true };
  }
  const copyName = `${event.name || event.hackathon} (copy)`;
  const hackathon = `${event.hackathon}-copy-${Date.now().toString(36)}`;
  const body = {
    ...event,
    name: copyName,
    hackathon,
    eventName: hackathon,
  };
  delete body._id;
  delete body.createdAt;
  delete body.updatedAt;
  return createEvent(body, userId);
}
