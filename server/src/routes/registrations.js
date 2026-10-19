import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as teamsRepo from '../repositories/teams.js';

const router = Router();

router.get('/', requireAuth, requireRole('organizer', 'admin', 'superadmin', 'manager'), async (req, res) => {
  const { rows } = await query(
    `SELECT r.*, u.name, u.email, e.hackathon, e.doc->>'name' AS event_name
     FROM techastra_registrations r
     JOIN techastra_users u ON u.id = r.user_id
     JOIN techastra_events e ON e.id = r.event_id
     ORDER BY r.created_at DESC LIMIT 200`,
  );
  res.json(rows);
});

router.patch('/:id/status', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const { rows } = await query(
    'UPDATE techastra_registrations SET status = $2 WHERE id = $1 RETURNING *',
    [req.params.id, req.body.status],
  );
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
});

router.patch('/bulk/status', requireAuth, requireRole('organizer', 'admin', 'superadmin', 'manager'), async (req, res) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || !status) return res.status(400).json({ message: 'ids and status required' });
  const { rows } = await query(
    `UPDATE techastra_registrations SET status = $2 WHERE id = ANY($1::uuid[]) RETURNING id`,
    [ids, status],
  );
  res.json({ updated: rows.length });
});

router.patch('/team/:teamId/status', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const team = await teamsRepo.findTeamById(req.params.teamId);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  const status = req.body.status || 'approved';
  const memberIds = [...new Set([team.leaderId, ...(team.memberIds || [])])];
  const { rows } = await query(
    `UPDATE techastra_registrations SET status = $2
     WHERE event_id = $3 AND user_id = ANY($1::uuid[])
     RETURNING id`,
    [memberIds, status, team.eventId],
  );
  res.json({ updated: rows.length, status });
});

router.get('/downloadRegistrations', requireAuth, requireRole('organizer', 'admin', 'superadmin', 'manager'), async (req, res) => {
  const eventId = req.query.eventId?.toString();
  const eventName = req.query.eventName?.toString();
  const filterStatus = req.query.filterStatus?.toString();
  const params = [];
  const clauses = [];
  if (eventId) {
    params.push(eventId);
    clauses.push(`r.event_id = $${params.length}`);
  } else if (eventName) {
    params.push(eventName);
    clauses.push(`(e.hackathon = $${params.length} OR e.event_name = $${params.length})`);
  }
  if (filterStatus && filterStatus !== 'all') {
    params.push(filterStatus);
    clauses.push(`r.status = $${params.length}`);
  }
  const clause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT u.name, u.email, u.college, r.status, e.doc->>'name' AS event_name
     FROM techastra_registrations r
     JOIN techastra_users u ON u.id = r.user_id
     JOIN techastra_events e ON e.id = r.event_id
     ${clause}
     ORDER BY r.created_at DESC`,
    params,
  );
  const header = 'name,email,college,status,event';
  const lines = rows.map((r) =>
    [r.name, r.email, r.college, r.status, r.event_name].map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','),
  );
  res.type('text/csv').send([header, ...lines].join('\n'));
});

export default router;
