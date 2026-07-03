import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize with Firebase Auth State & localStorage
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user authenticated
        // Check if there is already a custom photoURL stored locally for this user
        const savedUserRaw = localStorage.getItem('auth_user');
        let customPhotoURL = firebaseUser.photoURL || undefined;
        if (savedUserRaw) {
          try {
            const parsed = JSON.parse(savedUserRaw);
            if (parsed.id === firebaseUser.uid && parsed.photoURL) {
              customPhotoURL = parsed.photoURL;
            }
          } catch (e) {}
        }

        const loggedInUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'FestFlow Student',
          email: firebaseUser.email || '',
          role: 'student',
          photoURL: customPhotoURL || undefined
        };
        localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      } else {
        // Check if there is an organizer or volunteer logged in locally
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed.role === 'organizer' || parsed.role === 'volunteer') {
              setUser(parsed);
              setLoading(false);
              return; // Do not clear organizer or volunteer session
            }
          } catch (e) {}
        }
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      let customPhotoURL = result.user.photoURL || undefined;
      try {
        const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
        const token = await result.user.getIdToken();
        const response = await fetch(`${baseURL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data?.photoURL) {
            customPhotoURL = data.data.photoURL;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch profile from backend, checking local cache', e);
        const cached = localStorage.getItem(`auth_pfp_${result.user.email?.toLowerCase().trim()}`);
        if (cached) customPhotoURL = cached;
      }

      const loggedInUser: User = {
        id: result.user.uid,
        name: result.user.displayName || 'FestFlow Student',
        email: result.user.email || '',
        role: 'student',
        photoURL: customPhotoURL
      };
      localStorage.removeItem('organizer_token');
      localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
      const token = await result.user.getIdToken();
      localStorage.setItem('auth_token', token); // FIX: Save token for API calls
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err: any) {
      throw new Error(err.message || 'Google Auth Popup closed or failed.');
    }
  };

  const login = async (
    email: string,
    password: string,
    role: 'student' | 'organizer' | 'volunteer'
  ): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cleanEmail = email.toLowerCase().trim();

        if (role === 'student') {
          // Mock login for students
          const cachedPfp = localStorage.getItem(`auth_pfp_${cleanEmail}`);
          const loggedInUser: User = {
            id: 'student-1',
            name: 'Ayush Sinha',
            email: cleanEmail,
            role: 'student',
            photoURL: cachedPfp || undefined
          };
          localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
          localStorage.setItem('auth_token', 'valid_mock_token');
          setUser(loggedInUser);
          return resolve(loggedInUser);
        }

        if (role === 'organizer') {
          if (password !== '1292') {
            return reject(new Error('INVALID ORGANIZER PASSCODE.'));
          }

          const cachedPfp = localStorage.getItem(`auth_pfp_${cleanEmail}`);
          let customPhotoURL = cachedPfp || undefined;

          const loggedInUser: User = {
            id: 'organizer-1',
            name: 'FestFlow Organizer',
            email: cleanEmail,
            role: 'organizer',
            photoURL: customPhotoURL
          };
          localStorage.setItem('organizer_token', 'mock-organizer-token');
          localStorage.setItem('auth_token', 'mock-organizer-token');
          localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
          setUser(loggedInUser);
          return resolve(loggedInUser);
        }

        if (role === 'volunteer') {
          if (password !== '1293') {
            return reject(new Error('INVALID VOLUNTEER PASSCODE.'));
          }

          const cachedPfp = localStorage.getItem(`auth_pfp_${cleanEmail}`);
          let customPhotoURL = cachedPfp || undefined;

          const loggedInUser: User = {
            id: 'volunteer-1',
            name: 'FestFlow Volunteer',
            email: cleanEmail,
            role: 'volunteer',
            photoURL: customPhotoURL
          };
          localStorage.setItem('volunteer_authenticated', 'true');
          localStorage.setItem('auth_token', 'valid_mock_token');
          localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
          setUser(loggedInUser);
          return resolve(loggedInUser);
        }

        reject(new Error('Invalid role specified.'));
      }, 500);
    });
  };

  const updatePfp = async (base64String: string) => {
    try {
      const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
      // Need to include the auth token. Auth is handled by Firebase, so we get the ID token if available.
      // The middleware uses Bearer token
      let token = localStorage.getItem('organizer_token');
      if (!token) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          token = await currentUser.getIdToken();
        }
      }

      const response = await fetch(`${baseURL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ avatarBase64: base64String })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile picture on server');
      }

      const data = await response.json();
      const updatedUrl = data.data?.photoURL || base64String;

      setUser((prev) => {
        if (!prev) return null;
        const updated = { ...prev, photoURL: updatedUrl };
        localStorage.setItem('auth_user', JSON.stringify(updated));
        localStorage.setItem(`auth_pfp_${prev.email}`, updatedUrl);
        return updated;
      });
      return true;
    } catch (error) {
      console.error('Error updating PFP:', error);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('organizer_token');
    localStorage.removeItem('volunteer_authenticated');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signInWithGoogle, logout, updatePfp }}>
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
