import { auth } from '../services/firebase';

const STAFF_TOKEN_PREFIX = 'festflow-staff-';

export function isStaffSessionToken(token: string | null | undefined): boolean {
  return !!token?.startsWith(STAFF_TOKEN_PREFIX);
}

function getStaffTokenFromSession(): string | null {
  const savedUserRaw = localStorage.getItem('auth_user');
  if (!savedUserRaw) return null;

  try {
    const savedUser = JSON.parse(savedUserRaw) as { role?: string };
    if (savedUser.role === 'organizer' || savedUser.role === 'volunteer') {
      return `${STAFF_TOKEN_PREFIX}${savedUser.role}`;
    }
  } catch {
    // ignore invalid JSON
  }

  return null;
}

/** Returns the auth token for API calls (staff session or Firebase). */
export async function getAuthToken(): Promise<string | null> {
  const staffToken = getStaffTokenFromSession();
  if (staffToken) {
    localStorage.setItem('auth_token', staffToken);
    return staffToken;
  }

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
