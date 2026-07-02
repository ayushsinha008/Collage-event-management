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
  updatePfp: (url: string) => void;
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
      const loggedInUser: User = {
        id: result.user.uid,
        name: result.user.displayName || 'FestFlow Student',
        email: result.user.email || '',
        role: 'student',
        photoURL: result.user.photoURL || undefined
      };
      localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
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
          return reject(new Error('Please use Google Sign-In for Student access.'));
        }

        if (role === 'organizer') {
          if (password !== '1292') {
            return reject(new Error('INVALID ORGANIZER PASSCODE.'));
          }

          // Check if there is a cached custom PFP for the organizer
          const savedUserRaw = localStorage.getItem('auth_user');
          let customPhotoURL = undefined;
          if (savedUserRaw) {
            try {
              const parsed = JSON.parse(savedUserRaw);
              if (parsed.role === 'organizer' && parsed.photoURL) {
                customPhotoURL = parsed.photoURL;
              }
            } catch (e) {}
          }

          const loggedInUser: User = {
            id: 'organizer-1',
            name: 'FestFlow Organizer',
            email: cleanEmail,
            role: 'organizer',
            photoURL: customPhotoURL
          };
          localStorage.setItem('organizer_token', 'mock-organizer-token');
          localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
          setUser(loggedInUser);
          return resolve(loggedInUser);
        }

        if (role === 'volunteer') {
          if (password !== '1293') {
            return reject(new Error('INVALID VOLUNTEER PASSCODE.'));
          }

          // Check if there is a cached custom PFP for the volunteer
          const savedUserRaw = localStorage.getItem('auth_user');
          let customPhotoURL = undefined;
          if (savedUserRaw) {
            try {
              const parsed = JSON.parse(savedUserRaw);
              if (parsed.role === 'volunteer' && parsed.photoURL) {
                customPhotoURL = parsed.photoURL;
              }
            } catch (e) {}
          }

          const loggedInUser: User = {
            id: 'volunteer-1',
            name: 'FestFlow Volunteer',
            email: cleanEmail,
            role: 'volunteer',
            photoURL: customPhotoURL
          };
          localStorage.setItem('volunteer_authenticated', 'true');
          localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
          setUser(loggedInUser);
          return resolve(loggedInUser);
        }

        reject(new Error('Invalid role specified.'));
      }, 500);
    });
  };

  const updatePfp = (url: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, photoURL: url };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('auth_user');
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
