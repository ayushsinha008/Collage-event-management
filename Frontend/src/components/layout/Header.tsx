

import { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

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

  const { user, logout, updatePfp } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const defaultPfp = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await updatePfp(base64String);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

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
            }}
            placeholder="Search events, locations..."
            className="bg-transparent border-none outline-none flex-grow font-body-md focus:ring-0 focus:border-transparent text-on-surface p-0"
          />
          <span className="text-on-surface-variant font-label-bold text-xs">Search</span>
        </div>
      </div>

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-2 md:gap-4">

          {/* Neo-Brutalist User Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 p-1 border-4 border-on-background bg-[#e5deff] neo-shadow-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all">
              <div className="w-8 h-8 border-2 border-on-background bg-secondary-container overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={user?.photoURL || defaultPfp}
                  alt="User Avatar"
                />
              </div>
              <span className="hidden sm:inline font-label-bold text-xs uppercase pr-2 text-on-background">
                {user ? user.name.split(' ')[0] : 'STUDENT'}
              </span>
            </button>

            {/* Popover Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white border-4 border-on-background neo-shadow hidden group-hover:block hover:block z-50 p-2">
              <div className="border-b-2 border-on-background pb-2 mb-2 px-2 text-left">
                <p className="font-label-bold text-[9px] text-[#1b6b4f] uppercase tracking-widest font-black">{user?.role || 'student'}</p>
                <p className="font-bold text-xs text-on-background truncate">{user?.name || 'FestFlow User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>

              {/* Change PFP Action */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`w-full text-left px-2 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors duration-150 cursor-pointer ${isUploading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'hover:bg-[#a6f2cf]'}`}
              >
                {isUploading ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">hourglass_empty</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    Change PFP
                  </>
                )}
              </button>

              <button
                onClick={logout}
                className="w-full text-left px-2 py-1.5 hover:bg-[#ffe5ec] hover:text-error text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors duration-150 cursor-pointer mt-1"
              >
                <span className="material-symbols-outlined text-sm text-error">logout</span>
                Sign Out
              </button>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

