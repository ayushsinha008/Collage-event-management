import { Response } from 'express';
import { UserService } from '../services/user.service';
import { RegistrationService } from '../services/registration.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    const user = await UserService.getProfile(req.user!._id);
    sendSuccess(req, res, 200, 'Profile fetched successfully', user);
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    const user = await UserService.updateProfile(req.user!._id, req.body);
    sendSuccess(req, res, 200, 'Profile updated successfully', user);
  }

  static async getUserEvents(req: AuthRequest, res: Response) {
    const events = await RegistrationService.getUserEvents(req.user!._id, req.query);
    sendSuccess(req, res, 200, 'User events fetched successfully', events);
  }

  static async getUserTickets(req: AuthRequest, res: Response) {
    const tickets = await RegistrationService.getUserTickets(req.user!._id, req.query);
    console.log('SENDING TICKETS:', JSON.stringify(tickets, null, 2));
    sendSuccess(req, res, 200, 'User tickets fetched successfully', tickets);
  }
}
