import { Event } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface StudentDashboardProps {
  events: Event[];
  myTickets: string[];
  handleRegister: (event: Event) => void;
  setSelectedEvent: (event: Event) => void;
  setCurrentTab: (tab: 'dashboard' | 'events' | 'tickets') => void;
  searchQuery: string;
}

export default function StudentDashboard({
  events,
  myTickets,
  handleRegister,
  setSelectedEvent,
  setCurrentTab,
  searchQuery
}: StudentDashboardProps) {
  const { user } = useAuth();
  
  // Find registered events
  const registeredEvents = events.filter(e => myTickets.includes(e.id));
  
  // Apply Search Filter to Recommendations
  const matchesSearch = (e: Event) => 
    !searchQuery.trim() || 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.organizer.toLowerCase().includes(searchQuery.toLowerCase());

  // Find recommended events (events the user has NOT registered for yet)
  const recommendations = events
    .filter(e => !myTickets.includes(e.id))
    .filter(matchesSearch)
    .slice(0, 3); // Pick first 3 as recommendations

  // Get next event details
  const nextEvent = registeredEvents[0] || null;

  return (
    <div className="space-y-10">
      
      {/* Welcome Banner */}
      <div className="bg-[#ffe24c] border-4 border-on-background p-8 md:p-10 neo-shadow relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="z-10">
          <span className="bg-black text-[#ffe24c] border-2 border-black font-label-bold text-xs uppercase px-3 py-1 inline-block mb-3 tracking-wider">
            STUDENT DASHBOARD
          </span>
          <h3 className="font-headline-xl text-3xl md:text-5xl font-bold uppercase mb-3 leading-none text-black">
            WELCOME BACK, {user ? user.name.split(' ')[0] : 'STUDENT'}!
          </h3>
          <p className="font-body-lg text-slate-900 max-w-xl font-semibold">
            Ready to explore? There are {events.length - myTickets.length} new events happening on campus this week.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('events')}
          className="bg-black text-white border-4 border-black hover:bg-slate-800 px-8 py-3.5 font-label-bold text-sm uppercase tracking-wide neo-shadow-sm hover-lift press-down flex items-center gap-2 shrink-0 z-10 cursor-pointer"
        >
          <span className="material-symbols-outlined">explore</span>
          EXPLORE CATALOG
        </button>
        {/* Background shapes */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-[#a6f2cf] border-l-4 border-b-4 border-on-background opacity-20 -rotate-12 translate-x-12 -translate-y-6"></div>
      </div>

      {/* Analytics / Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat 1: Passes Secured */}
        <div className="bg-[#a6f2cf] border-4 border-on-background p-6 neo-shadow hover-lift flex flex-col justify-between text-black">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-3xl text-black">confirmation_number</span>
              <span className="bg-white border-2 border-black px-2.5 py-0.5 text-[10px] font-label-bold text-black">ACTIVE PASSES</span>
            </div>
            <h4 className="font-headline-xl text-5xl font-bold mb-2 text-black">
              {myTickets.length}
            </h4>
            <p className="text-xs font-semibold text-slate-800">
              Passes successfully claimed in your Wallet.
            </p>
          </div>
          <button 
            onClick={() => setCurrentTab('tickets')}
            className="w-full mt-6 bg-white border-2 border-black py-2 text-xs font-label-bold uppercase text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            VIEW WALLET
          </button>
        </div>

        {/* Stat 2: Next RSVP Schedule */}
        <div className="bg-surface border-4 border-on-background p-6 neo-shadow hover-lift flex flex-col justify-between md:col-span-2">
          {nextEvent ? (
            <>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-[#ffe24c] border-2 border-on-background px-2.5 py-0.5 text-[10px] font-label-bold uppercase text-black">
                    NEXT UPCOMING EVENT
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{nextEvent.date}</span>
                </div>
                <div className="w-full h-32 md:h-40 border-4 border-on-background overflow-hidden mb-4 bg-slate-900">
                  <img 
                    src={nextEvent.imageUrl || `https://picsum.photos/seed/${nextEvent.id}/800/400`} 
                    alt={nextEvent.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <h4 
                  onClick={() => setSelectedEvent(nextEvent)}
                  className="font-headline-md text-xl md:text-2xl font-bold uppercase mb-2 hover:text-primary cursor-pointer line-clamp-1 transition-colors"
                >
                  {nextEvent.title}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-on-background">schedule</span>
                    <span>{nextEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-on-background">location_on</span>
                    <span className="line-clamp-1">{nextEvent.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setSelectedEvent(nextEvent)}
                  className="bg-slate-100 dark:bg-surface-container-high hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-on-background px-4 py-2 text-xs font-label-bold uppercase text-on-background cursor-pointer"
                >
                  DETAILS
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('tickets');
                  }}
                  className="bg-primary text-white border-2 border-on-background neo-shadow-sm px-4 py-2 text-xs font-label-bold uppercase hover-lift cursor-pointer"
                >
                  VIEW ENTRY PASS
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full py-4">
              <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-2">event_busy</span>
              <h4 className="font-headline-md text-lg font-bold uppercase mb-1">NO EVENTS SCHEDULED</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                You haven't RSVP'd to any events yet. Secure a free ticket to show up on your timeline.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Timeline and Recommendations split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: RSVP Schedule Agenda */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-b-4 border-on-background pb-3">
            <h4 className="font-headline-md text-2xl font-bold uppercase flex items-center gap-2">
              <span className="material-symbols-outlined">event_note</span> YOUR RSVP TIMELINE
            </h4>
          </div>

          {registeredEvents.length > 0 ? (
            <div className="space-y-4">
              {registeredEvents.map(event => (
                <div 
                  key={event.id}
                  className="bg-surface border-4 border-on-background p-4 neo-shadow hover-lift flex justify-between items-center gap-4 cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="min-w-0">
                    <span className="bg-[#dcd5fd] dark:bg-slate-800 border-2 border-on-background px-2 py-0.5 text-[9px] font-label-bold uppercase inline-block mb-1.5 text-on-background">
                      {event.category}
                    </span>
                    <h5 className="font-headline-md text-sm md:text-base font-bold uppercase truncate">
                      {event.title}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span> {event.location} • {event.date}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-2xl text-slate-400 select-none">chevron_right</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border-4 border-dashed border-on-background bg-surface-container p-6">
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase">Timeline is empty</p>
              <button 
                onClick={() => setCurrentTab('events')}
                className="bg-primary text-white border-2 border-on-background px-4 py-2 text-xs font-label-bold uppercase hover:bg-[#15523a] cursor-pointer"
              >
                BROWSE EVENTS NOW
              </button>
            </div>
          )}
        </div>

        {/* Right column: Curated Recommendations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b-4 border-on-background pb-3">
            <h4 className="font-headline-md text-2xl font-bold uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e0a800]">auto_awesome</span> RECOMMENDED FOR YOU
            </h4>
          </div>

          <div className="space-y-6">
            {recommendations.length > 0 ? (
              recommendations.map(event => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-[#e5deff] dark:bg-surface-container border-4 border-on-background neo-shadow hover-lift p-4 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label-bold text-[10px] uppercase text-primary dark:text-[#a6f2cf] border-b-2 border-primary dark:border-[#a6f2cf]">
                        {event.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{event.date}</span>
                    </div>
                    <h5 className="font-headline-md text-base font-bold uppercase line-clamp-1 group-hover:text-primary">
                      {event.title}
                    </h5>
                    <p className="text-xs text-on-secondary-fixed-variant dark:text-slate-300 mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-on-background/10 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{event.rsvps} attending</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRegister(event); }}
                      className="bg-primary text-white hover:bg-[#15523a] px-3 py-1.5 border-2 border-on-background text-[10px] font-label-bold uppercase cursor-pointer"
                    >
                      SECURE PASS
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No recommendations. You are registered for all events!</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
