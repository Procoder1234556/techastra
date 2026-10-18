import { Router } from 'express';
import * as communitiesRepo from '../repositories/communities.js';

const router = Router();

router.get('/', async (_req, res) => {
  res.json(await communitiesRepo.listCommunities());
});

router.get('/:id', async (req, res) => {
  const community = await communitiesRepo.findCommunityById(req.params.id);
  if (!community) return res.status(404).json({ message: 'Not found' });
  res.json(community);
});

export default router;
