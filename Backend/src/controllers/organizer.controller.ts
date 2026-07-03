import { Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { Event } from '../models/Event.model';
import { Registration } from '../models/Registration.model';
import { Announcement } from '../models/Announcement.model';
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

    // Fetch registrations first
    const features = new APIFeatures(
      Registration.find({ event: { $in: eventIds } }).populate('user', 'name email photoURL').populate('event', 'title'),
      req.query
    )
      .filter()
      .sort()
      .paginate();

    const registrations = await features.query;

    // For each registration, fetch its ticket
    const Ticket = require('../models/Ticket.model').Ticket;
    const regIds = registrations.map(r => r._id);
    const tickets = await Ticket.find({ registration: { $in: regIds } });

    const enhancedRegistrations = registrations.map(r => {
      const ticket = tickets.find(t => t.registration.toString() === r._id.toString());
      return {
        ...r.toObject(),
        ticket: ticket ? ticket.toObject() : null
      };
    });

    sendSuccess(req, res, 200, 'Organizer registrations fetched', enhancedRegistrations);
  }

  static async createAnnouncement(req: AuthRequest, res: Response) {
    const { eventId, title, message } = req.body;

    // Verify event belongs to organizer
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
    sendSuccess(req, res, 200, 'Profile fetched', {
      id: req.user!.uid,
      name: req.user!.name || (req.user!.email === 'admin@example.com' ? 'Mock Organizer' : 'Organizer'),
      email: req.user!.email,
      organization: 'College Events',
      role: 'organizer',
      avatarUrl: req.user!.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userAny.name || 'Organizer')}&background=random`,
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
        { date: new Date(Date.now() - 86400000).toISOString(), count: 32 }
      ]
    });
  }
}
