import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarRange,
  Users,
  BarChart3,
  Megaphone,
  UserCircle,
  Plus,
  Zap,
  Settings,
  ClipboardList,
} from 'lucide-react';

const navItems = [
  { to: '/organizer/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/organizer/events',        label: 'My Events',     icon: CalendarRange },
  { to: '/organizer/registrations', label: 'Registrations', icon: Users },
  { to: '/organizer/analytics',     label: 'Analytics',     icon: BarChart3 },
  { to: '/organizer/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/organizer/settings',      label: 'Settings',      icon: Settings },
  { to: '/organizer/profile',       label: 'Profile',       icon: UserCircle },
];

interface Props {
  onClose?: () => void;
}

export const OrganizerSidebar: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 min-h-screen bg-surface flex flex-col border-r-4 border-on-background z-20">
      {/* Logo */}
      <div className="p-5 border-b-4 border-on-background bg-primary text-on-primary">
        <div className="flex items-center gap-2">
          <Zap className="w-8 h-8 text-tertiary-fixed fill-tertiary-fixed drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" />
          <span className="text-2xl font-extrabold tracking-tight" style={{ textShadow: '2px 2px 0 #000' }}>FESTFLOW</span>
        </div>
        <p className="text-sm font-label-bold mt-1 uppercase tracking-widest text-primary-fixed">
          Organizer
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-3 bg-surface">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 border-2 border-on-background font-label-bold transition-all ${
                isActive
                  ? 'bg-tertiary-fixed text-on-background neo-shadow-sm translate-x-1 -translate-y-1'
                  : 'bg-surface text-on-surface hover:bg-surface-variant hover:-translate-y-1 hover:neo-shadow-sm'
              }`
            }
          >
            <Icon className="w-5 h-5 stroke-[2.5]" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Create Event CTA */}
      <div className="p-5 border-t-4 border-on-background bg-surface-container">
        <button
          onClick={() => navigate('/organizer/events/new')}
          className="w-full bg-tertiary-fixed hover:bg-tertiary text-on-background font-label-bold py-3 px-4 border-4 border-on-background neo-shadow-sm hover-lift flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 stroke-[3]" /> NEW EVENT
        </button>
        <button
          onClick={() => navigate('/organizer/events')}
          className="mt-3 w-full bg-surface border-4 border-on-background hover:bg-surface-variant font-label-bold py-2 px-4 flex items-center justify-center gap-2"
        >
          <ClipboardList className="w-4 h-4 stroke-[3]" /> MANAGE ALL
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-label-bold text-on-surface-variant">
          <span className="w-3 h-3 bg-[#a6f2cf] border-2 border-on-background rounded-full" />
          SYSTEM: ONLINE
        </div>
      </div>
    </aside>
  );
};