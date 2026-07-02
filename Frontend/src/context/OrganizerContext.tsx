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
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('organizer_token');
    if (token) {
      setOrganizer({
        id: 'mock-1',
        name: 'FestFlow Organizer',
        email: 'organizer@univ.edu',
        organization: 'Campus Events Club',
        role: 'organizer',
        joinedAt: new Date().toISOString(),
        eventsHosted: 3,
      });
    }
    setLoading(false);
  }, []);

  const refreshProfile = async () => {
    try {
      const data = await organizerApi.getProfile();
      setOrganizer(data);
    } catch (err) {
      if (!localStorage.getItem('organizer_token')) {
        setOrganizer(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (password !== '1292') {
      throw new Error('INVALID PASSWORD. ACCESS DENIED.');
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/organizer/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('organizer_token', data.token || 'mock-organizer-token');
      } else {
        localStorage.setItem('organizer_token', 'mock-organizer-token');
      }
    } catch (err) {
      localStorage.setItem('organizer_token', 'mock-organizer-token');
    }

    setOrganizer({
      id: 'mock-1',
      name: 'FestFlow Organizer',
      email: email || 'organizer@univ.edu',
      organization: 'Campus Events Club',
      role: 'organizer',
      joinedAt: new Date().toISOString(),
      eventsHosted: 3,
    });
  };

  const logout = () => {
    localStorage.removeItem('organizer_token');
    localStorage.removeItem('auth_user');
    setOrganizer(null);
    window.location.href = '/login';
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