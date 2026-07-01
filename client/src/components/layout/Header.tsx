
interface HeaderProps {
  currentTab: 'dashboard' | 'scanner';
  setCurrentTab: (tab: 'dashboard' | 'scanner') => void;
}

export default function Header({
  currentTab,
  setCurrentTab
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center px-6 md:px-margin-desktop py-4 w-full bg-white border-b-4 border-black sticky top-0 z-35">
      <div className="flex items-center gap-4">
        {/* Mobile Logo */}
        <h2 className="font-headline text-xl font-black text-black md:hidden flex items-center gap-1.5 uppercase tracking-tight">
          <span className="w-8 h-8 rounded-lg bg-orange-500 border-2 border-black flex items-center justify-center text-white text-xs">⚡</span>
          FestFlow
        </h2>
        
        {/* Breadcrumb / Title */}
        <div className="hidden md:flex flex-col">
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">Active Workspace</span>
          <h2 className="text-sm font-black text-black uppercase tracking-wide">
            {currentTab === 'dashboard' ? 'Volunteer Operations Dashboard' : 'Ticket Check-in Scanner'}
          </h2>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-6 mr-4">
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`font-black py-1 text-xs uppercase tracking-wider transition-all border-b-2 ${
              currentTab === 'dashboard' 
                ? 'text-orange-600 border-orange-600' 
                : 'text-black/60 border-transparent hover:text-black'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentTab('scanner')}
            className={`font-black py-1 text-xs uppercase tracking-wider transition-all border-b-2 ${
              currentTab === 'scanner' 
                ? 'text-orange-600 border-orange-600' 
                : 'text-black/60 border-transparent hover:text-black'
            }`}
          >
            Scanner
          </button>
        </div>
        
        {/* Volunteer Info badge */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-black">Ayush Sinha</p>
            <p className="text-[9px] font-extrabold text-orange-500 uppercase tracking-wider">Lead Access Staff</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-yellow-300 border-2 border-black p-0.5 overflow-hidden">
            <img 
              className="w-full h-full object-cover rounded-full" 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
              alt="Volunteer Avatar"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
