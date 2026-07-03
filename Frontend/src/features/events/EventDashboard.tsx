import { Event } from '../../types';

interface EventDashboardProps {
  events: Event[];
  myTickets: string[];
  handleRegister: (event: Event) => void;
  setSelectedEvent: (event: Event) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  registeringEventId?: string | null;
}

export default function EventDashboard({
  events,
  myTickets,
  handleRegister,
  setSelectedEvent,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  registeringEventId
}: EventDashboardProps) {
  
  // Filter events based on active category selection and search query
  const filteredEvents = events.filter(e => {
    const cat = (e.category || '').toLowerCase();
    const matchesCategory = selectedCategory === 'all' || 
           (selectedCategory === 'festivals' && (cat === 'cultural' || cat === 'festival')) ||
           (selectedCategory === 'tech talks' && (cat === 'technical' || cat === 'technology' || cat === 'tech')) ||
           (selectedCategory === 'sports' && cat === 'sports') ||
           (selectedCategory === 'workshops' && (cat === 'academic' || cat === 'workshop' || cat === 'seminar'));
           
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
          {filteredEvents.map((event, index) => {
            const hasJoined = myTickets.includes(event.id);
            
            // 1st Item: Featured Event (Spans 8 columns)
            if (index === 0) {
              return (
                <div 
                  key={event.id}
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
                      <div className="absolute top-4 left-4 bg-[#ffe24c] border-2 border-on-background px-3 py-1 font-label-bold text-xs uppercase">
                        FEATURED
                      </div>
                    </div>
                    <div className="md:w-1/2 p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="font-label-bold text-xs uppercase text-primary border-b-2 border-primary">
                            {event.category || 'EVENT'}
                          </span>
                          <span className="font-label-bold text-label-bold text-xs">
                            {event.date}
                          </span>
                        </div>
                        <h4 className="font-headline-lg text-headline-lg mb-4 hover:text-primary transition-colors uppercase">
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
                          disabled={registeringEventId === event.id}
                          onClick={(e) => { e.stopPropagation(); handleRegister(event); }}
                          className={`px-6 py-2 border-4 border-on-background font-label-bold uppercase text-xs hover-lift press-down ${
                            hasJoined
                              ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                              : 'bg-on-background text-white hover:bg-primary'
                          } disabled:opacity-50`}
                        >
                          {registeringEventId === event.id 
                            ? 'WAIT...' 
                            : (hasJoined ? 'Cancel' : 'Register')
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            
            // 2nd Item: Secondary Highlighted Card (Spans 4 columns)
            if (index === 1) {
              return (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="md:col-span-4 group cursor-pointer"
                >
                  <div className="bg-[#e5deff] border-4 border-on-background neo-shadow hover-lift h-full flex flex-col justify-between">
                    <div className="p-4 border-b-4 border-on-background bg-on-background text-[#a6f2cf] flex justify-between items-center">
                      <span className="font-label-bold uppercase text-xs">{event.category || 'EVENT'}</span>
                      <span className="material-symbols-outlined">star</span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-headline-md text-headline-md mb-2 uppercase group-hover:text-primary transition-colors line-clamp-2">
                          {event.title}
                        </h4>
                        <p className="text-on-secondary-fixed-variant text-sm mb-4 line-clamp-3">
                          {event.description}
                        </p>
                      </div>
                      <div className="bg-white/50 border-2 border-on-background p-3 flex items-center gap-4">
                        <span className="material-symbols-outlined">calendar_today</span>
                        <div>
                          <p className="font-label-bold text-xs uppercase">Date & Venue</p>
                          <p className="text-xs uppercase">{event.date} • {event.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Remaining Items: Standard Bento cards (Spans 4 columns each)
            return (
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
                        {event.category || 'EVENT'}
                      </span>
                      <h4 className="font-headline-md text-headline-md mb-2 group-hover:text-primary transition-colors uppercase line-clamp-1">
                        {event.title}
                      </h4>
                      <p className="text-on-surface-variant text-sm line-clamp-3 mb-4">
                        {event.description}
                      </p>
                    </div>
                    
                    <div className="border-t-2 border-on-background/10 pt-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                        <span className="truncate max-w-[120px]">{event.location}</span>
                        <span>{event.date}</span>
                      </div>
                      <button
                        disabled={registeringEventId === event.id}
                        onClick={(e) => { e.stopPropagation(); handleRegister(event); }}
                        className={`w-full py-2 border-2 border-on-background font-label-bold uppercase text-xs hover-lift press-down ${
                          hasJoined
                            ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                            : 'bg-white hover:bg-on-background hover:text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {registeringEventId === event.id 
                          ? 'Please wait...' 
                          : (hasJoined ? 'Cancel Ticket' : 'Secure Pass')
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
