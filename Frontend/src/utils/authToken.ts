import { auth } from '../services/firebase';

/** Returns a fresh Firebase ID token for API calls. */
export async function getAuthToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken(true);
    localStorage.setItem('auth_token', token);
    return token;
  }
  return localStorage.getItem('auth_token');
}

export function mapBackendRole(role: string): 'student' | 'organizer' | 'volunteer' {
  const normalized = role.toLowerCase();
  if (normalized === 'organizer' || normalized === 'admin') return 'organizer';
  if (normalized === 'volunteer') return 'volunteer';
  return 'student';
}
