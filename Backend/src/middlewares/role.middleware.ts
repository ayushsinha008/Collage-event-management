import { Response, NextFunction } from 'express';
import { AuthRequest, Role } from '../types';
import { ApiError } from '../utils/ApiError';

export const requireRole = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `User role ${req.user.role} is not authorized to access this route. Required: ${roles.join(', ')}`)
      );
    }

    next();
  };
};
