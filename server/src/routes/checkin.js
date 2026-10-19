import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const checkedIn = new Set();

router.post('/scan/:eventSlug', requireAuth, requireRole('organizer', 'admin', 'superadmin'), (req, res) => {
  const key = `${req.params.eventSlug}:${req.body.userId || req.session.userId}`;
  checkedIn.add(key);
  res.json({ success: true, checkedIn: true });
});

router.get('/stats', requireAuth, requireRole('organizer', 'admin', 'superadmin'), (_req, res) => {
  res.json({ total: checkedIn.size });
});

router.get('/all', requireAuth, requireRole('organizer', 'admin', 'superadmin', 'manager'), (_req, res) => {
  res.json({ checkedIn: [...checkedIn] });
});

router.get('/my/:eventSlug', requireAuth, async (req, res) => {
  const key = `${req.params.eventSlug}:${req.session.userId}`;
  res.json({ checkedIn: checkedIn.has(key) });
});

router.patch(
  '/:eventSlug/manual',
  requireAuth,
  requireRole('organizer', 'admin', 'superadmin'),
  (req, res) => {
    const userId = req.body.userId?.toString();
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const key = `${req.params.eventSlug}:${userId}`;
    if (req.body.checkedIn === false) checkedIn.delete(key);
    else checkedIn.add(key);
    res.json({ success: true, checkedIn: checkedIn.has(key) });
  },
);

export default router;
