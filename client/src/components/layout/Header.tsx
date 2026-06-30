
interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentTab: 'dashboard' | 'tickets' | 'scanner';
  setCurrentTab: (tab: 'dashboard' | 'tickets' | 'scanner') => void;
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
  return (
    <header className="flex justify-between items-center px-6 md:px-margin-desktop py-4 w-full bg-surface border-b-4 border-on-background sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="font-headline-md text-headline-md font-bold text-on-background md:hidden flex items-center gap-1">
          <span className="material-symbols-outlined text-primary">electric_bolt</span> FestFlow
        </h2>
        <div className="hidden md:flex bg-white border-4 border-on-background px-4 py-2 w-96 items-center gap-3 neo-shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, locations..." 
            className="bg-transparent border-none outline-none flex-grow font-body-md focus:ring-0 focus:border-transparent text-on-surface p-0"
          />
          <span className="text-on-surface-variant font-label-bold text-xs">Search</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-6 mr-6">
          <button 
            onClick={() => { setCurrentTab('dashboard'); setSelectedEvent(null); }}
            className={`font-bold py-1 ${currentTab === 'dashboard' && !selectedEvent ? 'text-primary border-b-4 border-primary' : 'text-on-surface-variant font-label-bold hover:text-primary'}`}
          >
            Discover
          </button>
          <button 
            onClick={() => setCurrentTab('tickets')}
            className={`font-bold py-1 ${currentTab === 'tickets' ? 'text-primary border-b-4 border-primary' : 'text-on-surface-variant font-label-bold hover:text-primary'}`}
          >
            Tickets
          </button>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
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
