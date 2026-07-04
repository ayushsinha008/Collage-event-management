import mongoose from 'mongoose';
import { Event } from '../models/Event.model';
import { Registration } from '../models/Registration.model';
import { Announcement } from '../models/Announcement.model';
import { EventVolunteer } from '../models/EventVolunteer.model';
import { EventSettings } from '../models/EventSettings.model';
import { User } from '../models/User.model';
import { Ticket } from '../models/Ticket.model';
import { Notification } from '../models/Notification.model';
import { ApiError } from '../utils/ApiError';
import { AuthUser } from '../types';
import { uploadImage } from './cloudinary.service';

const defaultEventSettings = (eventId: string) => ({
  eventId,
  registrationOpen: true,
  waitlistEnabled: true,
  requireApproval: false,
  sendConfirmationEmail: true,
  sendReminderHoursBefore: 24,
  allowCheckInWindow: 30,
  ticketTemplate: 'standard' as const,
  collectPhone: true,
  cancellationPolicy: 'Full refund up to 48 hours before the event.',
  refundPolicy: 'Refunds processed within 5-7 business days.',
});

const defaultOrganizerSettings = (user: any) => ({
  account: {
    name: user.name,
    email: user.email,
    organization: user.college || 'Campus Events',
    bio: '',
    website: '',
    phone: '',
  },
  notifications: {
    newRegistration: true,
    eventReminders: true,
    weeklyDigest: true,
    marketingEmails: false,
    pushBrowser: true,
    smsNotifications: false,
  },
  appearance: {
    theme: 'light' as const,
    accent: 'green' as const,
    density: 'comfortable' as const,
    reducedMotion: false,
  },
  privacy: {
    profileVisible: true,
    showEventStats: true,
    allowDirectMessages: true,
  },
});

export class OrganizerService {
  static async assertEventOwner(eventId: string, user: AuthUser) {
    const event = await Event.findOne({ _id: eventId, organizer: user._id, isDeleted: false });
    if (!event) throw new ApiError(404, 'Event not found or unauthorized');
    return event;
  }

  static async getAnnouncements(user: AuthUser) {
    const events = await Event.find({ organizer: user._id, isDeleted: false }).select('_id title');
    const eventIds = events.map((e) => e._id);
    const announcements = await Announcement.find({ event: { $in: eventIds } })
      .sort({ createdAt: -1 })
      .populate('event', 'title');
    return announcements;
  }

  static async sendAnnouncement(id: string, user: AuthUser) {
    const announcement = await Announcement.findById(id).populate('event');
    if (!announcement) throw new ApiError(404, 'Announcement not found');
    const event = announcement.event as any;
    if (!event || event.organizer.toString() !== user._id) {
      throw new ApiError(403, 'Unauthorized');
    }
    announcement.status = 'sent';
    announcement.sentAt = new Date();
    await announcement.save();
    return announcement;
  }

  static async deleteAnnouncement(id: string, user: AuthUser) {
    const announcement = await Announcement.findById(id).populate('event');
    if (!announcement) throw new ApiError(404, 'Announcement not found');
    const event = announcement.event as any;
    if (!event || event.organizer.toString() !== user._id) {
      throw new ApiError(403, 'Unauthorized');
    }
    await announcement.deleteOne();
    return { success: true };
  }

  static async getVolunteers(eventId: string, user: AuthUser) {
    await this.assertEventOwner(eventId, user);
    return EventVolunteer.find({ event: eventId }).sort({ createdAt: -1 });
  }

  static async inviteVolunteer(eventId: string, user: AuthUser, data: any) {
    await this.assertEventOwner(eventId, user);
    return EventVolunteer.create({
      event: eventId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: 'invited',
      shift: data.shift,
      notes: data.notes,
      avatarUrl: data.avatarUrl,
      assignedAt: new Date(),
    });
  }

  static async updateVolunteer(eventId: string, volunteerId: string, user: AuthUser, data: any) {
    await this.assertEventOwner(eventId, user);
    const volunteer = await EventVolunteer.findOne({ _id: volunteerId, event: eventId });
    if (!volunteer) throw new ApiError(404, 'Volunteer not found');
    Object.assign(volunteer, data);
    await volunteer.save();
    return volunteer;
  }

  static async removeVolunteer(eventId: string, volunteerId: string, user: AuthUser) {
    await this.assertEventOwner(eventId, user);
    await EventVolunteer.deleteOne({ _id: volunteerId, event: eventId });
    return { success: true };
  }

  static async getEventSettings(eventId: string, user: AuthUser) {
    await this.assertEventOwner(eventId, user);
    let settings = await EventSettings.findOne({ event: eventId });
    if (!settings) {
      return { ...defaultEventSettings(eventId), eventId };
    }
    return { ...settings.toObject(), eventId: settings.event.toString() };
  }

  static async updateEventSettings(eventId: string, user: AuthUser, data: any) {
    await this.assertEventOwner(eventId, user);
    const settings = await EventSettings.findOneAndUpdate(
      { event: eventId },
      {
        event: eventId,
        registrationOpen: data.registrationOpen,
        waitlistEnabled: data.waitlistEnabled,
        requireApproval: data.requireApproval,
        sendConfirmationEmail: data.sendConfirmationEmail,
        sendReminderHoursBefore: data.sendReminderHoursBefore,
        allowCheckInWindow: data.allowCheckInWindow,
        ticketTemplate: data.ticketTemplate,
        collectPhone: data.collectPhone,
        cancellationPolicy: data.cancellationPolicy,
        refundPolicy: data.refundPolicy,
      },
      { upsert: true, new: true }
    );
    return { ...settings.toObject(), eventId: settings.event.toString() };
  }

  static async getLiveAttendance(eventId: string, user: AuthUser) {
    const event = await this.assertEventOwner(eventId, user);
    const checkedIn = event.checkedInCount || 0;
    const capacity = event.capacity || 100;
    const timeline = Array.from({ length: 6 }, (_, i) => {
      const pct = (i + 1) / 6;
      return {
        time: `${17 + i}:00`,
        inside: Math.round(checkedIn * pct),
        cumulative: Math.round(checkedIn * pct),
        arrived: Math.round(checkedIn / 6),
        left: 0,
      };
    });
    return {
      eventId,
      capacity,
      currentlyInside: checkedIn,
      peakToday: checkedIn,
      totalCheckedIn: checkedIn,
      timeline,
    };
  }

  static async exportRegistrations(eventId: string, user: AuthUser) {
    await this.assertEventOwner(eventId, user);
    const regs = await Registration.find({ event: eventId })
      .populate('user', 'name email')
      .sort({ registeredAt: -1 });
    const regIds = regs.map((r) => r._id);
    const tickets = await Ticket.find({ registration: { $in: regIds } });
    const header = 'id,eventId,attendeeName,attendeeEmail,ticketCode,status,registeredAt\n';
    const rows = regs.map((r: any) => {
      const ticket = tickets.find((t) => t.registration.toString() === r._id.toString());
      return [
        r._id,
        eventId,
        r.user?.name || '',
        r.user?.email || '',
        ticket?.ticketCode || '',
        r.status,
        r.registeredAt?.toISOString() || '',
      ].join(',');
    });
    return header + rows.join('\n');
  }

  static async getOrganizerSettings(user: AuthUser) {
    const dbUser = await User.findById(user._id);
    if (!dbUser) throw new ApiError(404, 'User not found');
    if (dbUser.organizerPreferences) {
      return dbUser.organizerPreferences;
    }
    return defaultOrganizerSettings(dbUser);
  }

  static async updateOrganizerSettings(user: AuthUser, data: any) {
    const update: any = { organizerPreferences: data };
    if (data?.account) {
      if (data.account.name) update.name = data.account.name;
      if (data.account.email) update.email = data.account.email;
      if (data.account.organization) update.college = data.account.organization;
    }
    const dbUser = await User.findByIdAndUpdate(
      user._id,
      update,
      { new: true }
    );
    if (!dbUser) throw new ApiError(404, 'User not found');
    return dbUser.organizerPreferences || defaultOrganizerSettings(dbUser);
  }

  static async updateOrganizerProfile(user: AuthUser, data: { name?: string; email?: string; organization?: string; avatarBase64?: string }) {
    const update: any = {};
    if (data.name) update.name = data.name;
    if (data.organization) update.college = data.organization;
    if (data.avatarBase64) {
      const url = await uploadImage(data.avatarBase64, 'avatars');
      update.photoURL = url;
    }
    const dbUser = await User.findByIdAndUpdate(user._id, update, { new: true });
    if (!dbUser) throw new ApiError(404, 'User not found');
    return {
      id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      organization: dbUser.college || 'Campus Events',
      role: 'organizer',
      avatarUrl: dbUser.photoURL,
    };
  }

  static async getNotifications(user: AuthUser) {
    return Notification.find({ user: user._id }).sort({ createdAt: -1 }).limit(50);
  }

  static async readAllNotifications(user: AuthUser) {
    await Notification.updateMany({ user: user._id, read: false }, { read: true });
    return { success: true };
  }

  static async readNotification(id: string, user: AuthUser) {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: user._id },
      { read: true },
      { new: true }
    );
    if (!notification) throw new ApiError(404, 'Notification not found');
    return notification;
  }

  static async createNotification(userId: string, title: string, message: string, type = 'INFO') {
    return Notification.create({
      user: userId,
      title,
      message,
      type
    });
  }
}
