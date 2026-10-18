import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

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

export default router;
