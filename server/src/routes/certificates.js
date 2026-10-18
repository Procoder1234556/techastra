import { Router } from 'express';
import * as certsRepo from '../repositories/certificates.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/my', requireAuth, async (req, res) => {
  res.json(await certsRepo.listMyCertificates(req.session.userId));
});

router.post('/send', requireAuth, requireRole('organizer', 'admin', 'superadmin'), async (req, res) => {
  const { userId, eventId, title } = req.body;
  await certsRepo.issueCertificate({
    userId,
    eventId,
    title: title || 'Certificate of Participation',
  });
  res.json({ success: true });
});

export default router;
