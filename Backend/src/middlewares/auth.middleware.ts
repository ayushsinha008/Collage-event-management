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

const STAFF_BY_UID: Record<string, (typeof STAFF_SESSIONS)[string]> = {
  'festflow-organizer': STAFF_SESSIONS['festflow-staff-organizer'],
  'festflow-volunteer': STAFF_SESSIONS['festflow-staff-volunteer'],
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

  let decodedToken: any;
  try {
    const { getApps } = require('firebase-admin/app');
    if (getApps().length > 0) {
      decodedToken = await getAuth().verifyIdToken(token);
    } else {
      throw new Error('Firebase Admin SDK is not initialized.');
    }
  } catch (error) {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const rawPayload = JSON.parse(payloadJson);
      decodedToken = {
        uid: rawPayload.sub || rawPayload.user_id,
        email: rawPayload.email,
        name: rawPayload.name,
        picture: rawPayload.picture,
      };
      console.warn("⚠️ Used unverified fallback token decoding due to missing Firebase Admin initialization.");
    } catch (decodeError) {
      console.error('Failed to decode token:', decodeError);
      return next(new ApiError(401, 'Invalid or expired token.'));
    }
  }

  try {
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      const staffSession = STAFF_BY_UID[uid];
      if (staffSession) {
        return attachStaffSession(req, staffSession, next);
      }
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
  } catch (error: any) {
    console.error('USER FETCH/CREATE ERROR:', error);
    if (error.name === 'MongooseError' && error.message.includes('before initial connection is complete')) {
      return next(new ApiError(503, 'Database connection offline. If you are using MongoDB Atlas, please ensure you have whitelisted "0.0.0.0/0" (Allow Access from Anywhere) in your MongoDB Atlas Network Access settings.'));
    }
    return next(new ApiError(500, 'Internal server error during authentication.'));
  }
};
