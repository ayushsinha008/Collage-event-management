import { Event } from '../../types';

interface EventDashboardProps {
  events: Event[];
  myTickets: string[];
  handleRegister: (event: Event) => void;
  setSelectedEvent: (event: Event) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
}

export default function EventDashboard({
  events,
  myTickets,
  handleRegister,
  setSelectedEvent,
  selectedCategory,
  setSelectedCategory,
  searchQuery
}: EventDashboardProps) {
  
  // Filter events based on active category selection and search query
  const filteredEvents = events.filter(e => {
    const matchesCategory = selectedCategory === 'all' || 
           (selectedCategory === 'festivals' && e.category === 'cultural') ||
           (selectedCategory === 'tech talks' && e.category === 'technical') ||
           (selectedCategory === 'sports' && e.category === 'sports') ||
           (selectedCategory === 'workshops' && e.category === 'academic');
           
    const matchesSearch = !searchQuery.trim() || 
           e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
           e.organizer.toLowerCase().includes(searchQuery.toLowerCase());
           
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Hero Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h3 className="font-headline-xl text-headline-xl uppercase mb-2">Campus Buzz</h3>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            The ultimate pulse of college life. Discover, attend, and host the events that define your semester.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setSelectedCategory('all')}
            className="bg-[#ffe24c] text-on-background border-4 border-on-background neo-shadow px-8 py-3 font-label-bold text-label-bold flex items-center gap-2 hover-lift press-down"
          >
            <span className="material-symbols-outlined">bolt</span>
            TRENDING NOW
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-10">
        <button className="bg-[#a7f3d0] text-on-background border-2 border-on-background px-6 py-2 font-label-bold text-label-bold neo-shadow-sm flex items-center gap-2 cursor-default">
          <span className="material-symbols-outlined">tune</span>
          FILTERS
        </button>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Events' },
            { key: 'festivals', label: 'Festivals' },
            { key: 'tech talks', label: 'Tech Talks' },
            { key: 'sports', label: 'Sports' },
            { key: 'workshops', label: 'Workshops' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedCategory(filter.key)}
              className={`border-2 border-on-background px-4 py-2 font-label-bold text-xs uppercase transition-all ${
                selectedCategory === filter.key
                  ? 'bg-[#a6f2cf] text-on-background neo-shadow-sm font-bold'
                  : 'bg-white text-on-background hover:bg-[#e5deff]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Featured Event Card (Neon Pulse Music Festival) */}
          {filteredEvents.find(e => e.id === '1') && (
            (() => {
              const event = events.find(e => e.id === '1')!;
              return (
                <div 
                  onClick={() => setSelectedEvent(event)}
                  className="md:col-span-8 group cursor-pointer"
                >
                  <div className="bg-white border-4 border-on-background neo-shadow hover-lift transition-all overflow-hidden flex flex-col md:flex-row h-full">
                    <div className="md:w-1/2 relative overflow-hidden h-64 md:h-auto bg-slate-900">
                      <img 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={event.imageUrl || `https://picsum.photos/seed/${event.id}/800/400`} 
                        alt={event.title}
                      />
                      <div className="absolute top-4 left-4 bg-[#ffe24c] border-2 border-on-background px-3 py-1 font-label-bold text-xs">
                        FEATURED
                      </div>
                    </div>
                    <div className="md:w-1/2 p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="font-label-bold text-xs uppercase text-primary border-b-2 border-primary">
                            Annual Fest
                          </span>
                          <span className="font-label-bold text-label-bold text-xs">
                            {event.date}
                          </span>
                        </div>
                        <h4 className="font-headline-lg text-headline-lg mb-4 hover:text-primary transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-on-surface-variant mb-6 line-clamp-3 text-sm">
                          {event.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-500">
                          {event.rsvps} attending
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRegister(event); }}
                          className={`px-6 py-2 border-4 border-on-background font-label-bold uppercase text-xs hover-lift press-down ${
                            myTickets.includes(event.id)
                              ? 'bg-[#ba1a1a] text-white'
                              : 'bg-on-background text-white hover:bg-primary'
                          }`}
                        >
                          {myTickets.includes(event.id) ? 'Cancel' : 'Register'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Small Grid Item: AI Tech Talk */}
          {filteredEvents.find(e => e.id === '2') && (
            (() => {
              const event = events.find(e => e.id === '2')!;
              return (
                <div 
                  onClick={() => setSelectedEvent(event)}
                  className="md:col-span-4 group cursor-pointer"
                >
                  <div className="bg-[#e5deff] border-4 border-on-background neo-shadow hover-lift h-full flex flex-col">
                    <div className="p-4 border-b-4 border-on-background bg-on-background text-[#a6f2cf] flex justify-between items-center">
                      <span className="font-label-bold uppercase text-xs">Tech Talk</span>
                      <span className="material-symbols-outlined">code</span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-headline-md text-headline-md mb-2 uppercase group-hover:text-primary transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-on-secondary-fixed-variant text-sm mb-4 line-clamp-3">
                          {event.description}
                        </p>
                      </div>
                      <div className="bg-white/50 border-2 border-on-background p-3 flex items-center gap-4">
                        <span className="material-symbols-outlined">calendar_today</span>
                        <div>
                          <p className="font-label-bold text-xs">Date & Venue</p>
                          <p className="text-xs">{event.date} • {event.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Secondary Row: Brutalist UI Lab */}
          {filteredEvents.find(e => e.id === '3') && (
            (() => {
              const event = events.find(e => e.id === '3')!;
              return (
                <div 
                  onClick={() => setSelectedEvent(event)}
                  className="md:col-span-4 group cursor-pointer"
                >
                  <div className="bg-white border-4 border-on-background neo-shadow hover-lift h-full overflow-hidden flex flex-col">
                    <div className="h-48 overflow-hidden border-b-4 border-on-background bg-slate-900">
                      <img 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all" 
                        src={event.imageUrl || `https://picsum.photos/seed/${event.id}/800/400`} 
                        alt={event.title}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex gap-2 mb-3">
                        <span className="bg-[#a6f2cf] border-2 border-on-background px-2 py-0.5 text-[10px] font-label-bold uppercase">
                          Workshop
                        </span>
                        <span className="bg-[#ffe24c] border-2 border-on-background px-2 py-0.5 text-[10px] font-label-bold uppercase">
                          Design
                        </span>
                      </div>
                      <h4 className="font-headline-md text-headline-md mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRegister(event); }}
                        className={`w-full border-2 border-on-background py-2 font-label-bold uppercase text-xs transition-all ${
                          myTickets.includes(event.id)
                            ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                            : 'hover:bg-on-background hover:text-white bg-transparent border-on-background'
                        }`}
                      >
                        {myTickets.includes(event.id) ? 'Claimed (Cancel)' : 'Claim Spot'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Secondary Row: Sports Event */}
          {filteredEvents.find(e => e.id === '4') && (
            (() => {
              const event = events.find(e => e.id === '4')!;
              return (
                <div 
                  onClick={() => setSelectedEvent(event)}
                  className="md:col-span-4 group cursor-pointer"
                >
                  <div className="bg-[#ffe24c] border-4 border-on-background neo-shadow hover-lift h-full flex flex-col justify-between p-8">
                    <div>
                      <span className="material-symbols-outlined text-4xl mb-6">sports_basketball</span>
                      <h4 className="font-headline-lg text-headline-lg mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-on-tertiary-fixed-variant text-sm line-clamp-3">
                        {event.description}
                      </p>
                    </div>
                    <div className="pt-6 border-t-2 border-on-background/10 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="font-label-bold text-xs">{event.location}</span>
                      </div>
                      <span className="font-label-bold text-xs">{event.date} • {event.time}</span>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Secondary Row: Ticket Look Card (Retro Rewind) */}
          {filteredEvents.find(e => e.id === '5') && (
            (() => {
              const event = events.find(e => e.id === '5')!;
              const hasJoined = myTickets.includes(event.id);
              return (
                <div 
                  onClick={() => setSelectedEvent(event)}
                  className="md:col-span-4 group cursor-pointer relative"
                >
                  <div className="bg-white border-4 border-on-background neo-shadow hover-lift h-full flex flex-col ticket-edge">
                    <div className="p-6 border-b-2 border-dashed border-on-background flex justify-between items-center bg-[#dcd5fd]">
                      <span className="font-label-bold uppercase text-xs tracking-widest">VIP Pass</span>
                      <span className="font-label-bold">{hasJoined ? 'SECURED' : '$0.00'}</span>
                    </div>
                    <div className="p-6 flex flex-col items-center justify-center gap-4 text-center">
                      <h4 className="font-headline-md text-headline-md group-hover:text-primary transition-colors">
                        {event.title}
                      </h4>
                      <div className="w-32 h-32 border-4 border-on-background p-2 bg-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[100px] leading-none select-none text-on-background">
                          qr_code_2
                        </span>
                      </div>
                      <p className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest">
                        {hasJoined ? 'FFLOW-TKT-5' : 'RSVP FOR TICKET'}
                      </p>
                    </div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); handleRegister(event); }}
                      className={`mt-auto p-4 flex justify-center items-center gap-2 border-t-2 border-on-background cursor-pointer hover:bg-primary hover:text-white transition-colors ${
                        hasJoined ? 'bg-primary text-white' : 'bg-on-background text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {hasJoined ? 'check' : 'confirmation_number'}
                      </span>
                      <span className="text-xs font-label-bold uppercase">
                        {hasJoined ? 'TICKET SECURED' : 'GET PASS'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Custom user events addition row */}
          {filteredEvents.filter(e => !['1', '2', '3', '4', '5'].includes(e.id)).map(event => (
            <div 
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="md:col-span-4 group cursor-pointer"
            >
              <div className="bg-white border-4 border-on-background neo-shadow hover-lift h-full flex flex-col">
                <div className="h-48 overflow-hidden border-b-4 border-on-background bg-slate-900 shrink-0">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all" 
                    src={event.imageUrl || `https://picsum.photos/seed/${event.id}/800/400`} 
                    alt={event.title}
                  />
                </div>
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="bg-[#a7f3d0] border-2 border-on-background px-2.5 py-0.5 text-[10px] font-label-bold uppercase inline-block mb-3">
                      {event.category}
                    </span>
                    <h4 className="font-headline-md text-headline-md mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-on-surface-variant text-sm line-clamp-3 mb-4">
                    {event.description}
                  </p>
                </div>
                
                <div className="border-t-2 border-on-background/10 pt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>{event.location}</span>
                    <span>{event.date}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRegister(event); }}
                    className={`w-full py-2 border-2 border-on-background font-label-bold uppercase text-xs hover-lift press-down ${
                      myTickets.includes(event.id)
                        ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                        : 'bg-white hover:bg-on-background hover:text-white'
                    }`}
                  >
                    {myTickets.includes(event.id) ? 'Cancel Ticket' : 'Secure Pass'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))
          }

        </div>
      ) : (
        <div className="py-20 text-center border-4 border-dashed border-on-background bg-white p-8">
          <span className="material-symbols-outlined text-5xl mb-4 text-slate-400">search_off</span>
          <h3 className="font-headline-md text-xl font-bold uppercase mb-2">No Events Found</h3>
          <p className="text-on-surface-variant text-sm">
            No results match your search keywords or category filters. Try modifying your choices.
          </p>
        </div>
      )}
    </>
  );
}
