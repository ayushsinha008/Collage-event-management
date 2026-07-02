import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, LogOut, Search } from 'lucide-react';
import { useOrganizerContext } from '../../../context/OrganizerContext';

export const OrganizerTopbar: React.FC = () => {
  const { organizer, logout } = useOrganizerContext();
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';

  return (
    <header className="h-16 bg-surface border-b-4 border-on-background flex items-center justify-between px-6 gap-4 sticky top-0 z-10">
      <div className="flex-1 max-w-md">
        <div className="flex items-center border-4 border-on-background bg-background neo-shadow-sm focus-within:neo-shadow transition-shadow">
          <div className="pl-3 py-2 bg-background border-r-4 border-on-background">
            <Search className="w-4 h-4 stroke-[3]" />
          </div>
          <input
            value={search}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set('q', e.target.value);
              else next.delete('q');
              setParams(next, { replace: true });
            }}
            placeholder="SEARCH EVENTS..."
            className="flex-1 px-4 py-2 font-label-bold text-sm bg-transparent focus:outline-none uppercase placeholder-on-surface-variant"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 hover:bg-surface-variant border-2 border-transparent hover:border-on-background transition-all hover:-translate-y-0.5 hover:neo-shadow-sm">
          <Bell className="w-5 h-5 stroke-[2.5]" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] border-2 border-on-background rounded-full" />
        </button>

        {organizer && (
          <div className="flex items-center gap-4 border-l-4 border-on-background pl-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-label-bold uppercase tracking-wide">{organizer.name}</p>
              <p className="text-xs font-label-bold text-primary">{organizer.organization}</p>
            </div>
            <img
              src={organizer.avatarUrl || 'https://i.pravatar.cc/100'}
              alt={organizer.name}
              className="w-10 h-10 rounded-full border-4 border-on-background object-cover bg-primary-container"
            />
            <button
              onClick={logout}
              title="Logout"
              className="p-2 ml-2 bg-error-container hover:bg-error hover:text-on-error border-2 border-on-background transition-all hover-lift neo-shadow-sm"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};