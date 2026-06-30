export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer' | 'admin';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  capacity: number;
  rsvps: number;
  imageUrl: string;
  category: 'academic' | 'sports' | 'cultural' | 'technical' | 'other';
}
