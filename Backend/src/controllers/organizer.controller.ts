import { Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { Event } from '../models/Event.model';
import { Registration } from '../models/Registration.model';
import { Announcement } from '../models/Announcement.model';
import { Ticket } from '../models/Ticket.model';
import { User } from '../models/User.model';
import { APIFeatures } from '../utils/apiFeatures';

export class OrganizerController {
  static async getDashboard(req: AuthRequest, res: Response) {
    const stats = await AnalyticsService.getDashboardStats(req.user!);
    sendSuccess(req, res, 200, 'Organizer dashboard stats fetched', stats);
  }

  static async getAnalytics(req: AuthRequest, res: Response) {
    const data = await AnalyticsService.getAnalyticsData(req.user!);
    sendSuccess(req, res, 200, 'Organizer analytics fetched', data);
  }

  static async getEvents(req: AuthRequest, res: Response) {
    const features = new APIFeatures(
      Event.find({ organizer: req.user!._id, isDeleted: false }),
      req.query
    )
      .filter()
      .search(['title', 'category'])
      .sort()
      .paginate();

    const events = await features.query;
    sendSuccess(req, res, 200, 'Organizer events fetched', events);
  }

  static async getRegistrations(req: AuthRequest, res: Response) {
    const events = await Event.find({ organizer: req.user!._id, isDeleted: false }).select('_id');
    const eventIds = events.map((e) => e._id);

    const features = new APIFeatures(
      Registration.find({ event: { $in: eventIds } }).populate('user', 'name email photoURL').populate('event', 'title'),
      req.query
    )
      .filter()
      .sort()
      .paginate();

    const registrations = await features.query;

    const regIds = registrations.map((r: any) => r._id);
    const tickets = await Ticket.find({ registration: { $in: regIds } });

    const enhancedRegistrations = registrations.map((r: any) => {
      const ticket = tickets.find((t: any) => t.registration.toString() === r._id.toString());
      return {
        ...r.toObject(),
        ticket: ticket ? ticket.toObject() : null,
      };
    });

    sendSuccess(req, res, 200, 'Organizer registrations fetched', enhancedRegistrations);
  }

  static async createAnnouncement(req: AuthRequest, res: Response) {
    const { eventId, title, message } = req.body;

    const event = await Event.findOne({ _id: eventId, organizer: req.user!._id, isDeleted: false });
    if (!event) {
      return sendSuccess(req, res, 404, 'Event not found or unauthorized');
    }

    const announcement = await Announcement.create({ event: eventId, title, message });
    sendSuccess(req, res, 201, 'Announcement created', announcement);
  }

  static async getSettings(req: AuthRequest, res: Response) {
    sendSuccess(req, res, 200, 'Settings fetched', {
      emailNotifications: true,
      smsNotifications: false,
      autoApproveWaitlist: true,
      timezone: 'UTC',
      paymentGateway: 'stripe',
    });
  }

  static async getProfile(req: AuthRequest, res: Response) {
    const user = await User.findById(req.user!._id);
    if (!user) {
      return sendSuccess(req, res, 404, 'User not found');
    }

    sendSuccess(req, res, 200, 'Profile fetched', {
      id: user._id,
      name: user.name,
      email: user.email,
      organization: user.college || 'College Events',
      role: 'organizer',
      avatarUrl: user.photoURL,
    });
  }

  static async getEventAnalytics(req: AuthRequest, res: Response) {
    sendSuccess(req, res, 200, 'Event analytics fetched', {
      totalViews: 1200,
      uniqueVisitors: 850,
      conversionRate: 15.4,
      deviceBreakdown: { mobile: 65, desktop: 30, tablet: 5 },
      recentViews: [
        { date: new Date().toISOString(), count: 45 },
        { date: new Date(Date.now() - 86400000).toISOString(), count: 32 },
      ],
    });
  }
}
