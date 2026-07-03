import { auth } from '../services/firebase';

const STAFF_TOKEN_PREFIX = 'festflow-staff-';

export function isStaffSessionToken(token: string | null | undefined): boolean {
  return !!token?.startsWith(STAFF_TOKEN_PREFIX);
}

/** Returns the auth token for API calls (staff session or Firebase). */
export async function getAuthToken(): Promise<string | null> {
  const stored = localStorage.getItem('auth_token');

  if (isStaffSessionToken(stored)) {
    return stored;
  }

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      localStorage.setItem('auth_token', token);
      return token;
    } catch {
      return stored;
    }
  }

  return stored;
}

export function mapBackendRole(role: string): 'student' | 'organizer' | 'volunteer' {
  const normalized = role.toLowerCase();
  if (normalized === 'organizer' || normalized === 'admin') return 'organizer';
  if (normalized === 'volunteer') return 'volunteer';
  return 'student';
}
