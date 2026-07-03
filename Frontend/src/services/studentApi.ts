import axios from 'axios';
import { getAuthToken } from '../utils/authToken';
import { Event } from '../types/event';
import { API_BASE_URL } from '../config/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const unwrap = <T>(data: any): T => {
  if (data?.success && data.data !== undefined) return data.data;
  return data;
};

export const mapBackendEvent = (e: any): Event => ({
  id: e._id || e.id,
  title: e.title,
  description: e.description,
  date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  time: e.startTime || e.time,
  location: e.venue || e.location,
  category: e.category,
  organizer: e.organizer?.name || e.organizer || 'Unknown',
  capacity: e.capacity,
  imageUrl: e.bannerImage || e.imageUrl,
  registrationsCount: e.registrationCount ?? e.registrationsCount ?? 0,
  rsvps: e.registrationCount ?? e.registrationsCount ?? 0,
  checkedInCount: e.checkedInCount ?? 0,
});

export const studentApi = {
  getEvents: async (): Promise<Event[]> => {
    const parseEvents = (data: any) => {
      const payload = unwrap<{ events?: any[]; total?: number } | any[]>(data);
      const events = Array.isArray(payload) ? payload : payload.events || [];
      return events.map(mapBackendEvent);
    };

    try {
      const { data } = await API.get('/events');
      return parseEvents(data);
    } catch (err) {
      // Public endpoint — retry without auth if token/session caused the failure
      const { data } = await axios.get(`${API_BASE_URL}/events`);
      return parseEvents(data);
    }
  },

  getMyTickets: async () => {
    const { data } = await API.get('/users/me/tickets');
    const payload = unwrap<any[] | { tickets: any[] }>(data);
    const tickets = Array.isArray(payload) ? payload : payload.tickets || [];
    console.log('FRONTEND FETCHED TICKETS:', tickets);
    return tickets;
  },

  registerForEvent: async (eventId: string) => {
    const { data } = await API.post(`/events/${eventId}/register`);
    return unwrap<{ registration: any; ticket: any; qrCode: string }>(data);
  },

  cancelRegistration: async (eventId: string) => {
    const { data } = await API.delete(`/events/${eventId}/cancel`);
    return unwrap(data);
  },

  getProfile: async () => {
    const { data } = await API.get('/users/profile');
    return unwrap<any>(data);
  },

  updateProfile: async (payload: { avatarBase64?: string; name?: string }) => {
    const { data } = await API.patch('/users/profile', payload);
    return unwrap<any>(data);
  },

  verifyStaffRole: async (passcode: string, role: 'organizer' | 'volunteer') => {
    const { data } = await API.post('/auth/verify-role', { passcode, role });
    return unwrap<any>(data);
  },

  staffLogin: async (passcode: string, role: 'organizer' | 'volunteer') => {
    const { data } = await axios.post(`${API_BASE_URL}/auth/staff-login`, { passcode, role });
    return unwrap<{ customToken: string; user: any }>(data);
  },
};
