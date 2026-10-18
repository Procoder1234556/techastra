import { findUserById } from '../repositories/users.js';

export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

export async function attachUser(req, _res, next) {
  if (!req.session?.userId) {
    req.user = null;
    return next();
  }
  req.user = await findUserById(req.session.userId);
  next();
}
