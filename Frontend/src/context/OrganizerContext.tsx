import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Organizer } from '../types/organizer';
import { organizerApi } from '../services/organizerApi';
import { mapBackendRole } from '../utils/authToken';

interface OrganizerContextValue {
  organizer: Organizer | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const OrganizerContext = createContext<OrganizerContextValue | undefined>(undefined);

export const OrganizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, login: authLogin, logout: authLogout } = useAuth();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user || mapBackendRole(user.role) !== 'organizer') {
      setOrganizer(null);
      setLoading(false);
      return;
    }

    // Keep dashboard usable immediately after /login staff auth
    setOrganizer({
      id: user.id,
      name: user.name,
      email: user.email,
      organization: 'Campus Events',
      role: 'organizer',
      avatarUrl: user.photoURL,
    });

    try {
      const data = await organizerApi.getProfile();
      setOrganizer(data);
    } catch {
      // Auth session is valid — keep user-derived organizer profile
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && mapBackendRole(user.role) === 'organizer') {
      setLoading(true);
      refreshProfile();
    } else {
      setOrganizer(null);
      setLoading(false);
    }
  }, [user]);

  const login = async (_email: string, password: string) => {
    await authLogin('', password, 'organizer');
    await refreshProfile();
  };

  const logout = () => {
    setOrganizer(null);
    authLogout();
  };

  return (
    <OrganizerContext.Provider
      value={{
        organizer,
        loading,
        isAuthenticated: !!organizer,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </OrganizerContext.Provider>
  );
};

export const useOrganizerContext = () => {
  const context = useContext(OrganizerContext);
  if (!context) {
    throw new Error('useOrganizerContext must be used within OrganizerProvider');
  }
  return context;
};
