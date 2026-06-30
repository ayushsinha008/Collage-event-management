import { Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { User } from '../models/User.model';
import { Event } from '../models/Event.model';
import { APIFeatures } from '../utils/apiFeatures';

export class AdminController {
  static async getDashboard(req: AuthRequest, res: Response) {
    const stats = await AnalyticsService.getDashboardStats(req.user!);
    sendSuccess(req, res, 200, 'Admin dashboard stats fetched', stats);
  }

  static async getUsers(req: AuthRequest, res: Response) {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .search(['name', 'email'])
      .sort()
      .paginate();

    const users = await features.query;
    sendSuccess(req, res, 200, 'Users fetched', users);
  }

  static async updateUser(req: AuthRequest, res: Response) {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    sendSuccess(req, res, 200, 'User updated', user);
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    await User.findByIdAndDelete(req.params.id);
    sendSuccess(req, res, 200, 'User deleted');
  }

  static async getEvents(req: AuthRequest, res: Response) {
    const features = new APIFeatures(Event.find({ isDeleted: false }), req.query)
      .filter()
      .search(['title', 'category'])
      .sort()
      .paginate();

    const events = await features.query;
    sendSuccess(req, res, 200, 'Events fetched', events);
  }

  static async deleteEvent(req: AuthRequest, res: Response) {
    const event = await Event.findById(req.params.id);
    if (event) {
      event.isDeleted = true;
      event.deletedAt = new Date();
      await event.save();
    }
    sendSuccess(req, res, 200, 'Event deleted');
  }
}
