// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dhaka-tesla-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    name: string;
    phone: string;
    role: Role;
  };
}

/**
 * Verifies JWT token from 'Authorization: Bearer <token>' header
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies?.['tesla_token'];

  const token = headerToken || cookieToken;

  if (!token) {
    res.status(401).json({
      status: 'fail',
      message: 'প্রবেশাধিকার সংরক্ষিত: অনুগ্রহ করে প্রথমে লগইন করুন',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({
      status: 'fail',
      message: 'টোকেনটি অবৈধ বা এর মেয়াদ শেষ হয়ে গেছে',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Guard
 * Ensures only authorized roles (DRIVER or PASSENGER) can access specific routes.
 */
export const requireRole = (allowedRole: Role) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== allowedRole) {
      res.status(403).json({
        status: 'fail',
        message: `অননুমোদিত অনুরোধ: এই কার্যটি কেবল ${allowedRole} সম্পাদন করতে পারবেন`,
      });
      return;
    }
    next();
  };
};