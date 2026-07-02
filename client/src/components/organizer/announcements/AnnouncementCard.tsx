import React from 'react';
import { Announcement } from '../../../types/organizer';
import { Megaphone, Clock, Trash2 } from 'lucide-react';

const statusColor: Record<string, string> = {
  draft: 'bg-surface-variant text-on-surface-variant border-2 border-on-background',
  scheduled: 'bg-primary-container text-on-primary-container border-2 border-on-background',
  sent: 'bg-secondary-fixed text-on-secondary-fixed border-2 border-on-background',
};

export const AnnouncementCard: React.FC<{
  a: Announcement;
  onDelete?: (id: string) => void;
}> = ({ a, onDelete }) => (
  <div className="bg-background border-4 border-on-background p-5 hover:neo-shadow-sm transition-all group">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="p-2 border-4 border-on-background bg-surface">
          <Megaphone className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="flex-1 min-w-0 mt-1">
          <h4 className="font-extrabold text-lg uppercase tracking-wide group-hover:text-primary transition-colors">{a.title}</h4>
          <p className="text-sm font-label-bold text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">{a.message}</p>
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-label-bold uppercase">
            <span className="px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed border-2 border-on-background">{a.audience}</span>
            {a.eventTitle && (
              <span className="px-2 py-1 bg-surface-variant text-on-surface-variant border-2 border-on-background truncate max-w-[200px]">EVENT: {a.eventTitle}</span>
            )}
            <span className="flex items-center gap-1.5 px-2 py-1 bg-surface border-2 border-on-background">
              <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
              {new Date(a.sentAt || a.scheduledAt || a.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest ${statusColor[a.status]}`}>
          {a.status}
        </span>
        {onDelete && (
          <button
            onClick={() => onDelete(a.id)}
            className="text-error-container hover:bg-error-container hover:text-on-error-container p-2 border-2 border-transparent hover:border-on-background transition-colors"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  </div>
);