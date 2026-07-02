import { Event } from './event';

export interface Organizer {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: 'organizer' | 'co-organizer';
  avatarUrl?: string;
  joinedAt?: string;
  eventsHosted?: number;
}

export interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketCode: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  paymentStatus?: 'paid' | 'free' | 'pending';
}

export interface Activity {
  id: string;
  type: 'registration' | 'check-in' | 'event-created' | 'announcement' | 'cancellation';
  message: string;
  timestamp: string;
  eventId?: string;
  eventTitle?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  eventId?: string;
  eventTitle?: string;
  audience: 'all' | 'event-attendees' | 'vip';
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sent';
  createdBy: string;
  createdAt: string;
}

export interface AnalyticsData {
  totalEvents: number;
  totalRegistrations: number;
  totalAttendees: number;
  totalRevenue: number;
  attendanceRate: number;
  growthRate: number;
  registrationsOverTime: { date: string; count: number }[];
  eventsByCategory: { category: string; count: number }[];
  topEvents: { eventId: string; title: string; registrations: number }[];
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  thisWeekRegistrations: number;
  upcomingEvents: Event[];
  recentActivity: Activity[];
}

/* ===================== NEW TYPES (Organizer Layer v2) ===================== */

export type VolunteerRole =
  | 'coordinator'
  | 'registration-desk'
  | 'stage-manager'
  | 'security'
  | 'photography'
  | 'tech-support'
  | 'catering'
  | 'first-aid';

export type VolunteerStatus = 'invited' | 'accepted' | 'declined' | 'checked-in' | 'no-show';

export interface Volunteer {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  role: VolunteerRole;
  status: VolunteerStatus;
  shift?: { start: string; end: string }; // "HH:MM"
  assignedAt: string;
  checkedInAt?: string;
  notes?: string;
  avatarUrl?: string;
}

export interface EventSettings {
  eventId: string;
  registrationOpen: boolean;
  waitlistEnabled: boolean;
  requireApproval: boolean;
  sendConfirmationEmail: boolean;
  sendReminderHoursBefore: number;
  allowCheckInWindow: number;
  ticketTemplate: 'standard' | 'vip' | 'workshop';
  collectPhone: boolean;
  customQuestions?: { id: string; label: string; type: 'text' | 'select'; required: boolean; options?: string[] }[];
  cancellationPolicy?: string;
  refundPolicy?: string;
}

export interface OrganizerSettings {
  account: {
    name: string;
    email: string;
    organization: string;
    bio?: string;
    website?: string;
    phone?: string;
  };
  notifications: {
    newRegistration: boolean;
    eventReminders: boolean;
    weeklyDigest: boolean;
    marketingEmails: boolean;
    pushBrowser: boolean;
    smsNotifications: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    accent: 'green' | 'yellow' | 'purple' | 'pink' | 'blue';
    density: 'comfortable' | 'compact';
    reducedMotion: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEventStats: boolean;
    allowDirectMessages: boolean;
  };
}

export interface LiveAttendancePoint {
  time: string;
  inside: number;
  cumulative: number;
  arrived?: number;
  left?: number;
}

export interface LiveAttendanceData {
  eventId: string;
  capacity: number;
  currentlyInside: number;
  peakToday: number;
  totalCheckedIn: number;
  timeline: LiveAttendancePoint[];
}