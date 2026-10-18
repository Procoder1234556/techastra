import { Router } from 'express';
import { findUserById, updateUserRole } from '../repositories/users.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const user = await findUserById(req.session.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.patch('/:id/role', requireRole('superadmin', 'admin'), async (req, res) => {
  const user = await updateUserRole(req.params.id, req.body.role);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router;
