import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../types';

export const requestIdMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const reqId = crypto.randomUUID();
  req.requestId = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
};
