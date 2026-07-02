import { Request } from 'express';

export enum Role {
  STUDENT = 'Student',
  ORGANIZER = 'Organizer',
  VOLUNTEER = 'Volunteer',
  ADMIN = 'Admin',
}

export enum RegistrationStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
}

export enum TicketStatus {
  ACTIVE = 'Active',
  USED = 'Used',
  CANCELLED = 'Cancelled',
}

// User object that will be attached to the Request
export interface AuthUser {
  _id: string; // Mongoose ObjectId as string
  uid: string; // Firebase UID
  email: string;
  role: Role;
}

// Extend Express Request
export interface AuthRequest extends Request {
  user?: AuthUser;
  requestId?: string;
}
