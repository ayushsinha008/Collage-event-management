
interface SidebarProps {
  currentTab: 'dashboard' | 'tickets' | 'scanner';
  setCurrentTab: (tab: 'dashboard' | 'tickets' | 'scanner') => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedEvent: (event: any) => void;
  setIsHostModalOpen: (open: boolean) => void;
  error: string | null;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  setSelectedCategory,
  setSelectedEvent,
  setIsHostModalOpen,
  error
}: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 h-screen border-r-4 border-on-background bg-on-background flex-col py-8 sticky top-0 z-50">
      <div className="px-6 mb-12">
        <h1 className="font-headline-lg text-headline-lg font-bold text-primary-fixed uppercase tracking-tighter flex items-center gap-1.5 text-[#a6f2cf]">
          <span className="material-symbols-outlined text-3xl">electric_bolt</span> FestFlow
        </h1>
        <p className="font-label-bold text-label-bold text-[#8bd6b4]/70">Admin & Student Console</p>
      </div>
      
      <nav className="flex-grow space-y-2">
        <button 
          onClick={() => { setCurrentTab('dashboard'); setSelectedEvent(null); }}
          className={`w-[calc(100%-16px)] m-2 flex items-center gap-3 px-4 py-3 rounded-none border-4 transition-all text-left ${
            currentTab === 'dashboard'
              ? 'bg-tertiary text-on-tertiary border-on-background active-tab-shadow'
              : 'text-[#e2e2e2] border-transparent hover:text-white hover:translate-x-1'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-bold text-label-bold">Dashboard</span>
        </button>
        
        <button 
          onClick={() => { setCurrentTab('dashboard'); setSelectedCategory('all'); setSelectedEvent(null); }}
          className={`w-[calc(100%-16px)] m-2 flex items-center gap-3 px-4 py-3 rounded-none border-4 transition-all text-left ${
            currentTab === 'dashboard' && !error
              ? 'text-[#e2e2e2] border-transparent hover:text-white'
              : 'text-[#e2e2e2] border-transparent hover:text-white hover:translate-x-1'
          }`}
        >
          <span className="material-symbols-outlined">event</span>
          <span className="font-label-bold text-label-bold">Events</span>
        </button>
        
        <button 
          onClick={() => { setCurrentTab('tickets'); setSelectedEvent(null); }}
          className={`w-[calc(100%-16px)] m-2 flex items-center gap-3 px-4 py-3 rounded-none border-4 transition-all text-left ${
            currentTab === 'tickets'
              ? 'bg-tertiary text-on-tertiary border-on-background active-tab-shadow'
              : 'text-[#e2e2e2] border-transparent hover:text-white hover:translate-x-1'
          }`}
        >
          <span className="material-symbols-outlined">confirmation_number</span>
          <span className="font-label-bold text-label-bold">My Tickets</span>
        </button>
        
        <button 
          onClick={() => { setCurrentTab('scanner'); setSelectedEvent(null); }}
          className={`w-[calc(100%-16px)] m-2 flex items-center gap-3 px-4 py-3 rounded-none border-4 transition-all text-left ${
            currentTab === 'scanner'
              ? 'bg-tertiary text-on-tertiary border-on-background active-tab-shadow'
              : 'text-[#e2e2e2] border-transparent hover:text-white hover:translate-x-1'
          }`}
        >
          <span className="material-symbols-outlined">qr_code_scanner</span>
          <span className="font-label-bold text-label-bold">Live Scanner</span>
        </button>
      </nav>

      <div className="px-4 mt-auto">
        <button 
          onClick={() => setIsHostModalOpen(true)}
          className="w-full bg-[#a7f3d0] text-[#247156] border-4 border-on-background neo-shadow-sm font-label-bold text-label-bold py-3 mb-6 press-down hover-lift flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          New Event
        </button>
        
        <div className="border-t-2 border-slate-700/50 pt-4 flex flex-col gap-2">
          <span className="text-[#bec9c2] text-xs px-4">Status: {error ? 'Offline (Mock)' : 'Online'}</span>
        </div>
      </div>
    </aside>
  );
}
