
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentTab: 'dashboard' | 'events' | 'tickets';
  setCurrentTab: (tab: 'dashboard' | 'events' | 'tickets') => void;
  selectedEvent: any;
  setSelectedEvent: (event: any) => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  currentTab,
  setCurrentTab,
  selectedEvent,
  setSelectedEvent
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center px-6 md:px-margin-desktop py-4 w-full bg-[#a6f2cf] border-b-4 border-on-background sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="font-headline-md text-headline-md font-bold text-on-background md:hidden flex items-center gap-1">
          <span className="material-symbols-outlined text-primary">electric_bolt</span> FestFlow
        </h2>
        <div className="hidden md:flex bg-white border-4 border-on-background px-4 py-2 w-96 items-center gap-3 neo-shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentTab !== 'events' && e.target.value.trim() !== '') {
                setCurrentTab('events');
                setSelectedEvent(null);
              }
            }}
            placeholder="Search events, locations..." 
            className="bg-transparent border-none outline-none flex-grow font-body-md focus:ring-0 focus:border-transparent text-on-surface p-0"
          />
          <span className="text-on-surface-variant font-label-bold text-xs">Search</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4 mr-6">
          <button 
            onClick={() => { setCurrentTab('dashboard'); setSelectedEvent(null); }}
            className={`px-4 py-2 border-4 transition-all uppercase text-xs font-label-bold ${currentTab === 'dashboard' && !selectedEvent ? 'bg-[#ffe24c] text-on-background border-on-background neo-shadow-sm font-bold' : 'bg-white text-on-background border-on-background hover:bg-[#ffe24c] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => { setCurrentTab('events'); setSelectedEvent(null); }}
            className={`px-4 py-2 border-4 transition-all uppercase text-xs font-label-bold ${currentTab === 'events' && !selectedEvent ? 'bg-[#ffe24c] text-on-background border-on-background neo-shadow-sm font-bold' : 'bg-white text-on-background border-on-background hover:bg-[#ffe24c] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
          >
            Events
          </button>
          <button 
            onClick={() => { setCurrentTab('tickets'); setSelectedEvent(null); }}
            className={`px-4 py-2 border-4 transition-all uppercase text-xs font-label-bold ${currentTab === 'tickets' ? 'bg-[#ffe24c] text-on-background border-on-background neo-shadow-sm font-bold' : 'bg-white text-on-background border-on-background hover:bg-[#ffe24c] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
          >
            Tickets
          </button>
          <button 
            onClick={() => { navigate('/organizer/dashboard'); }}
            className="px-4 py-2 border-4 transition-all uppercase text-xs font-label-bold bg-[#ffe5ec] text-on-background border-on-background hover:bg-[#ffb3c1] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Organizer Panel
          </button>
          <button 
            onClick={() => { navigate('/volunteer'); }}
            className="px-4 py-2 border-4 transition-all uppercase text-xs font-label-bold bg-[#fff4cc] text-on-background border-on-background hover:bg-[#ffe066] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Volunteer Panel
          </button>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => navigate('/organizer/dashboard')}
            className="md:hidden flex items-center justify-center w-10 h-10 border-4 border-on-background bg-[#ffe5ec] hover:bg-[#ffb3c1] active:translate-y-[2px]"
            title="Organizer Panel"
          >
            <span className="material-symbols-outlined font-bold">corporate_fare</span>
          </button>
          <button 
            onClick={() => navigate('/volunteer')}
            className="md:hidden flex items-center justify-center w-10 h-10 border-4 border-on-background bg-[#fff4cc] hover:bg-[#ffe066] active:translate-y-[2px]"
            title="Volunteer Panel"
          >
            <span className="material-symbols-outlined font-bold">badge</span>
          </button>
          
          <div className="w-10 h-10 border-4 border-on-background bg-secondary-container overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
              alt="User Avatar"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
