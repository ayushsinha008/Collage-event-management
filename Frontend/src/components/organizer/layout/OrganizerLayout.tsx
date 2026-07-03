import React from 'react';
import { NavLink } from 'react-router-dom';
import { OrganizerSidebar } from './OrganizerSidebar';
import { OrganizerTopbar } from './OrganizerTopbar';

const bottomNav = [
  { to: 'dashboard',     icon: 'space_dashboard', label: 'Home' },
  { to: 'events',        icon: 'event',           label: 'Events' },
  { to: 'registrations', icon: 'groups',          label: 'Guests' },
  { to: 'analytics',     icon: 'analytics',       label: 'Stats' },
  { to: 'profile',       icon: 'person',          label: 'Profile' },
];

export const OrganizerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen overflow-x-hidden font-body-md text-body-md bg-background text-on-background">
      <OrganizerSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-background pb-16 md:pb-0">
        <OrganizerTopbar />
        <main className="flex-1 p-6 md:p-margin-desktop overflow-y-auto">
          {children}
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t-4 border-on-background flex justify-around items-center py-3 z-40">
          {bottomNav.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={`/organizer/${to}`}
              end={to === 'dashboard'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`
              }
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="text-[10px] font-label-bold uppercase">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};