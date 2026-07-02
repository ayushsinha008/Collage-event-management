import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'organizer' | 'admin';
    email: string;
  };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  if (token === 'student-token') {
    req.user = { id: 'std_01', role: 'student', email: 'student@univ.edu' };
    return next();
  } else if (token === 'organizer-token') {
    req.user = { id: 'org_01', role: 'organizer', email: 'events@univ.edu' };
    return next();
  } else if (token === 'admin-token') {
    req.user = { id: 'adm_01', role: 'admin', email: 'admin@univ.edu' };
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Invalid or expired token.'
  });
};

export const requireRole = (allowedRoles: ('student' | 'organizer' | 'admin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized.`
      });
    }

    return next();
  };
};
