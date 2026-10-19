import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { query } from '../db.js';
import { randomUUID } from 'crypto';

const router = Router();
const invites = [];

router.post('/send', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ message: 'email required' });
  const row = {
    id: randomUUID(),
    email,
    role: req.body.role || 'organizer',
    sentAt: new Date().toISOString(),
    sentBy: req.session.userId,
  };
  invites.push(row);
  res.json({ success: true, invite: row, message: `Invite logged for ${email} (wire MailerHub for email delivery)` });
});

router.get('/admin/all', requireAuth, requireRole('admin', 'superadmin'), async (_req, res) => {
  const { rows } = await query(
    `SELECT id, email, role, created_at FROM techastra_users WHERE role IN ('organizer','manager','admin') ORDER BY created_at DESC LIMIT 100`,
  );
  res.json({ invites: [...invites].reverse(), users: rows });
});

router.get('/admin/export', requireAuth, requireRole('admin', 'superadmin'), async (_req, res) => {
  const lines = ['email,role,sentAt', ...invites.map((i) => `${i.email},${i.role},${i.sentAt}`)];
  res.type('text/csv').send(lines.join('\n'));
});

export default router;
