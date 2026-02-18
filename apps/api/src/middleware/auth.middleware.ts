import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { _id: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.accessToken as string | undefined;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const secret = process.env.JWT_SECRET!;

  try {
    const decoded = jwt.verify(token, secret) as unknown as { _id: string };
    req.user = { _id: decoded._id };
    next();
  } catch (_err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
