import { Router } from 'express';
import * as questsRepo from '../repositories/quests.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  res.json(await questsRepo.listQuests());
});

router.get('/leaderboard', async (_req, res) => {
  res.json(await questsRepo.leaderboard());
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ userId: req.session.userId, quests: await questsRepo.listQuests() });
});

router.post(
  '/',
  requireAuth,
  requireRole('organizer', 'admin', 'superadmin', 'manager'),
  async (req, res) => {
    const quest = await questsRepo.createQuest(req.body);
    res.status(201).json(quest);
  },
);

router.get(
  '/admin/submissions',
  requireAuth,
  requireRole('admin', 'superadmin'),
  async (_req, res) => {
    res.json(await questsRepo.listSubmissions());
  },
);

router.patch(
  '/admin/submissions/:id',
  requireAuth,
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    const row = await questsRepo.updateSubmissionStatus(req.params.id, req.body.status);
    if (!row) return res.status(404).json({ message: 'Submission not found' });
    res.json({ success: true, status: row.status });
  },
);

router.get('/:id', async (req, res) => {
  const quest = await questsRepo.getQuest(req.params.id);
  if (!quest) return res.status(404).json({ message: 'Quest not found' });
  res.json(quest);
});

router.post('/:id/submit', requireAuth, async (req, res) => {
  await questsRepo.submitQuest(req.params.id, req.session.userId, req.body.url);
  res.json({ success: true });
});

export default router;
