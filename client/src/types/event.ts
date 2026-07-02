export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category:
    | 'TECHNICAL' | 'CULTURAL' | 'SPORTS' | 'WORKSHOP' | 'SEMINAR'
    | 'technical' | 'cultural' | 'sports' | 'academic' | 'other';
  organizer: string;
  capacity: number;
  imageUrl?: string;
  ticketCode?: string;
  createdBy?: string;
  status?: 'draft' | 'published' | 'live' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
  revenue?: number;
  registrationsCount?: number;
  rsvps?: number;
}