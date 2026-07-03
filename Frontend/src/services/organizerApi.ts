import axios from 'axios';
import { getAuthToken } from '../utils/authToken';
import { API_BASE_URL } from '../config/api';
import { Event } from '../types/event';
import {
  Organizer,
  Registration,
  Announcement,
  AnalyticsData,
  DashboardStats,
  Volunteer,
  EventSettings,
  OrganizerSettings,
  LiveAttendanceData,
} from '../types/organizer';
import {
  mapOrganizerEvent,
  mapRegistration,
  mapAnnouncement,
  mapVolunteer,
  adaptDashboardStats,
} from '../utils/organizerMappers';

const mapEventResponse = (e: any): Event => mapOrganizerEvent(e);

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use((response) => {
  if (response.data && response.data.success && response.data.data !== undefined) {
    response.data = response.data.data;
  }
  return response;
});

const withMockFallback = async <T>(apiCall: () => Promise<T>, mockData: T): Promise<T> => {
  try {
    return await apiCall();
  } catch (err: any) {
    // If we have a response from the server (e.g. 400, 404), throw it! 
    // It means the backend is online but rejected the request.
    if (err.response) {
      throw err;
    }
    console.warn('Backend server offline, using mock data.', err);
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockData;
  }
};

// --- MOCK DATA ---
const mockProfile: Organizer = {
  id: 'org1', name: 'Jane Doe', email: 'jane@college.edu',
  organization: 'Cultural Committee',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  role: 'organizer',
};

const mockStats: DashboardStats = {
  totalEvents: 12, activeEvents: 3, totalRegistrations: 450, thisWeekRegistrations: 85,
  recentActivity: [
    { id: '1', type: 'registration', message: 'Alex registered for NEON PULSE', timestamp: new Date().toISOString(), eventId: '1' },
    { id: '2', type: 'check-in', message: 'Sarah checked in at NEON PULSE', timestamp: new Date(Date.now() - 3600000).toISOString(), eventId: '1' },
    { id: '3', type: 'event-created', message: 'New workshop "Brutalist UI Lab" created', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: '4', type: 'announcement', message: 'VIP passes released for Retro Rewind', timestamp: new Date(Date.now() - 10800000).toISOString() },
  ],
  upcomingEvents: [
    { id: '1', title: 'NEON PULSE MUSIC FESTIVAL', date: 'OCT 24 - 26', time: '06:00 PM', location: 'Campus Stadium', category: 'CULTURAL', capacity: 2000, registrationsCount: 450, rsvps: 450, organizer: 'Cultural Committee', description: 'The biggest musical extravaganza on campus.', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80' },
    { id: '2', title: 'AI & THE FUTURE OF CREATIVITY', date: 'Tomorrow', time: '04:00 PM', location: 'Auditorium A', category: 'TECHNICAL', capacity: 200, registrationsCount: 180, rsvps: 180, organizer: 'CS Association', description: 'Industry panel on generative AI.', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
  ],
};

const mockEvents: Event[] = [
  { id: '1', title: 'NEON PULSE MUSIC FESTIVAL', date: 'OCT 24 - 26', time: '06:00 PM', location: 'Campus Stadium', category: 'CULTURAL', capacity: 2000, registrationsCount: 450, rsvps: 450, organizer: 'Cultural Committee', description: 'The biggest musical extravaganza on campus. Three nights, ten artists.', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', status: 'published', createdBy: 'org1' },
  { id: '2', title: 'AI & THE FUTURE OF CREATIVITY', date: 'Tomorrow', time: '04:00 PM', location: 'Auditorium A', category: 'TECHNICAL', capacity: 200, registrationsCount: 180, rsvps: 180, organizer: 'CS Dept', description: 'Industry panel on generative AI.', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', status: 'published', createdBy: 'org1' },
  { id: '3', title: 'BRUTALIST UI LAB', date: 'OCT 30', time: '02:00 PM', location: 'Design Lab 4', category: 'WORKSHOP', capacity: 50, registrationsCount: 22, rsvps: 22, organizer: 'Design Club', description: 'Hands-on session on raw digital layouts.', imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', status: 'draft', createdBy: 'org1' },
  { id: '4', title: 'INTER-COLLEGE SLAM DUNK', date: 'SAT', time: '07:00 PM', location: 'Main Gym', category: 'SPORTS', capacity: 500, registrationsCount: 340, rsvps: 340, organizer: 'Sports Club', description: 'Basketball showdown between colleges.', imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80', status: 'live', createdBy: 'org1' },
  { id: '5', title: 'CLUB NIGHT: RETRO REWIND', date: 'OCT 31', time: '08:00 PM', location: 'Student Lounge', category: 'CULTURAL', capacity: 150, registrationsCount: 145, rsvps: 145, organizer: 'Entertainment Club', description: 'Retro tunes, arcade machines, neon dancefloors.', imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80', status: 'published', createdBy: 'org1' },
];

const mockAnalytics: AnalyticsData = {
  totalEvents: 12, totalRegistrations: 450, totalAttendees: 380, totalRevenue: 0,
  attendanceRate: 84, growthRate: 18,
  registrationsOverTime: [
    { date: 'Mon', count: 10 }, { date: 'Tue', count: 25 }, { date: 'Wed', count: 40 },
    { date: 'Thu', count: 30 }, { date: 'Fri', count: 60 }, { date: 'Sat', count: 85 },
    { date: 'Sun', count: 120 },
  ],
  eventsByCategory: [
    { category: 'CULTURAL', count: 4 },
    { category: 'TECHNICAL', count: 3 },
    { category: 'SPORTS', count: 2 },
    { category: 'WORKSHOP', count: 3 },
  ],
  topEvents: [
    { eventId: '1', title: 'NEON PULSE', registrations: 450 },
    { eventId: '2', title: 'AI & CREATIVITY', registrations: 180 },
    { eventId: '5', title: 'CLUB NIGHT', registrations: 145 },
  ],
};

const mockRegistrations: Registration[] = [
  { id: 'r1', eventId: '1', eventTitle: 'NEON PULSE', attendeeName: 'Alex Kumar', attendeeEmail: 'alex@college.edu', ticketCode: 'FFLOW-TKT-001', registeredAt: new Date(Date.now() - 86400000).toISOString(), checkedIn: true, checkedInAt: new Date().toISOString(), status: 'confirmed', paymentStatus: 'free' },
  { id: 'r2', eventId: '1', eventTitle: 'NEON PULSE', attendeeName: 'Sarah Lee', attendeeEmail: 'sarah@college.edu', ticketCode: 'FFLOW-TKT-002', registeredAt: new Date(Date.now() - 43200000).toISOString(), checkedIn: false, status: 'confirmed', paymentStatus: 'free' },
  { id: 'r3', eventId: '1', eventTitle: 'NEON PULSE', attendeeName: 'Priya S', attendeeEmail: 'priya@college.edu', ticketCode: 'FFLOW-TKT-003', registeredAt: new Date(Date.now() - 36000000).toISOString(), checkedIn: false, status: 'waitlist', paymentStatus: 'paid' },
  { id: 'r4', eventId: '2', eventTitle: 'AI & CREATIVITY', attendeeName: 'Rohan V', attendeeEmail: 'rohan@college.edu', ticketCode: 'FFLOW-TKT-101', registeredAt: new Date(Date.now() - 7200000).toISOString(), checkedIn: false, status: 'confirmed', paymentStatus: 'free' },
  { id: 'r5', eventId: '5', eventTitle: 'CLUB NIGHT', attendeeName: 'Megha T', attendeeEmail: 'megha@college.edu', ticketCode: 'FFLOW-TKT-501', registeredAt: new Date(Date.now() - 1800000).toISOString(), checkedIn: true, checkedInAt: new Date().toISOString(), status: 'confirmed', paymentStatus: 'free' },
  { id: 'r6', eventId: '5', eventTitle: 'CLUB NIGHT', attendeeName: 'Karan B', attendeeEmail: 'karan@college.edu', ticketCode: 'FFLOW-TKT-502', registeredAt: new Date().toISOString(), checkedIn: false, status: 'cancelled', paymentStatus: 'free' },
];

const mockAnnouncements: Announcement[] = [
  { id: 'a1', title: 'NEON PULSE — Gates Open 5 PM', message: 'Bring your student IDs. Photography permitted. Be respectful, have fun.', audience: 'event-attendees', eventId: '1', eventTitle: 'NEON PULSE', status: 'sent', createdBy: 'org1', createdAt: new Date(Date.now() - 86400000).toISOString(), sentAt: new Date(Date.now() - 80000000).toISOString() },
];

const mockVolunteers: Volunteer[] = [
  { id: 'v1', eventId: '1', name: 'Arjun Mehta', email: 'arjun@college.edu', phone: '+91 90000 11111', role: 'coordinator', status: 'checked-in', shift: { start: '14:00', end: '22:00' }, assignedAt: new Date(Date.now() - 5 * 86400000).toISOString(), checkedInAt: new Date(Date.now() - 2 * 3600000).toISOString(), avatarUrl: 'https://i.pravatar.cc/100?img=12' },
  { id: 'v2', eventId: '1', name: 'Riya Sharma', email: 'riya@college.edu', phone: '+91 90000 22222', role: 'registration-desk', status: 'accepted', shift: { start: '16:00', end: '20:00' }, assignedAt: new Date(Date.now() - 4 * 86400000).toISOString(), avatarUrl: 'https://i.pravatar.cc/100?img=47' },
  { id: 'v3', eventId: '1', name: 'Vikram Patel', email: 'vikram@college.edu', phone: '+91 90000 33333', role: 'security', status: 'accepted', shift: { start: '18:00', end: '23:00' }, assignedAt: new Date(Date.now() - 4 * 86400000).toISOString(), avatarUrl: 'https://i.pravatar.cc/100?img=33' },
  { id: 'v4', eventId: '1', name: 'Neha Kapoor', email: 'neha@college.edu', phone: '+91 90000 44444', role: 'photography', status: 'invited', shift: { start: '17:00', end: '21:00' }, assignedAt: new Date(Date.now() - 3 * 86400000).toISOString(), avatarUrl: 'https://i.pravatar.cc/100?img=45' },
  { id: 'v5', eventId: '1', name: 'Sanjay Iyer', email: 'sanjay@college.edu', phone: '+91 90000 55555', role: 'tech-support', status: 'checked-in', shift: { start: '15:00', end: '22:30' }, assignedAt: new Date(Date.now() - 5 * 86400000).toISOString(), checkedInAt: new Date(Date.now() - 3 * 3600000).toISOString(), avatarUrl: 'https://i.pravatar.cc/100?img=15' },
  { id: 'v6', eventId: '1', name: 'Tara Joshi', email: 'tara@college.edu', role: 'first-aid', status: 'declined', shift: { start: '18:00', end: '22:00' }, assignedAt: new Date(Date.now() - 2 * 86400000).toISOString(), avatarUrl: 'https://i.pravatar.cc/100?img=49' },
  { id: 'v7', eventId: '1', name: 'Kabir Singh', email: 'kabir@college.edu', phone: '+91 90000 66666', role: 'stage-manager', status: 'accepted', shift: { start: '14:00', end: '23:00' }, assignedAt: new Date(Date.now() - 5 * 86400000).toISOString(), avatarUrl: 'https://i.pravatar.cc/100?img=8' },
  { id: 'v8', eventId: '1', name: 'Ananya Roy', email: 'ananya@college.edu', phone: '+91 90000 77777', role: 'catering', status: 'accepted', shift: { start: '17:00', end: '21:00' }, assignedAt: new Date(Date.now() - 3 * 86400000).toISOString(), avatarUrl: 'https://i.pravatar.cc/100?img=44' },
];

const mockEventSettings: EventSettings = {
  eventId: '1',
  registrationOpen: true,
  waitlistEnabled: true,
  requireApproval: false,
  sendConfirmationEmail: true,
  sendReminderHoursBefore: 24,
  allowCheckInWindow: 30,
  ticketTemplate: 'standard',
  collectPhone: true,
  cancellationPolicy: 'Full refund up to 48 hours before the event. No refund within 48 hours.',
  refundPolicy: 'Refunds processed within 5-7 business days to original payment method.',
};

const mockOrganizerSettings: OrganizerSettings = {
  account: {
    name: 'Jane Doe', email: 'jane@college.edu', organization: 'Cultural Committee',
    bio: 'Event organizer at Cultural Committee. Passionate about campus experiences.',
    website: 'https://cultural.committee', phone: '+91 98765 43210',
  },
  notifications: {
    newRegistration: true, eventReminders: true, weeklyDigest: true,
    marketingEmails: false, pushBrowser: true, smsNotifications: false,
  },
  appearance: { theme: 'light', accent: 'green', density: 'comfortable', reducedMotion: false },
  privacy: { profileVisible: true, showEventStats: true, allowDirectMessages: true },
};

const mockLiveAttendance: LiveAttendanceData = {
  eventId: '1',
  capacity: 2000,
  currentlyInside: 1247,
  peakToday: 1380,
  totalCheckedIn: 1320,
  timeline: [
    { time: '17:00', inside: 0, cumulative: 0, arrived: 0, left: 0 },
    { time: '17:30', inside: 120, cumulative: 120, arrived: 120, left: 0 },
    { time: '18:00', inside: 340, cumulative: 340, arrived: 220, left: 0 },
    { time: '18:30', inside: 580, cumulative: 580, arrived: 240, left: 0 },
    { time: '19:00', inside: 870, cumulative: 870, arrived: 290, left: 0 },
    { time: '19:30', inside: 1140, cumulative: 1140, arrived: 270, left: 0 },
    { time: '20:00', inside: 1280, cumulative: 1280, arrived: 200, left: 60 },
    { time: '20:30', inside: 1380, cumulative: 1380, arrived: 180, left: 80 },
    { time: '21:00', inside: 1340, cumulative: 1380, arrived: 60, left: 100 },
    { time: '21:30', inside: 1280, cumulative: 1390, arrived: 50, left: 110 },
    { time: '22:00', inside: 1247, cumulative: 1430, arrived: 40, left: 73 },
  ],
};

export const organizerApi = {
  // Profile
  getProfile: () =>
    withMockFallback<Organizer>(
      () =>
        API.get<any>('/users/profile').then((r) => ({
          id: r.data._id || r.data.id,
          name: r.data.name,
          email: r.data.email,
          organization: r.data.college || r.data.organization || 'Campus Events',
          role: 'organizer',
          avatarUrl: r.data.photoURL,
        })),
      mockProfile
    ),
  updateProfile: (data: Partial<Organizer>) =>
    withMockFallback<Organizer>(
      () =>
        API.patch<any>('/users/profile', {
          name: data.name,
          college: data.organization,
        }).then((r) => ({
          id: r.data._id || r.data.id,
          name: r.data.name,
          email: r.data.email,
          organization: r.data.college || data.organization || 'Campus Events',
          role: 'organizer',
          avatarUrl: r.data.photoURL,
        })),
      { ...mockProfile, ...data }
    ),

  // Dashboard
  getDashboardStats: () =>
    withMockFallback(
      () => API.get<any>('/organizer/dashboard').then((r) => adaptDashboardStats(r.data)),
      mockStats
    ),
  getLiveAttendance: (eventId: string) =>
    withMockFallback(() => API.get<LiveAttendanceData>(`/organizer/events/${eventId}/live-attendance`).then((r) => r.data), mockLiveAttendance),

  // Events
  getMyEvents: (params?: { status?: string; category?: string; search?: string }) => {
    const apiParams: Record<string, string> = {};
    if (params?.search) apiParams.search = params.search;
    if (params?.status && params.status !== 'all') apiParams.status = params.status;
    if (params?.category && params.category !== 'all') apiParams.category = params.category;

    return withMockFallback(
      () =>
        API.get<any[]>('/organizer/events', { params: apiParams }).then((r) =>
          (Array.isArray(r.data) ? r.data : []).map(mapEventResponse)
        ),
      mockEvents.filter(
        (e) =>
          (!params?.status || params.status === 'all' || e.status === params.status) &&
          (!params?.category ||
            params.category === 'all' ||
            String(e.category).toLowerCase() === String(params.category).toLowerCase()) &&
          (!params?.search || e.title.toLowerCase().includes(params.search.toLowerCase()))
      )
    );
  },
  createEvent: (data: any) => {
    const payload: any = { ...data };
    if (data.imageUrl) payload.bannerImage = data.imageUrl;
    if (data.location) payload.venue = data.location;
    if (data.time) {
      payload.startTime = data.time;
      payload.endTime = data.endTime || data.time;
    }
    if (data.date && !String(data.date).includes('T')) {
      payload.date = new Date(data.date).toISOString();
    }
    if (!payload.status) payload.status = 'Draft';
    return withMockFallback(
      () => API.post<any>('/events', payload).then((r) => mapEventResponse(r.data)),
      { ...data, id: 'evt-' + Date.now(), status: 'draft', registrations: 0, capacity: data.capacity || 100 } as Event
    );
  },
  getEvent: (id: string) =>
    withMockFallback(
      () => API.get<any>(`/events/${id}`).then((r) => mapEventResponse(r.data)),
      mockEvents.find((e) => e.id === id) as Event
    ),
  updateEvent: (id: string, data: Partial<Event>) => {
    const payload: any = { ...data };
    if (data.location) payload.venue = data.location;
    if (data.time) {
      payload.startTime = data.time;
      payload.endTime = data.time; // temporary fix for missing endTime
    }
    if (data.date && !data.date.includes('T')) {
      payload.date = new Date(data.date).toISOString();
    }
    if (data.imageUrl) payload.bannerImage = data.imageUrl;
    return withMockFallback(
      () => API.patch<any>(`/events/${id}`, payload).then((r) => mapEventResponse(r.data)),
      { ...(mockEvents.find((e) => e.id === id) as Event), ...data }
    );
  },
  deleteEvent: (id: string) =>
    withMockFallback(() => API.delete(`/events/${id}`).then((r) => r.data), { success: true }),
  publishEvent: (id: string) =>
    withMockFallback(
      () => API.patch<any>(`/events/${id}`, { status: 'Upcoming' }).then((r) => mapEventResponse(r.data)),
      mockEvents.find((e) => e.id === id) ?? mockEvents[0]
    ),

  // Registrations
  getRegistrations: (params: { eventId?: string; search?: string; status?: string }) =>
    withMockFallback(async () => {
      const apiParams: Record<string, string> = {};
      if (params.eventId) apiParams.event = params.eventId;
      if (params.search) apiParams.search = params.search;
      if (params.status && params.status !== 'all') apiParams.status = params.status;
      const r = await API.get('/organizer/registrations', { params: apiParams });
      const items = Array.isArray(r.data) ? r.data : [];
      return items.map(mapRegistration);
    },
      mockRegistrations.filter((r) =>
        (!params.eventId || r.eventId === params.eventId) &&
        (!params.search || r.attendeeName.toLowerCase().includes(params.search.toLowerCase()))
      ) as any
    ),
  exportRegistrations: (eventId: string) =>
    withMockFallback(() => API.get(`/organizer/registrations/export`, { params: { eventId }, responseType: 'blob' }).then((r) => r.data),
      new Blob(
        ['id,eventId,eventTitle,attendeeName,attendeeEmail,ticketCode,status\n' +
          mockRegistrations.filter((r) => !eventId || r.eventId === eventId)
            .map((r) => `${r.id},${r.eventId},${r.eventTitle},${r.attendeeName},${r.attendeeEmail},${r.ticketCode},${r.status}`)
            .join('\n')],
        { type: 'text/csv' }
      )
    ),
  checkInAttendee: (ticketCode: string) =>
    withMockFallback(
      () => API.post('/check-in', { qrToken: ticketCode }).then((r) => r.data),
      {
        id: 'reg-checked-' + Date.now(),
        eventId: '1',
        eventTitle: 'Event',
        attendeeName: 'Attendee',
        attendeeEmail: '',
        ticketCode,
        registeredAt: new Date().toISOString(),
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        status: 'confirmed',
        paymentStatus: 'free',
      } as Registration
    ),
  importRegistrations: (eventId: string, rows: { attendeeName: string; attendeeEmail: string }[]) =>
    withMockFallback(
      () => API.post<{ imported: number; registrations: Registration[] }>('/organizer/registrations/import', { eventId, rows }).then((r) => r.data),
      (() => {
        const eventTitle = mockEvents.find((e) => e.id === eventId)?.title ?? 'EVENT';
        const created: Registration[] = rows.map((row, i) => ({
          id: 'reg-import-' + Date.now() + '-' + i,
          eventId,
          eventTitle,
          attendeeName: row.attendeeName,
          attendeeEmail: row.attendeeEmail,
          ticketCode: `FFLOW-IMP-${Date.now().toString().slice(-6)}-${i}`,
          registeredAt: new Date().toISOString(),
          checkedIn: false,
          status: 'confirmed',
          paymentStatus: 'free',
        }));
        mockRegistrations.push(...created);
        return { imported: created.length, registrations: created };
      })()
    ),

  // Analytics
  getAnalytics: (params: { range: '7d' | '30d' | '90d' | 'all' }) =>
    withMockFallback(() => API.get<AnalyticsData>('/organizer/analytics', { params }).then((r) => r.data), mockAnalytics),

  // Announcements
  getAnnouncements: () =>
    withMockFallback(
      () => API.get<any[]>('/organizer/announcements').then((r) => (Array.isArray(r.data) ? r.data : []).map(mapAnnouncement)),
      mockAnnouncements
    ),
  createAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt' | 'sentAt' | 'status'>) =>
    withMockFallback(
      () =>
        API.post<any>('/organizer/announcements', {
          eventId: data.eventId,
          title: data.title,
          message: data.message,
        }).then(mapAnnouncement),
      { ...data, id: 'a-' + Date.now(), status: 'draft', createdAt: new Date().toISOString() } as Announcement
    ),
  sendAnnouncement: (id: string) =>
    withMockFallback(() => API.post<Announcement>(`/organizer/announcements/${id}/send`).then((r) => r.data),
      { id, title: 'Sent', message: '', audience: 'all', status: 'sent', createdBy: 'me', createdAt: new Date().toISOString(), sentAt: new Date().toISOString() } as Announcement
    ),
  deleteAnnouncement: (id: string) =>
    withMockFallback(() => API.delete(`/organizer/announcements/${id}`).then((r) => r.data), { success: true }),

  // Volunteers
  getEventRegistrations: (eventId: string, params?: any) =>
    withMockFallback(
      () => organizerApi.getRegistrations({ ...params, eventId }),
      mockRegistrations.filter((r) => r.eventId === eventId)
    ),
  getVolunteers: (eventId: string) =>
    withMockFallback(
      () => API.get<any[]>(`/organizer/events/${eventId}/volunteers`).then((r) => (Array.isArray(r.data) ? r.data : []).map(mapVolunteer)),
      mockVolunteers.filter((v) => v.eventId === eventId)
    ),
  inviteVolunteer: (eventId: string, data: Omit<Volunteer, 'id' | 'eventId' | 'assignedAt' | 'status'>) =>
    withMockFallback(
      () => API.post<any>(`/organizer/events/${eventId}/volunteers`, data).then(mapVolunteer),
      { ...data, id: 'v-' + Date.now(), eventId, status: 'invited', assignedAt: new Date().toISOString() } as Volunteer
    ),
  updateVolunteer: (eventId: string, id: string, data: Partial<Volunteer>) =>
    withMockFallback(
      () => API.put<any>(`/organizer/events/${eventId}/volunteers/${id}`, data).then(mapVolunteer),
      { ...(mockVolunteers.find((v) => v.id === id) ?? mockVolunteers[0]), ...data } as Volunteer
    ),
  removeVolunteer: (eventId: string, id: string) =>
    withMockFallback(() => API.delete(`/organizer/events/${eventId}/volunteers/${id}`).then((r) => r.data), { success: true }),

  // Event settings (per-event)
  getEventSettings: (eventId: string) =>
    withMockFallback(
      () => API.get<EventSettings>(`/organizer/events/${eventId}/settings`).then((r) => r.data),
      { ...mockEventSettings, eventId }
    ),
  updateEventSettings: (eventId: string, data: Partial<EventSettings>) =>
    withMockFallback(
      () => API.put<EventSettings>(`/organizer/events/${eventId}/settings`, data).then((r) => r.data),
      { ...mockEventSettings, ...data, eventId } as EventSettings
    ),

  // Organizer settings (account-level)
  getOrganizerSettings: () =>
    withMockFallback(() => API.get<OrganizerSettings>('/organizer/settings').then((r) => r.data), mockOrganizerSettings),
  updateOrganizerSettings: (data: Partial<OrganizerSettings>) =>
    withMockFallback(
      () => API.put<OrganizerSettings>('/organizer/settings', data).then((r) => r.data),
      { ...mockOrganizerSettings, ...data } as OrganizerSettings
    ),
};