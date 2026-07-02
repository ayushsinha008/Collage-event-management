

import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: 'dashboard' | 'events' | 'tickets';
  setCurrentTab: (tab: 'dashboard' | 'events' | 'tickets') => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedEvent: (event: any) => void;
  error: string | null;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  setSelectedCategory,
  setSelectedEvent,
  error
}: SidebarProps) {

  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 h-screen border-r-4 border-on-background bg-[#e5deff] flex-col py-8 sticky top-0 z-50 overflow-y-auto">
      <div className="px-6 mb-12">
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-background uppercase tracking-tighter flex items-center gap-1.5">
          <span className="material-symbols-outlined text-3xl text-primary">electric_bolt</span> FestFlow
        </h1>
        <p className="font-label-bold text-label-bold text-slate-700">Student Panel</p>
      </div>

      <nav className="flex-grow space-y-2">
        <button
          onClick={() => { setCurrentTab('dashboard'); setSelectedEvent(null); }}
          className={`w-[calc(100%-16px)] m-2 flex items-center gap-3 px-4 py-3 rounded-none border-4 transition-all text-left ${currentTab === 'dashboard'
              ? 'bg-[#ffe24c] text-on-background border-on-background active-tab-shadow font-bold'
              : 'text-on-background border-transparent hover:bg-white/50 hover:translate-x-1'
            }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-bold text-label-bold">Dashboard</span>
        </button>

        <button
          onClick={() => { setCurrentTab('events'); setSelectedCategory('all'); setSelectedEvent(null); }}
          className={`w-[calc(100%-16px)] m-2 flex items-center gap-3 px-4 py-3 rounded-none border-4 transition-all text-left ${currentTab === 'events'
              ? 'bg-[#ffe24c] text-on-background border-on-background active-tab-shadow font-bold'
              : 'text-on-background border-transparent hover:bg-white/50 hover:translate-x-1'
            }`}
        >
          <span className="material-symbols-outlined">event</span>
          <span className="font-label-bold text-label-bold">Events</span>
        </button>

        <button
          onClick={() => { setCurrentTab('tickets'); setSelectedEvent(null); }}
          className={`w-[calc(100%-16px)] m-2 flex items-center gap-3 px-4 py-3 rounded-none border-4 transition-all text-left ${currentTab === 'tickets'
              ? 'bg-[#ffe24c] text-on-background border-on-background active-tab-shadow font-bold'
              : 'text-on-background border-transparent hover:bg-white/50 hover:translate-x-1'
            }`}
        >
          <span className="material-symbols-outlined">confirmation_number</span>
          <span className="font-label-bold text-label-bold">My Tickets</span>
        </button>


      </nav>

      <div className="px-4 mt-auto space-y-4">
        {user && (
          <div className="border-t-4 border-on-background pt-4 flex flex-col gap-1 px-2">
            <p className="font-label-bold text-[9px] text-[#1b6b4f] uppercase tracking-widest font-black">{user.role}</p>
            <p className="font-bold text-sm text-on-background truncate">{user.name}</p>
            <p className="text-[10px] text-slate-700 truncate">{user.email}</p>
            
            <button
              onClick={logout}
              className="mt-3 w-full bg-[#ffe5ec] hover:bg-[#ffccd5] border-2 border-on-background py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 neo-shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
            >
              <span className="material-symbols-outlined text-sm text-error">logout</span>
              Sign Out
            </button>
          </div>
        )}
        <div className="border-t-2 border-slate-700/20 pt-4 flex flex-col gap-2">
          <span className="text-slate-700 text-xs px-4">Status: {error ? 'Offline (Mock)' : 'Online'}</span>
        </div>
      </div>
    </aside>
  );
}

