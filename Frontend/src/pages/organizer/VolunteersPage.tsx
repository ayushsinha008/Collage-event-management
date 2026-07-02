import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HeartHandshake, Calendar, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { useOrganizerEvents } from '../../hooks/useOrganizerEvents';
import { EventStatusBadge } from '../../components/organizer/events/EventStatusBadge';
import VolunteerAssignView from '../../components/organizer/manage/VolunteerAssignView';
import { Event } from '../../types/event';

export const VolunteersPage: React.FC = () => {
  const { events, loading } = useOrganizerEvents();
  const [params, setParams] = useSearchParams();
  const preselected = params.get('event');
  const [selected, setSelected] = useState<Event | null>(null);

  // Resolve the preselected event once the list has loaded (supports deep links
  // like /organizer/volunteers?event=1 coming from other pages).
  React.useEffect(() => {
    if (preselected && !selected && events.length > 0) {
      const match = events.find((e) => e.id === preselected);
      if (match) setSelected(match);
    }
  }, [preselected, selected, events]);

  const choose = (e: Event) => {
    setSelected(e);
    setParams({ event: e.id });
  };

  const back = () => {
    setSelected(null);
    setParams({});
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-8 border-primary pl-6 py-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase flex items-center gap-3" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
            <HeartHandshake className="w-8 h-8 stroke-[2.5]" /> Volunteers
          </h1>
          <p className="text-on-surface-variant mt-2 font-label-bold text-sm tracking-widest uppercase">
            {selected ? `Managing volunteers for ${selected.title}` : 'Pick an event to manage its volunteer roster.'}
          </p>
        </div>
        {selected && (
          <button
            onClick={back}
            className="flex items-center gap-2 bg-surface hover:bg-surface-variant text-on-background font-label-bold px-6 py-3 border-4 border-on-background neo-shadow-sm hover-lift transition-all uppercase"
          >
            <ArrowLeft className="w-5 h-5 stroke-[3]" /> All Events
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-on-background border-t-primary rounded-full animate-spin"></div>
          <p className="font-label-bold text-on-surface-variant uppercase tracking-widest">Loading Events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-surface border-4 border-on-background p-12 text-center neo-shadow">
          <p className="text-lg font-label-bold text-on-surface-variant uppercase tracking-wide">
            No events yet. Create an event first, then come back to assign volunteers.
          </p>
        </div>
      ) : !selected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => (
            <button
              key={e.id}
              onClick={() => choose(e)}
              className="text-left bg-surface border-4 border-on-background p-5 neo-shadow-sm hover-lift hover:neo-shadow transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-lg uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{e.title}</h3>
                <EventStatusBadge status={e.status} />
              </div>
              <div className="flex flex-wrap gap-2 mt-3 text-xs font-label-bold text-on-surface-variant uppercase">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 stroke-[2.5]" /> {e.date}</span>
                <span className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 stroke-[2.5]" /> {e.location}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-label-bold uppercase text-primary">
                Manage Volunteers <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <VolunteerAssignView eventId={selected.id} />
      )}
    </div>
  );
};

export default VolunteersPage;
