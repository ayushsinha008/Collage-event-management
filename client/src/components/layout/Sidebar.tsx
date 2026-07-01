import { LayoutDashboard, QrCode, FileText } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'scanner';
  setCurrentTab: (tab: 'dashboard' | 'scanner') => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab
}: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 h-screen bg-black text-white flex-col py-8 px-4 sticky top-0 z-40">
      {/* Brand logo area */}
      <div className="px-3 mb-10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-orange-500 border-2 border-white flex items-center justify-center font-bold text-white text-base">
          ⚡
        </div>
        <div>
          <h1 className="font-headline text-lg font-black uppercase tracking-tight text-white leading-none">
            FestFlow
          </h1>
          <span className="text-[9px] font-extrabold text-orange-500 uppercase tracking-widest mt-0.5 block">
            Volunteer Node
          </span>
        </div>
      </div>

      {/* Sidebar nav items - styled like Tiger Park sidebar */}
      <nav className="flex-grow space-y-2 px-1">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all text-left border-2 ${
            currentTab === 'dashboard'
              ? 'bg-white text-black border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentTab('scanner')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all text-left border-2 ${
            currentTab === 'scanner'
              ? 'bg-white text-black border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <QrCode className="w-4 h-4 shrink-0" />
          <span>Check-in Scanner</span>
        </button>
      </nav>

      {/* Done for the day? / Send daily report & profile section at the bottom */}
      <div className="mt-auto space-y-6 pt-4 border-t border-slate-900">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Done for the day?</p>
          <button 
            onClick={() => alert('Daily check-in report exported and synced!')}
            className="w-full bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            Send daily report
          </button>
        </div>

        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-800">
            <img 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
              alt="Volunteer"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Ayush Sinha</p>
            <p className="text-[9px] text-slate-500 font-semibold uppercase">Lead Access Staff</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
