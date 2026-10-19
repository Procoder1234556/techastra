import { Router } from 'express';
import * as questsRepo from '../repositories/quests.js';
import { findUserById } from '../repositories/users.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const quests = await questsRepo.listQuests();
  res.json({ success: true, quests });
});

router.get('/leaderboard', async (req, res) => {
  const limit = Number(req.query.limit) || 25;
  const leaderboard = await questsRepo.leaderboard({ limit });
  res.json({ success: true, leaderboard });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await findUserById(req.session.userId);
  const quests = await questsRepo.listQuests();
  res.json({
    success: true,
    userId: req.session.userId,
    profile: {
      userId: req.session.userId,
      githubConnected: true,
      xp: user?.xp ?? 0,
    },
    quests,
  });
});

router.get('/mine', requireAuth, async (req, res) => {
  const quests = await questsRepo.listUserSubmissions(req.session.userId);
  res.json({ success: true, quests });
});

router.get(
  '/admin/pending',
  requireAuth,
  requireRole('admin', 'superadmin'),
  async (_req, res) => {
    const quests = await questsRepo.listPendingSubmissions();
    res.json({ success: true, quests });
  },
);

router.get('/admin', requireAuth, requireRole('admin', 'superadmin'), async (_req, res) => {
  const [quests, pending] = await Promise.all([
    questsRepo.listQuests(),
    questsRepo.listPendingSubmissions(),
  ]);
  res.json({ quests, pendingCount: pending.length });
});

router.post('/enable', requireAuth, async (req, res) => {
  const user = await findUserById(req.session.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    success: true,
    profile: {
      userId: user._id,
      githubConnected: true,
      xp: user.xp ?? 0,
    },
    message: 'DevQuests enabled (demo — connect GitHub in production).',
  });
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
    const submissions = await questsRepo.listSubmissions();
    res.json({ success: true, submissions });
  },
);

router.post('/submissions/:id/upvote', requireAuth, async (_req, res) => {
  res.json({ success: true });
});

router.patch(
  '/admin/submissions/:id',
  requireAuth,
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    const row = await questsRepo.updateSubmissionStatus(req.params.id, req.body.status);
    if (!row) return res.status(404).json({ success: false, message: 'Submission not found' });
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
