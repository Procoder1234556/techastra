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

export default router;
