import { Event } from '../../types';

interface EventDetailProps {
  event: Event;
  myTickets: string[];
  handleRegister: (event: Event) => void;
  setSelectedEvent: (event: Event | null) => void;
}

export default function EventDetail({
  event,
  myTickets,
  handleRegister,
  setSelectedEvent
}: EventDetailProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white border-4 border-on-background neo-shadow p-6 md:p-10 relative">
      <button 
        onClick={() => setSelectedEvent(null)}
        className="absolute top-4 right-4 bg-white border-2 border-on-background p-1 hover:bg-[#ffe353] hover-lift press-down flex items-center justify-center"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      <span className="bg-[#a7f3d0] border-2 border-on-background px-3 py-1 font-label-bold text-xs uppercase inline-block mb-4">
        {event.category}
      </span>

      <h2 className="font-headline-xl text-3xl md:text-5xl uppercase font-bold tracking-tight mb-6">
        {event.title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="border-4 border-on-background overflow-hidden h-64 md:h-80 bg-slate-100">
          <img 
            src={event.imageUrl || `https://picsum.photos/seed/${event.id}/800/400`} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-4 border-on-background p-4 bg-[#e5deff] flex items-center gap-4">
              <span className="material-symbols-outlined text-2xl">calendar_month</span>
              <div>
                <p className="font-label-bold text-xs uppercase text-slate-700">DATE & TIME</p>
                <p className="font-bold text-sm">{event.date} • {event.time}</p>
              </div>
            </div>

            <div className="border-4 border-on-background p-4 bg-[#ffe24c] flex items-center gap-4">
              <span className="material-symbols-outlined text-2xl">location_on</span>
              <div>
                <p className="font-label-bold text-xs uppercase text-slate-700">VENUE / LOCATION</p>
                <p className="font-bold text-sm">{event.location}</p>
              </div>
            </div>

            <div className="border-4 border-on-background p-4 bg-slate-50 flex items-center gap-4">
              <span className="material-symbols-outlined text-2xl">groups</span>
              <div>
                <p className="font-label-bold text-xs uppercase text-slate-700">ORGANIZED BY</p>
                <p className="font-bold text-sm">{event.organizer}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold uppercase mb-2">
              <span>RSVP LIMIT: {event.rsvps} / {event.capacity}</span>
              <span>{Math.round((event.rsvps / event.capacity) * 100)}% Full</span>
            </div>
            <div className="w-full bg-[#eeeeee] border-2 border-on-background h-4 overflow-hidden mb-6">
              <div 
                className="bg-primary h-full border-r-2 border-on-background" 
                style={{ width: `${Math.min((event.rsvps / event.capacity) * 100, 100)}%` }}
              ></div>
            </div>

            <button
              onClick={() => handleRegister(event)}
              className={`w-full py-4 font-label-bold uppercase text-sm border-4 border-on-background neo-shadow-sm hover-lift press-down flex items-center justify-center gap-2 ${
                myTickets.includes(event.id)
                  ? 'bg-[#ba1a1a] text-white'
                  : 'bg-primary text-white'
              }`}
            >
              <span className="material-symbols-outlined">
                {myTickets.includes(event.id) ? 'cancel' : 'how_to_reg'}
              </span>
              {myTickets.includes(event.id) ? 'Cancel RSVP Ticket' : 'Register / Secure Spot'}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t-4 border-on-background pt-6">
        <h3 className="font-headline-md text-xl font-bold uppercase mb-3">Event Details</h3>
        <p className="text-on-surface-variant leading-relaxed font-body-md text-base">
          {event.description}
        </p>
      </div>
    </div>
  );
}
