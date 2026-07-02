import React from 'react';
import { Event } from '../../../types/event';
import { Calendar, MapPin, Users } from 'lucide-react';

interface Props {
  events: Event[];
  onViewAll?: () => void;
}

export const RecentEvents: React.FC<Props> = ({ events, onViewAll }) => {
  return (
    <div className="bg-surface border-4 border-on-background p-6 neo-shadow">
      <div className="flex items-center justify-between mb-6 border-b-4 border-on-background pb-4">
        <h3 className="font-extrabold text-2xl uppercase tracking-wide">Upcoming Events</h3>
        {onViewAll && (
          <button onClick={onViewAll} className="text-sm font-label-bold uppercase border-b-2 border-on-background hover:bg-tertiary-fixed transition-colors">
            View all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {events.length === 0 && (
          <p className="text-sm font-label-bold text-on-surface-variant italic">No upcoming events yet.</p>
        )}
        {events.map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-4 p-3 border-4 border-on-background bg-background hover:neo-shadow-sm transition-all group"
          >
            <img
              src={e.imageUrl || 'https://picsum.photos/seed/' + e.id + '/80/80'}
              alt={e.title}
              className="w-16 h-16 object-cover border-4 border-on-background bg-surface-variant"
            />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-base truncate uppercase group-hover:text-primary transition-colors">{e.title}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-label-bold text-on-surface-variant mt-2">
                <span className="flex items-center gap-1.5 bg-surface-variant px-2 py-1 border-2 border-on-background">
                  <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                  {e.date}
                </span>
                <span className="flex items-center gap-1.5 bg-surface-variant px-2 py-1 border-2 border-on-background">
                  <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
                  {e.location}
                </span>
                <span className="flex items-center gap-1.5 bg-primary-container text-on-primary-container px-2 py-1 border-2 border-on-background">
                  <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                  {e.registrationsCount ?? 0}/{e.capacity}
                </span>
              </div>
            </div>
            <span className="px-3 py-1.5 text-xs font-label-bold uppercase bg-tertiary-fixed text-on-tertiary-fixed border-2 border-on-background transform -rotate-2">
              {e.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};