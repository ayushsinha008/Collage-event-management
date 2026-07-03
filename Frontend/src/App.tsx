import { useState, useEffect, useCallback } from 'react';
import { Event } from './types/event';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import EventDashboard from './features/events/EventDashboard';
import EventDetail from './features/events/EventDetail';
import TicketWallet from './features/booking/TicketWallet';
import StudentDashboard from './features/events/StudentDashboard';
import { studentApi } from './services/studentApi';

function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'events' | 'tickets'>('dashboard');
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [myTicketDetails, setMyTicketDetails] = useState<any[]>([]);

  const myTickets = myTicketDetails
    .map((t) => t.registration?.event?._id || t.registration?.event?.id || t.registration?.event)
    .filter(Boolean) as string[];

  const fetchEvents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const backendEvents = await studentApi.getEvents();
      setEvents(backendEvents);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Unable to connect to the server. Please check your connection and try again.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    if (!user) {
      setMyTicketDetails([]);
      return;
    }
    try {
      const tickets = await studentApi.getMyTickets();
      setMyTicketDetails(tickets);
    } catch (err) {
      console.error('Failed to fetch user tickets:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(() => fetchEvents(true), 10000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (selectedEvent) {
      const updated = events.find((e) => e.id === selectedEvent.id);
      if (updated) setSelectedEvent(updated);
    }
  }, [events, selectedEvent]);

  const handleRegister = async (event: Event) => {
    if (!user) {
      alert('Please sign in with Google first to RSVP for events.');
      return;
    }

    const isRegistered = myTickets.includes(event.id);

    try {
      if (isRegistered) {
        await studentApi.cancelRegistration(event.id);
        await fetchTickets();
        await fetchEvents(true);
      } else {
        const result = await studentApi.registerForEvent(event.id);
        if (result.ticket) {
          alert(`Ticket booked! Your code: ${result.ticket.ticketCode}`);
        }
        await fetchTickets();
        await fetchEvents(true);
        setSelectedEvent(null);
        setCurrentTab('tickets');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Action failed. Please try again.';
      alert(message);
    }
  };

  return (
    <div className="flex min-h-screen font-body-md text-body-md bg-background text-on-background">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setSelectedCategory={setSelectedCategory}
        setSelectedEvent={setSelectedEvent}
        error={error}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-background pb-16 md:pb-0">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
        />

        <div className="p-6 md:p-margin-desktop flex-grow">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-on-background border-t-primary rounded-full animate-spin"></div>
              <p className="font-label-bold text-on-surface-variant">LOADING CAMPUS PLATFORM...</p>
            </div>
          ) : error && events.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
              <span className="material-symbols-outlined text-5xl text-error">cloud_off</span>
              <p className="font-label-bold text-on-surface-variant uppercase">{error}</p>
              <button
                onClick={() => fetchEvents()}
                className="bg-primary text-white border-4 border-on-background neo-shadow-sm px-6 py-2.5 font-label-bold uppercase text-xs hover-lift press-down"
              >
                Retry
              </button>
            </div>
          ) : selectedEvent ? (
            <EventDetail
              event={selectedEvent}
              myTickets={myTickets}
              handleRegister={handleRegister}
              setSelectedEvent={setSelectedEvent}
            />
          ) : currentTab === 'dashboard' ? (
            <StudentDashboard
              events={events}
              myTickets={myTickets}
              handleRegister={handleRegister}
              setSelectedEvent={setSelectedEvent}
              setCurrentTab={setCurrentTab}
            />
          ) : currentTab === 'events' ? (
            <EventDashboard
              events={events}
              myTickets={myTickets}
              handleRegister={handleRegister}
              setSelectedEvent={setSelectedEvent}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
            />
          ) : (
            <TicketWallet
              events={events}
              myTickets={myTickets}
              ticketDetails={myTicketDetails}
              handleRegister={handleRegister}
              setCurrentTab={setCurrentTab}
            />
          )}
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t-4 border-on-background flex justify-around items-center py-3 z-40">
          <button
            onClick={() => { setCurrentTab('dashboard'); setSelectedEvent(null); }}
            className={`flex flex-col items-center gap-1 ${currentTab === 'dashboard' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-label-bold">HOME</span>
          </button>
          <button
            onClick={() => { setCurrentTab('events'); setSelectedEvent(null); }}
            className={`flex flex-col items-center gap-1 ${currentTab === 'events' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">explore</span>
            <span className="text-[10px] font-label-bold">EVENTS</span>
          </button>
          <button
            onClick={() => { setCurrentTab('tickets'); setSelectedEvent(null); }}
            className={`flex flex-col items-center gap-1 ${currentTab === 'tickets' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="text-[10px] font-label-bold">TICKETS</span>
          </button>
        </nav>
      </main>
    </div>
  );
}

export default App;
