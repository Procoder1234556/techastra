import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
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

export default router;
