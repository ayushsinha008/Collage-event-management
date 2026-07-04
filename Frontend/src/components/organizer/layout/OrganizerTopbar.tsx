import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, LogOut, Search, CheckCheck } from 'lucide-react';
import { useOrganizerContext } from '../../../context/OrganizerContext';
import { UserAvatar } from '../../common/UserAvatar';
import { organizerApi } from '../../../services/organizerApi';

export const OrganizerTopbar: React.FC = () => {
  const { organizer, logout } = useOrganizerContext();
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const list = await organizerApi.getNotifications();
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, []);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  const handleMarkAllRead = async () => {
    try {
      await organizerApi.readAllNotifications();
      setNotifications(Array.isArray(notifications) ? notifications.map((n) => ({ ...n, read: true })) : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (id: string, read: boolean) => {
    if (read) return;
    try {
      await organizerApi.readNotification(id);
      setNotifications(Array.isArray(notifications) ? notifications.map((n) => (n._id === id ? { ...n, read: true } : n)) : []);
    } catch (err) {
      console.error(err);
    }
  };

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
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 hover:bg-surface-variant border-2 border-transparent hover:border-on-background transition-all hover:-translate-y-0.5 hover:neo-shadow-sm"
          >
            <Bell className="w-5 h-5 stroke-[2.5]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] border-2 border-on-background rounded-full" />
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-surface border-4 border-on-background neo-shadow-sm z-50 flex flex-col max-h-[400px]">
              {/* Dropdown Header */}
              <div className="p-3 border-b-4 border-on-background bg-primary-fixed text-on-background flex justify-between items-center">
                <span className="font-extrabold uppercase text-xs tracking-wider">
                  Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-black uppercase flex items-center gap-1 hover:underline text-primary"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> MARK ALL READ
                  </button>
                )}
              </div>

              {/* List */}
              <div className="overflow-y-auto divide-y-2 divide-on-background flex-1 max-h-[300px]">
                {!Array.isArray(notifications) || notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs font-label-bold text-on-surface-variant uppercase">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n._id, n.read)}
                      className={`p-3 text-left transition-colors cursor-pointer ${
                        n.read ? 'bg-surface hover:bg-surface-variant' : 'bg-[#ffe5ec] hover:bg-[#ffd0db]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-xs font-extrabold uppercase ${n.read ? 'text-on-surface' : 'text-[#ba1a1a]'}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 bg-[#ba1a1a] rounded-full mt-1 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant font-label-bold mt-1 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[9px] text-slate-500 font-label-bold mt-1.5 uppercase">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                        - {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {organizer && (
          <div className="flex items-center gap-4 border-l-4 border-on-background pl-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-label-bold uppercase tracking-wide">{organizer.name}</p>
              <p className="text-xs font-label-bold text-primary">{organizer.organization}</p>
            </div>
            <UserAvatar
              name={organizer.name}
              src={organizer.avatarUrl}
              variant="organizer"
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