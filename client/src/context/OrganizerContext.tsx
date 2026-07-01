import React, { createContext, useContext, useEffect, useState } from 'react';
import { Organizer } from '../types/organizer';
import { organizerApi } from '../services/organizerApi';

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
  const [organizer, setOrganizer] = useState<Organizer | null>({
    id: 'mock-1',
    name: 'Test Organizer',
    email: 'organizer@test.com',
    organization: 'Demo Club',
    role: 'organizer',
    joinedAt: new Date().toISOString(),
    eventsHosted: 3,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auth check disabled temporarily for local UI testing
  }, []);

  const refreshProfile = async () => {
    try {
      const data = await organizerApi.getProfile();
      setOrganizer(data);
    } catch (err) {
      localStorage.removeItem('organizer_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/organizer/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem('organizer_token', data.token);
    await refreshProfile();
  };

  const logout = () => {
    localStorage.removeItem('organizer_token');
    setOrganizer(null);
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
  const ctx = useContext(OrganizerContext);
  if (!ctx) throw new Error('useOrganizerContext must be used inside OrganizerProvider');
  return ctx;
};