import { Event } from '../types/event';
import { DashboardStats, Registration, Announcement, Volunteer } from '../types/organizer';

export const mapOrganizerEvent = (e: any): Event => ({
  id: e._id?.toString() || e.id,
  title: e.title,
  description: e.description || '',
  date: e.date
    ? new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : e.date || '',
  time: e.startTime || e.time || '',
  location: e.venue || e.location || '',
  category: e.category,
  organizer: e.organizer?.name || e.organizer || 'Unknown',
  capacity: e.capacity ?? 100,
  imageUrl: e.bannerImage || e.imageUrl,
  registrationsCount: e.registrationCount ?? e.registrationsCount ?? 0,
  rsvps: e.registrationCount ?? e.registrationsCount ?? 0,
  checkedInCount: e.checkedInCount ?? 0,
  status: String(e.status || 'Draft').toLowerCase() as Event['status'],
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});

const normalizeRegStatus = (s: string): Registration['status'] => {
  const lower = (s || '').toLowerCase();
  if (lower === 'confirmed') return 'confirmed';
  if (lower === 'pending' || lower === 'waitlist') return 'waitlist';
  if (lower === 'cancelled') return 'cancelled';
  return 'confirmed';
};

export const mapRegistration = (reg: any): Registration => ({
  id: reg._id?.toString() || reg.id,
  eventId: reg.event?._id?.toString() || reg.event?.toString() || reg.eventId,
  eventTitle: reg.event?.title || reg.eventTitle || 'Unknown Event',
  attendeeName: reg.user?.name || reg.attendeeName || 'Unknown',
  attendeeEmail: reg.user?.email || reg.attendeeEmail || '',
  attendeeAvatarUrl: reg.user?.photoURL || reg.attendeeAvatarUrl,
  ticketCode: reg.ticket?.ticketCode || reg.ticketCode || 'N/A',
  registeredAt: reg.registeredAt || reg.createdAt,
  checkedIn:
    reg.ticket?.status === 'Used' ||
    reg.ticket?.status === 'used' ||
    reg.checkedIn === true,
  checkedInAt: reg.ticket?.usedAt || reg.checkedInAt,
  status: normalizeRegStatus(reg.status),
  paymentStatus: 'free',
});

export const mapAnnouncement = (a: any): Announcement => ({
  id: a._id?.toString() || a.id,
  title: a.title,
  message: a.message,
  eventId: a.event?._id?.toString() || a.event?.toString() || a.eventId,
  eventTitle: a.event?.title || a.eventTitle || '',
  audience: a.audience || 'event-attendees',
  status: a.status || 'draft',
  scheduledAt: a.scheduledAt,
  createdBy: a.createdBy?.toString() || 'organizer',
  createdAt: a.createdAt,
  sentAt: a.sentAt,
});

export const mapVolunteer = (v: any): Volunteer => ({
  id: v._id?.toString() || v.id,
  eventId: v.event?._id?.toString() || v.event?.toString() || v.eventId,
  name: v.name,
  email: v.email,
  phone: v.phone,
  role: v.role,
  status: v.status,
  shift: v.shift,
  assignedAt: v.assignedAt || v.createdAt,
  checkedInAt: v.checkedInAt,
  notes: v.notes,
  avatarUrl: v.avatarUrl,
});

export const adaptDashboardStats = (raw: any): DashboardStats => ({
  totalEvents: raw.totalEvents ?? 0,
  activeEvents: raw.activeEvents ?? 0,
  totalRegistrations: raw.totalRegistrations ?? 0,
  thisWeekRegistrations: raw.thisWeekRegistrations ?? raw.todayRegistrations ?? 0,
  upcomingEvents: (raw.upcomingEvents || []).map(mapOrganizerEvent),
  recentActivity: raw.recentActivity || [],
});
