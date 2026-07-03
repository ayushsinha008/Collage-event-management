import { Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { OrganizerService } from '../services/organizer.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { Event } from '../models/Event.model';
import { Registration } from '../models/Registration.model';
import { Announcement } from '../models/Announcement.model';
import { Ticket } from '../models/Ticket.model';
import { User } from '../models/User.model';
import { APIFeatures } from '../utils/apiFeatures';
import { ApiError } from '../utils/ApiError';

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

    const query: any = { event: { $in: eventIds } };
    if (req.query.event) {
      query.event = req.query.event;
    }

    const features = new APIFeatures(
      Registration.find(query).populate('user', 'name email photoURL').populate('event', 'title'),
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
    const { eventId, title, message, audience, scheduledAt } = req.body as {
      eventId?: string;
      title: string;
      message: string;
      audience?: 'all' | 'event-attendees' | 'vip';
      scheduledAt?: string;
    };

    if (!eventId) {
      throw new ApiError(400, 'Please select an event for this announcement.');
    }

    await OrganizerService.assertEventOwner(eventId, req.user!);

    let status: 'draft' | 'scheduled' | 'sent' = 'draft';
    let scheduledDate: Date | undefined;

    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      if (Number.isNaN(scheduledDate.getTime())) {
        throw new ApiError(400, 'Invalid schedule date.');
      }
      if (scheduledDate > new Date()) {
        status = 'scheduled';
      }
    }

    const announcement = await Announcement.create({
      event: eventId,
      title,
      message,
      audience: audience || 'event-attendees',
      scheduledAt: scheduledDate,
      status,
    });

    const populated = await Announcement.findById(announcement._id).populate('event', 'title');
    sendSuccess(req, res, 201, 'Announcement created', populated);
  }

  static async getAnnouncements(req: AuthRequest, res: Response) {
    const announcements = await OrganizerService.getAnnouncements(req.user!);
    sendSuccess(req, res, 200, 'Announcements fetched', announcements);
  }

  static async sendAnnouncement(req: AuthRequest, res: Response) {
    const announcement = await OrganizerService.sendAnnouncement(String(req.params.id), req.user!);
    sendSuccess(req, res, 200, 'Announcement sent', announcement);
  }

  static async deleteAnnouncement(req: AuthRequest, res: Response) {
    const result = await OrganizerService.deleteAnnouncement(String(req.params.id), req.user!);
    sendSuccess(req, res, 200, 'Announcement deleted', result);
  }

  static async getSettings(req: AuthRequest, res: Response) {
    const settings = await OrganizerService.getOrganizerSettings(req.user!);
    sendSuccess(req, res, 200, 'Settings fetched', settings);
  }

  static async updateSettings(req: AuthRequest, res: Response) {
    const settings = await OrganizerService.updateOrganizerSettings(req.user!, req.body);
    sendSuccess(req, res, 200, 'Settings updated', settings);
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
      organization: user.college || 'Campus Events',
      role: 'organizer',
      avatarUrl: user.photoURL,
    });
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    const profile = await OrganizerService.updateOrganizerProfile(req.user!, req.body);
    sendSuccess(req, res, 200, 'Profile updated', profile);
  }

  static async getVolunteers(req: AuthRequest, res: Response) {
    const volunteers = await OrganizerService.getVolunteers(String(req.params.eventId), req.user!);
    sendSuccess(req, res, 200, 'Volunteers fetched', volunteers);
  }

  static async inviteVolunteer(req: AuthRequest, res: Response) {
    const volunteer = await OrganizerService.inviteVolunteer(String(req.params.eventId), req.user!, req.body);
    sendSuccess(req, res, 201, 'Volunteer invited', volunteer);
  }

  static async updateVolunteer(req: AuthRequest, res: Response) {
    const volunteer = await OrganizerService.updateVolunteer(
      String(req.params.eventId),
      String(req.params.id),
      req.user!,
      req.body
    );
    sendSuccess(req, res, 200, 'Volunteer updated', volunteer);
  }

  static async removeVolunteer(req: AuthRequest, res: Response) {
    const result = await OrganizerService.removeVolunteer(String(req.params.eventId), String(req.params.id), req.user!);
    sendSuccess(req, res, 200, 'Volunteer removed', result);
  }

  static async getEventSettings(req: AuthRequest, res: Response) {
    const settings = await OrganizerService.getEventSettings(String(req.params.eventId), req.user!);
    sendSuccess(req, res, 200, 'Event settings fetched', settings);
  }

  static async updateEventSettings(req: AuthRequest, res: Response) {
    const settings = await OrganizerService.updateEventSettings(String(req.params.eventId), req.user!, req.body);
    sendSuccess(req, res, 200, 'Event settings updated', settings);
  }

  static async getLiveAttendance(req: AuthRequest, res: Response) {
    const data = await OrganizerService.getLiveAttendance(String(req.params.eventId), req.user!);
    sendSuccess(req, res, 200, 'Live attendance fetched', data);
  }

  static async exportRegistrations(req: AuthRequest, res: Response) {
    const eventId = (req.query.eventId as string) || '';
    const csv = await OrganizerService.exportRegistrations(eventId, req.user!);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="registrations-${eventId}.csv"`);
    res.send(csv);
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

  static async getNotifications(req: AuthRequest, res: Response) {
    const notifications = await OrganizerService.getNotifications(req.user!);
    sendSuccess(req, res, 200, 'Notifications fetched', notifications);
  }

  static async readAllNotifications(req: AuthRequest, res: Response) {
    const result = await OrganizerService.readAllNotifications(req.user!);
    sendSuccess(req, res, 200, 'All notifications marked as read', result);
  }

  static async readNotification(req: AuthRequest, res: Response) {
    const notification = await OrganizerService.readNotification(String(req.params.id), req.user!);
    sendSuccess(req, res, 200, 'Notification marked as read', notification);
  }
}
