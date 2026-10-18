import { Router } from 'express';
import * as teamsRepo from '../repositories/teams.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/create', requireAuth, async (req, res) => {
  const { eventId, name } = req.body;
  const team = await teamsRepo.createTeam({
    eventId,
    name: name || 'My Team',
    leaderId: req.session.userId,
  });
  res.status(201).json(team);
});

router.post('/join', requireAuth, async (req, res) => {
  const team = await teamsRepo.joinTeam({
    teamCode: req.body.teamCode,
    userId: req.session.userId,
  });
  if (!team) return res.status(404).json({ message: 'Team not found' });
  res.json(team);
});

router.post('/leave', requireAuth, async (req, res) => {
  await teamsRepo.leaveTeam({ teamCode: req.body.teamCode, userId: req.session.userId });
  res.json({ success: true });
});

router.get('/members/:teamCode', async (req, res) => {
  const team = await teamsRepo.getTeamByCode(req.params.teamCode);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  res.json(team);
});

router.get('/user/:userId', async (req, res) => {
  res.json(await teamsRepo.listTeamsForUser(req.params.userId));
});

router.post('/submit', requireAuth, async (req, res) => {
  const team = await teamsRepo.submitProject({
    teamCode: req.body.teamCode,
    url: req.body.url,
  });
  if (!team) return res.status(404).json({ message: 'Team not found' });
  res.json({ success: true, team });
});

export default router;
