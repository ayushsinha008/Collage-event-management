import React from 'react';
import { Activity } from '../../../types/organizer';
import { UserPlus, QrCode, CalendarPlus, Megaphone, XCircle } from 'lucide-react';

const iconMap = {
  registration: { Icon: UserPlus, color: 'bg-primary-container text-on-primary-container' },
  'check-in': { Icon: QrCode, color: 'bg-secondary-fixed text-on-secondary-fixed' },
  'event-created': { Icon: CalendarPlus, color: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  announcement: { Icon: Megaphone, color: 'bg-secondary-container text-on-secondary-container' },
  cancellation: { Icon: XCircle, color: 'bg-error-container text-on-error-container' },
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}M AGO`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}H AGO`;
  return `${Math.floor(h / 24)}D AGO`;
};

export const ActivityFeed: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  return (
    <div className="bg-surface border-4 border-on-background p-6 neo-shadow">
      <h3 className="font-extrabold text-2xl uppercase tracking-wide mb-6 border-b-4 border-on-background pb-4">Recent Activity</h3>
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {activities.length === 0 && (
          <p className="text-sm font-label-bold text-on-surface-variant italic">No activity yet.</p>
        )}
        {activities.map((a) => {
          const { Icon, color } = iconMap[a.type];
          return (
            <div key={a.id} className="flex items-start gap-4 p-3 bg-background border-4 border-on-background hover:neo-shadow-sm transition-all">
              <div className={`p-2 border-2 border-on-background ${color}`}>
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex-1 mt-1">
                <p className="text-sm font-label-bold leading-tight">{a.message}</p>
                <p className="text-[10px] font-label-bold text-on-surface-variant mt-1 tracking-wider">{timeAgo(a.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};