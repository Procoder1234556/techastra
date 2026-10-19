import { Router } from 'express';
import * as communitiesRepo from '../repositories/communities.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/search', async (req, res) => {
  const q = req.query.q?.toString() || '';
  const all = await communitiesRepo.listCommunities();
  if (!q.trim()) return res.json(all);
  const lower = q.toLowerCase();
  res.json(all.filter((c) => c.name?.toLowerCase().includes(lower) || c.description?.toLowerCase().includes(lower)));
});

router.get('/', async (_req, res) => {
  res.json(await communitiesRepo.listCommunities());
});

router.get('/type/:type', async (req, res) => {
  res.json(await communitiesRepo.listCommunitiesByType(req.params.type));
});

router.post('/', requireAuth, requireRole('admin', 'superadmin', 'organizer'), async (req, res) => {
  const community = await communitiesRepo.createCommunity(req.body);
  res.status(201).json(community);
});

router.post('/duplicate', requireAuth, requireRole('admin', 'superadmin', 'organizer'), async (req, res) => {
  const id = req.body.communityId || req.body.id;
  if (!id) return res.status(400).json({ message: 'communityId required' });
  const community = await communitiesRepo.duplicateCommunity(id, { name: req.body.name });
  if (!community) return res.status(404).json({ message: 'Community not found' });
  res.status(201).json(community);
});

router.patch('/:id', requireAuth, requireRole('admin', 'superadmin', 'organizer'), async (req, res) => {
  const community = await communitiesRepo.updateCommunity(req.params.id, req.body);
  if (!community) return res.status(404).json({ message: 'Not found' });
  res.json(community);
});

router.get('/:id', async (req, res) => {
  const community = await communitiesRepo.findCommunityById(req.params.id);
  if (!community) return res.status(404).json({ message: 'Not found' });
  res.json(community);
});

export default router;
