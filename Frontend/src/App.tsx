import { useState, useEffect } from 'react';
import { Event } from './types';
import { useAuth } from './context/AuthContext';
import { db } from './services/firebase';
import { collection, doc, onSnapshot, setDoc, getDocs, writeBatch, increment } from 'firebase/firestore';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import EventDashboard from './features/events/EventDashboard';
import EventDetail from './features/events/EventDetail';
import TicketWallet from './features/booking/TicketWallet';
import StudentDashboard from './features/events/StudentDashboard';

const INITIAL_MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'NEON PULSE MUSIC FESTIVAL',
    description: 'The biggest musical extravaganza on campus. Three nights, ten artists, and infinite memories. Get your early bird tickets before they\'re gone.',
    date: 'OCT 24 - 26',
    time: '06:00 PM',
    location: 'Campus Open Stadium',
    organizer: 'Cultural Committee',
    capacity: 2000,
    rsvps: 450,
    category: 'cultural',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'AI & THE FUTURE OF CREATIVITY',
    description: 'Join industry leaders as we discuss the ethical and creative implications of generative AI and its impact on modern arts and engineering.',
    date: 'Tomorrow',
    time: '04:00 PM',
    location: 'Auditorium A',
    organizer: 'Computer Science Association',
    capacity: 200,
    rsvps: 180,
    category: 'technical',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Brutalist UI Lab',
    description: 'Hands-on session on creating high-impact visual identities and raw digital layouts using advanced HTML/CSS styling.',
    date: 'OCT 30',
    time: '02:00 PM',
    location: 'Design Lab 4',
    organizer: 'Design Club',
    capacity: 50,
    rsvps: 22,
    category: 'academic',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: 'INTER-COLLEGE SLAM DUNK',
    description: 'Witness the ultimate showdown between the titans of the basketball league. Free entry for students with valid ID cards.',
    date: 'SAT',
    time: '07:00 PM',
    location: 'Main Gym',
    organizer: 'Sports Club',
    capacity: 500,
    rsvps: 340,
    category: 'sports',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    title: 'Club Night: Retro Rewind',
    description: 'Retro tunes, arcade machines, and neon dancefloors. Live DJ sets playing top hits from the 80s and 90s.',
    date: 'OCT 31',
    time: '08:00 PM',
    location: 'Student Lounge',
    organizer: 'Entertainment Club',
    capacity: 150,
    rsvps: 145,
    category: 'cultural',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'
  }
];

function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'events' | 'tickets'>('dashboard');

  // Data States
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // User RSVP Tickets (Store event IDs the user registered for)
  const [myTickets, setMyTickets] = useState<string[]>([]);

  // 1. Subscribe to Firestore events collection in real-time
  useEffect(() => {
    setLoading(true);
    const eventsCollection = collection(db, 'events');
    
    // Seed Firestore with initial mock events if empty
    const seedIfEmpty = async () => {
      try {
        const querySnapshot = await getDocs(eventsCollection);
        if (querySnapshot.empty) {
          for (const ev of INITIAL_MOCK_EVENTS) {
            await setDoc(doc(db, 'events', ev.id), ev);
          }
        }
      } catch (err) {
        console.error('Failed to seed events:', err);
      }
    };
    
    seedIfEmpty();

    const unsubscribe = onSnapshot(eventsCollection, (snapshot) => {
      const eventsList: Event[] = [];
      snapshot.forEach((docSnap) => {
        eventsList.push({ id: docSnap.id, ...docSnap.data() } as Event);
      });
      setEvents(eventsList.sort((a, b) => Number(a.id) - Number(b.id)));
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Firestore connection error, falling back to local mocks:', err);
      setEvents(INITIAL_MOCK_EVENTS);
      setError('Offline Mode (Mock Server Active)');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to user bookings in real-time
  useEffect(() => {
    if (!user || user.role !== 'student') {
      setMyTickets([]);
      return;
    }

    const bookingsCollection = collection(db, 'bookings');
    const unsubscribe = onSnapshot(bookingsCollection, (snapshot) => {
      const tickets: string[] = [];
      snapshot.forEach((docSnap) => {
        const booking = docSnap.data();
        if (booking.userId === user.id) {
          tickets.push(booking.eventId);
        }
      });
      setMyTickets(tickets);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Synchronize selectedEvent details view when events change
  useEffect(() => {
    if (selectedEvent) {
      const updated = events.find(e => e.id === selectedEvent.id);
      if (updated) {
        setSelectedEvent(updated);
      }
    }
  }, [events]);

  // Handle RSVP with Firestore batch transactions
  const handleRegister = async (event: Event) => {
    if (!user) return;
    const isRegistered = myTickets.includes(event.id);
    const bookingDocId = `${user.id}_${event.id}`;
    const bookingRef = doc(db, 'bookings', bookingDocId);
    const eventRef = doc(db, 'events', event.id);

    try {
      const batch = writeBatch(db);
      if (isRegistered) {
        batch.delete(bookingRef);
        batch.update(eventRef, {
          rsvps: increment(-1)
        });
      } else {
        batch.set(bookingRef, {
          id: bookingDocId,
          userId: user.id,
          eventId: event.id,
          studentName: user.name,
          studentEmail: user.email,
          eventTitle: event.title,
          timestamp: new Date().toISOString()
        });
        batch.update(eventRef, {
          rsvps: increment(1)
        });
      }
      await batch.commit();
    } catch (err) {
      console.error('Firestore RSVP update failed:', err);
    }
  };





  return (
    <div className="flex min-h-screen font-body-md text-body-md bg-background text-on-background">

      {/* Sidebar Component */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setSelectedCategory={setSelectedCategory}
        setSelectedEvent={setSelectedEvent}
        error={error}
      />

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 bg-background pb-16 md:pb-0">

        {/* Top bar */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
        />

        {/* Content Area */}
        <div className="p-6 md:p-margin-desktop flex-grow">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-on-background border-t-primary rounded-full animate-spin"></div>
              <p className="font-label-bold text-on-surface-variant">LOADING CAMPUS PLATFORM...</p>
            </div>
          ) : selectedEvent ? (

            /* --- Event Details View --- */
            <EventDetail
              event={selectedEvent}
              myTickets={myTickets}
              handleRegister={handleRegister}
              setSelectedEvent={setSelectedEvent}
            />
          ) : currentTab === 'dashboard' ? (

            /* --- Personalized Student Dashboard --- */
            <StudentDashboard
              events={events}
              myTickets={myTickets}
              handleRegister={handleRegister}
              setSelectedEvent={setSelectedEvent}
              setCurrentTab={setCurrentTab}
            />
          ) : currentTab === 'events' ? (

            /* --- Events Catalog Explore View --- */
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

            /* --- My Tickets View --- */
            <TicketWallet
              events={events}
              myTickets={myTickets}
              handleRegister={handleRegister}
              setCurrentTab={setCurrentTab}
            />
          )}
        </div>
        {/* Mobile Navigation Bar */}
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
