import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as notificationsDb from '../repositories/notificationsDb.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  res.json(await notificationsDb.listForUser(req.session.userId));
});

router.get('/unread-count', requireAuth, async (req, res) => {
  const count = await notificationsDb.unreadCount(req.session.userId);
  res.json({ count });
});

router.post('/read-all', requireAuth, async (req, res) => {
  await notificationsDb.markAllRead(req.session.userId);
  res.json({ success: true });
});

router.put('/read-all', requireAuth, async (req, res) => {
  await notificationsDb.markAllRead(req.session.userId);
  res.json({ success: true });
});

router.put('/:id/read', requireAuth, async (req, res) => {
  const row = await notificationsDb.markRead(req.session.userId, req.params.id);
  if (!row) return res.status(404).json({ message: 'Notification not found' });
  res.json({ success: true });
});

router.get(
  '/event/:eventId',
  requireAuth,
  requireRole('organizer', 'admin', 'superadmin', 'manager'),
  async (req, res) => {
    res.json(await notificationsDb.listForEvent(req.params.eventId));
  },
);

export default router;
