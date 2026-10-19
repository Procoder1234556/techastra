import { Router } from 'express';
import { findUserById, updateUserRole, listUserEmails, listUsers } from '../repositories/users.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin', 'superadmin', 'manager'), async (req, res) => {
  res.json(
    await listUsers({
      page: req.query.page,
      limit: req.query.limit,
      email: req.query.email?.toString(),
      sortBy: req.query.sortBy?.toString(),
      sortOrder: req.query.sortOrder?.toString(),
    }),
  );
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await findUserById(req.session.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.get('/emails', requireAuth, requireRole('admin', 'superadmin', 'organizer', 'manager'), async (_req, res) => {
  res.json(await listUserEmails());
});

router.patch('/:id/role', requireRole('superadmin', 'admin'), async (req, res) => {
  const user = await updateUserRole(req.params.id, req.body.role);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router;
