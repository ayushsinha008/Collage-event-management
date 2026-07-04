import { Request, Response } from 'express';
import '../config/firebase.config';
import { User } from '../models/User.model';
import { Notification } from '../models/Notification.model';
import { AuthRequest, Role } from '../types';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../utils/response';
import { env } from '../config/env.config';

const STAFF_ACCOUNTS = {
  organizer: {
    uid: 'festflow-organizer',
    email: 'organizer@festflow.internal',
    name: 'FestFlow Organizer',
    role: Role.ORGANIZER,
    getPasscode: () => env.ORGANIZER_PASSCODE,
    label: 'Organizer',
  },
  volunteer: {
    uid: 'festflow-volunteer',
    email: 'volunteer@festflow.internal',
    name: 'FestFlow Volunteer',
    role: Role.VOLUNTEER,
    getPasscode: () => env.VOLUNTEER_PASSCODE,
    label: 'Volunteer',
  },
} as const;

const verifyStaffPasscode = (role: 'organizer' | 'volunteer', passcode: string) => {
  const account = STAFF_ACCOUNTS[role];
  const expected = account.getPasscode();

  if (passcode !== expected) {
    throw new ApiError(403, `Invalid ${role} passcode.`);
  }

  return account;
};

export class AuthController {
  /** Public endpoint — password-only staff login (no Google required). */
  static async staffLogin(req: Request, res: Response) {
    const { passcode, role } = req.body as { passcode: string; role: 'organizer' | 'volunteer' };
    const account = verifyStaffPasscode(role, passcode);

    let user = await User.findOne({ uid: account.uid });

    if (!user) {
      user = await User.create({
        uid: account.uid,
        email: account.email,
        name: account.name,
        role: account.role,
      });
    } else if (user.role !== account.role) {
      user.role = account.role;
      await user.save();
    }

    const customToken = `festflow-staff-${role}`;

    if (user) {
      try {
        await Notification.create({
          user: user._id,
          title: 'Staff Login Session Started',
          message: `Logged in successfully as ${role === 'organizer' ? 'Organizer' : 'Volunteer'}.`,
          type: 'LOGIN'
        });
      } catch (err) {
        console.error('Failed to create login notification:', err);
      }
    }

    sendSuccess(req as AuthRequest, res, 200, 'Staff login successful', {
      customToken,
      user,
    });
  }

  static async verifyRole(req: AuthRequest, res: Response) {
    const { passcode, role } = req.body as { passcode: string; role: 'organizer' | 'volunteer' };
    verifyStaffPasscode(role, passcode);

    const newRole = role === 'organizer' ? Role.ORGANIZER : Role.VOLUNTEER;
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { role: newRole },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    try {
      await Notification.create({
        user: user._id,
        title: 'Role Verification Approved',
        message: `Successfully verified and upgraded account to ${role === 'organizer' ? 'Organizer' : 'Volunteer'}.`,
        type: 'INFO'
      });
    } catch (err) {
      console.error('Failed to create role verification notification:', err);
    }

    sendSuccess(req, res, 200, 'Role verified successfully', user);
  }
}
