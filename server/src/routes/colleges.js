import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { updateUserCollege } from '../repositories/users.js';

const router = Router();

const DEFAULT_COLLEGES = [
  'IIT Bombay',
  'IIT Delhi',
  'BITS Pilani',
  'VIT Vellore',
  'SRM Institute',
  'Manipal Institute',
  'Delhi Technological University',
  'Anna University',
  'PSG College of Technology',
  'Other',
];

router.get('/', async (_req, res) => {
  const { rows } = await query(
    `SELECT DISTINCT college AS name FROM techastra_users WHERE college IS NOT NULL AND college <> '' ORDER BY college`,
  );
  const fromDb = rows.map((r) => r.name);
  const merged = [...new Set([...DEFAULT_COLLEGES, ...fromDb])].sort();
  res.json(merged);
});

router.post('/add', requireAuth, requireRole('admin', 'superadmin'), async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'name required' });
  res.status(201).json({ name });
});

router.post('/select', requireAuth, async (req, res) => {
  const college = String(req.body.college || '').trim();
  if (!college) return res.status(400).json({ message: 'college required' });
  const user = await updateUserCollege(req.session.userId, college);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router;
