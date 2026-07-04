import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth';
import { studentApi } from '../services/studentApi';
import { mapBackendRole } from '../utils/authToken';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer' | 'volunteer';
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: 'student' | 'organizer' | 'volunteer') => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  updatePfp: (url: string) => Promise<boolean>;
  upgradeUserRole: (passcode: string, role: 'organizer' | 'volunteer') => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STAFF_PASSWORDS = {
  organizer: '1292',
  volunteer: '1293',
} as const;

const buildUserFromProfile = (profile: any, firebaseUid: string): User => ({
  id: profile._id || firebaseUid,
  name: profile.name || 'FestFlow User',
  email: profile.email || '',
  role: mapBackendRole(profile.role || 'Student'),
  photoURL: profile.photoURL || undefined,
});

const buildLocalStaffUser = (role: 'organizer' | 'volunteer'): User => ({
  id: role === 'organizer' ? 'organizer-1' : 'volunteer-1',
  name: role === 'organizer' ? 'FestFlow Organizer' : 'FestFlow Volunteer',
  email: `${role}@univ.edu`,
  role,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserFromBackend = useCallback(async (firebaseUid: string): Promise<User | null> => {
    try {
      const profile = await studentApi.getProfile();
      const loggedInUser = buildUserFromProfile(profile, firebaseUid);
      localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      console.error('Failed to sync user profile from backend:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadingTimeout = window.setTimeout(() => {
      setLoading(false);
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const savedUserRaw = localStorage.getItem('auth_user');
      let savedUser: User | null = null;
      if (savedUserRaw) {
        try {
          savedUser = JSON.parse(savedUserRaw) as User;
        } catch {
          savedUser = null;
        }
      }

      const isStaffSession =
        savedUser?.role === 'organizer' || savedUser?.role === 'volunteer';

      if (firebaseUser && !isStaffSession) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('auth_token', token);

        const profile = await syncUserFromBackend(firebaseUser.uid);
        if (!profile) {
          const saved = localStorage.getItem('auth_user');
          if (saved) {
            try {
              setUser(JSON.parse(saved));
            } catch {
              setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'FestFlow User',
                email: firebaseUser.email || '',
                role: 'student',
                photoURL: firebaseUser.photoURL || undefined,
              });
            }
          }
        }
      } else if (isStaffSession && savedUser) {
        setUser(savedUser);
      } else {
        const saved = localStorage.getItem('auth_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as User;
            if (parsed.role === 'organizer' || parsed.role === 'volunteer') {
              setUser(parsed);
              setLoading(false);
              return;
            }
          } catch {
            // ignore
          }
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      window.clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [syncUserFromBackend]);

  const signInWithGoogle = async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      localStorage.setItem('auth_token', token);

      const profile = await studentApi.getProfile();
      const loggedInUser = buildUserFromProfile(profile, result.user.uid);
      localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.message?.includes('popup') || err.message?.includes('blocked')) {
        console.warn('Google Sign-In Popup blocked. Falling back to Redirect method...');
        await signInWithRedirect(auth, googleProvider);
        return new Promise(() => {}); // Return non-resolving promise as page is redirecting
      }
      throw err;
    }
  };

  const completeStaffSession = async (profile: any, role: 'organizer' | 'volunteer') => {
    try {
      await signOut(auth);
    } catch {
      // ignore if no firebase session
    }

    const staffToken = `festflow-staff-${role}`;
    const loggedInUser = profile?.uid
      ? buildUserFromProfile(profile, profile.uid)
      : buildLocalStaffUser(role);

    localStorage.setItem('auth_token', staffToken);
    localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const staffLogin = async (
    passcode: string,
    role: 'organizer' | 'volunteer'
  ): Promise<User> => {
    try {
      const { user: profile } = await studentApi.staffLogin(passcode, role);
      return await completeStaffSession(profile, role);
    } catch (err) {
      console.warn('Staff login via API failed, using local session.', err);
      return await completeStaffSession(null, role);
    }
  };

  const login = async (
    _email: string,
    password: string,
    role: 'student' | 'organizer' | 'volunteer'
  ): Promise<User> => {
    if (role === 'student') {
      throw new Error('Students must sign in with Google.');
    }

    if (password !== STAFF_PASSWORDS[role]) {
      throw new Error(`INVALID ${role.toUpperCase()} PASSCODE.`);
    }

    return staffLogin(password, role);
  };

  const updatePfp = async (base64String: string) => {
    try {
      const profile = await studentApi.updateProfile({ avatarBase64: base64String });
      setUser((prev) => {
        if (!prev) return null;
        const updated = { ...prev, photoURL: profile.photoURL };
        localStorage.setItem('auth_user', JSON.stringify(updated));
        return updated;
      });
      return true;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      return false;
    }
  };

  const upgradeUserRole = async (passcode: string, role: 'organizer' | 'volunteer'): Promise<User> => {
    await studentApi.verifyStaffRole(passcode, role);
    const firebaseUid = auth.currentUser?.uid;
    if (!firebaseUid) throw new Error('No active authentication session.');
    const profile = await syncUserFromBackend(firebaseUid);
    if (!profile) throw new Error('Failed to synchronize user session.');
    return profile;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signInWithGoogle, logout, updatePfp, upgradeUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
