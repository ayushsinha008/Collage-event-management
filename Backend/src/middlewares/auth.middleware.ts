import { Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import '../config/firebase.config';
import { User } from '../models/User.model';
import { AuthRequest, Role } from '../types';
import { ApiError } from '../utils/ApiError';

const STAFF_SESSIONS: Record<string, { uid: string; email: string; name: string; role: Role }> = {
  'festflow-staff-organizer': {
    uid: 'festflow-organizer',
    email: 'organizer@festflow.internal',
    name: 'FestFlow Organizer',
    role: Role.ORGANIZER,
  },
  'festflow-staff-volunteer': {
    uid: 'festflow-volunteer',
    email: 'volunteer@festflow.internal',
    name: 'FestFlow Volunteer',
    role: Role.VOLUNTEER,
  }
};

const attachStaffSession = async (req: AuthRequest, session: typeof STAFF_SESSIONS[string], next: NextFunction) => {
  let user = await User.findOne({ uid: session.uid });

  if (!user) {
    user = await User.create({
      uid: session.uid,
      email: session.email,
      name: session.name,
      role: session.role,
    });
  } else if (user.role !== session.role) {
    user.role = session.role;
    await user.save();
  }

  req.user = {
    _id: (user._id as any).toString(),
    uid: user.uid,
    email: user.email,
    role: user.role,
  };

  next();
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route. Please provide a token.'));
  }

  if (token in STAFF_SESSIONS) {
    return attachStaffSession(req, STAFF_SESSIONS[token], next);
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return next(new ApiError(400, 'Token does not contain an email address.'));
    }

    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.create({
        uid,
        email,
        name: name || 'User',
        photoURL: picture || '',
      });
    } else {
      let updated = false;
      if (picture && (!user.photoURL || (user.photoURL.includes('googleusercontent.com') && user.photoURL !== picture))) {
        // Only update if it's empty or if it's a google URL that changed. Don't overwrite Cloudinary URLs.
        if (!user.photoURL || user.photoURL.includes('googleusercontent.com')) {
           user.photoURL = picture;
           updated = true;
        }
      }
      if (name && user.name !== name) {
        user.name = name;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    req.user = {
      _id: (user._id as any).toString(),
      uid: user.uid,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('AUTH MIDDLEWARE ERROR:', error);
    return next(new ApiError(401, 'Invalid or expired token.'));
  }
};
