import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../types';

export const requestIdMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const reqId = uuidv4();
  req.requestId = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
};
