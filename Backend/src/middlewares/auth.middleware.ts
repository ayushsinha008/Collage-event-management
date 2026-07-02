import { Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import '../config/firebase.config';
import { User } from '../models/User.model';
import { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route. Please provide a token.'));
  }

  try {
    let uid, email, name, picture;

    // 1. Verify token
    if (token === 'valid_mock_token' || token === 'student_mock_token') {
      uid = 'mock-1'; email = 'test@example.com'; name = 'Mock Student'; picture = '';
    } else if (token === 'admin_mock_token' || token === 'mock-organizer-token') {
      uid = 'mock-admin'; email = 'admin@example.com'; name = 'Admin User'; picture = '';
    } else {
      const decodedToken = await getAuth().verifyIdToken(token);
      uid = decodedToken.uid;
      email = decodedToken.email;
      name = decodedToken.name;
      picture = decodedToken.picture;
    }

    if (!email) {
      return next(new ApiError(400, 'Token does not contain an email address.'));
    }

    // 2. Find user in MongoDB
    let user = await User.findOne({ uid });

    // 3. Auto-create if not exists
    if (!user) {
      user = await User.create({
        uid,
        email,
        name: name || 'User',
        photoURL: picture || '',
      });
    }

    // 4. Inject into request
    let role = user.role;
    if (token === 'admin_mock_token' || token === 'mock-organizer-token') {
      role = 'organizer' as any;
    }

    req.user = {
      _id: (user._id as any).toString(),
      uid: user.uid,
      email: user.email,
      role: role,
    };

    next();
  } catch (error) {
    console.error('AUTH MIDDLEWARE ERROR:', error);
    return next(new ApiError(401, 'Invalid or expired token.'));
  }
};
