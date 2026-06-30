import React, { useState, useEffect } from 'react';
import { Event } from './types';

// Initial local fallback events matching Stitch screen content
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
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'tickets' | 'scanner'>('dashboard');
  
  // Data States
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interaction States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // User RSVP Tickets (Store event IDs the user registered for)
  const [myTickets, setMyTickets] = useState<string[]>(['5']); // Default RSVP to Retro Rewind VIP pass

  // Host Event Modal
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
    capacity: 100,
    category: 'technical' as Event['category'],
    imageUrl: ''
  });

  // Admin Scanner simulator state
  const [scanCode, setScanCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    eventTitle?: string;
  } | null>(null);

  // Fetch from Express Server
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Connection failed');
      }
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        setEvents(data);
      }
      setError(null);
    } catch (err) {
      console.warn('Backend server offline, falling back to mock data.');
      setEvents(INITIAL_MOCK_EVENTS);
      setError('Offline Mode (Mock Server Active)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle RSVP
  const handleRegister = async (event: Event) => {
    const isRegistered = myTickets.includes(event.id);
    let updatedTickets;
    
    if (isRegistered) {
      // Un-register
      updatedTickets = myTickets.filter(id => id !== event.id);
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, rsvps: e.rsvps - 1 } : e));
      if (selectedEvent?.id === event.id) {
        setSelectedEvent(prev => prev ? { ...prev, rsvps: prev.rsvps - 1 } : null);
      }
    } else {
      // Register
      updatedTickets = [...myTickets, event.id];
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, rsvps: e.rsvps + 1 } : e));
      if (selectedEvent?.id === event.id) {
        setSelectedEvent(prev => prev ? { ...prev, rsvps: prev.rsvps + 1 } : null);
      }
    }
    setMyTickets(updatedTickets);
  };

  // Create Event Submit
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setEvents(prev => [...prev, data.data]);
      } else {
        // Mock fallback push
        const localNew: Event = {
          id: String(events.length + 1),
          title: newEvent.title.toUpperCase(),
          description: newEvent.description,
          date: newEvent.date,
          time: newEvent.time,
          location: newEvent.location,
          organizer: newEvent.organizer || 'Campus Club',
          capacity: Number(newEvent.capacity),
          rsvps: 0,
          category: newEvent.category,
          imageUrl: newEvent.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'
        };
        setEvents(prev => [...prev, localNew]);
      }

      // Reset
      setIsHostModalOpen(false);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        organizer: '',
        capacity: 100,
        category: 'technical',
        imageUrl: ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate scanning a ticket code (e.g. FFLOW-TKT-5)
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) return;

    // Parse the ID: expected format is FFLOW-TKT-{id}
    const match = scanCode.match(/FFLOW-TKT-(\d+)/i);
    if (!match) {
      setScanResult({
        success: false,
        message: 'INVALID TICKET FORMAT. Code must be FFLOW-TKT-{ID}'
      });
      return;
    }

    const ticketId = match[1];
    const event = events.find(e => e.id === ticketId);

    if (!event) {
      setScanResult({
        success: false,
        message: `TICKET VALIDATION FAILED. Event ID #${ticketId} does not exist.`
      });
      return;
    }

    // Check if the user is registered for this ticket
    const isUserRegistered = myTickets.includes(ticketId);
    if (!isUserRegistered) {
      setScanResult({
        success: false,
        message: `FRAUD ALERT! Student is not registered for this event.`,
        eventTitle: event.title
      });
      return;
    }

    setScanResult({
      success: true,
      message: 'ACCESS GRANTED. Ticket verified successfully.',
      eventTitle: event.title
    });
  };

  // Filter events
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                            (selectedCategory === 'festivals' && e.category === 'cultural') ||
                            (selectedCategory === 'tech talks' && e.category === 'technical') ||
                            (selectedCategory === 'sports' && e.category === 'sports') ||
                            (selectedCategory === 'workshops' && e.category === 'academic');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen overflow-x-hidden font-body-md text-body-md bg-background text-on-background">
      
      {/* Sidebar Component */}
      <aside className="hidden md:flex w-64 h-screen border-r-4 border-on-background bg-on-background flex-col py-8 sticky top-0 z-50">
        <div className="px-6 mb-12">
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary-fixed uppercase tracking-tighter flex items-center gap-1.5 text-[#a6f2cf]">
            <span className="material-symbols-outlined text-3xl">electric_bolt</span> FestFlow
          </h1>
          <p className="font-label-bold text-label-bold text-[#8bd6b4]/70">Admin & Student Console</p>
        </div>
        
        <nav className="flex-grow space-y-2">
          <button 
            onClick={() => { setCurrentTab('dashboard'); setSelectedEvent(null); }}
            className={`w-[calc(100%-16px)] m-2 flex items-center gap-3 px-4 py-3 rounded-none border-4 transition-all ${
              currentTab === 'dashboard' && !selectedEvent
                ? 'bg-tertiary text-on-tertiary border-on-background active-tab-shadow'
                : 'text-[#e2e2e2] border-transparent hover:text-white hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-bold text-label-bold">Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setCurrentTab('dashboard'); setSelectedCategory('all'); setSelectedEvent(null); }}
            className={`w-[calc(100%-16px)] m-2 flex items-center gap-3 px-4 py-3 rounded-none border-4 transition-all ${
              currentTab === 'dashboard' && selectedCategory === 'all' && !selectedEvent
                ? 'text-[#e2e2e2] border-transparent hover:text-white'
                : 'text-[#e2e2e2] border-transparent hover:text-white hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined">event</span>
            <span className="font-label-bold text-label-bold">Events</span>
          </button>
          
          <button 
            onClick={() => { setCurrentTab('tickets'); setSelectedEvent(null); }}
            className={`w-[calc(100%-16px)] m-2 flex items-center gap-3 px-4 py-3 rounded-none border-4 transition-all ${
              currentTab === 'tickets'
                ? 'bg-tertiary text-on-tertiary border-on-background active-tab-shadow'
                : 'text-[#e2e2e2] border-transparent hover:text-white hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="font-label-bold text-label-bold">My Tickets</span>
          </button>
          
          <button 
            onClick={() => { setCurrentTab('scanner'); setSelectedEvent(null); }}
            className={`w-[calc(100%-16px)] m-2 flex items-center gap-3 px-4 py-3 rounded-none border-4 transition-all ${
              currentTab === 'scanner'
                ? 'bg-tertiary text-on-tertiary border-on-background active-tab-shadow'
                : 'text-[#e2e2e2] border-transparent hover:text-white hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined">qr_code_scanner</span>
            <span className="font-label-bold text-label-bold">Live Scanner</span>
          </button>
        </nav>

        <div className="px-4 mt-auto">
          <button 
            onClick={() => setIsHostModalOpen(true)}
            className="w-full bg-[#a7f3d0] text-[#247156] border-4 border-on-background neo-shadow-sm font-label-bold text-label-bold py-3 mb-6 press-down hover-lift flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add_circle</span>
            New Event
          </button>
          
          <div className="border-t-2 border-slate-700/50 pt-4 flex flex-col gap-2">
            <span className="text-[#bec9c2] text-xs px-4">Status: {error ? 'Offline (Mock)' : 'Online'}</span>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 bg-background pb-16 md:pb-0">
        
        {/* Top bar */}
        <header className="flex justify-between items-center px-6 md:px-margin-desktop py-4 w-full bg-surface border-b-4 border-on-background sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-md text-headline-md font-bold text-on-background md:hidden flex items-center gap-1">
              <span className="material-symbols-outlined text-primary">electric_bolt</span> FestFlow
            </h2>
            <div className="hidden md:flex bg-white border-4 border-on-background px-4 py-2 w-96 items-center gap-3 neo-shadow-sm">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, locations..." 
                className="bg-transparent border-none outline-none flex-grow font-body-md focus:ring-0 focus:border-transparent text-on-surface p-0"
              />
              <span className="text-on-surface-variant font-label-bold text-xs">Search</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 mr-6">
              <button 
                onClick={() => { setCurrentTab('dashboard'); setSelectedEvent(null); }}
                className={`font-bold py-1 ${currentTab === 'dashboard' && !selectedEvent ? 'text-primary border-b-4 border-primary' : 'text-on-surface-variant font-label-bold hover:text-primary'}`}
              >
                Discover
              </button>
              <button 
                onClick={() => setCurrentTab('tickets')}
                className={`font-bold py-1 ${currentTab === 'tickets' ? 'text-primary border-b-4 border-primary' : 'text-on-surface-variant font-label-bold hover:text-primary'}`}
              >
                Tickets
              </button>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 border-4 border-on-background bg-secondary-container overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                  alt="User Avatar"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 md:p-margin-desktop flex-grow">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-on-background border-t-primary rounded-full animate-spin"></div>
              <p className="font-label-bold text-on-surface-variant">LOADING CAMPUS PLATFORM...</p>
            </div>
          ) : selectedEvent ? (
            
            /* --- Event Details View --- */
            <div className="max-w-4xl mx-auto bg-white border-4 border-on-background neo-shadow p-6 md:p-10 relative">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-white border-2 border-on-background p-1 hover:bg-[#ffe353] hover-lift press-down flex items-center justify-center"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>

              <span className="bg-[#a7f3d0] border-2 border-on-background px-3 py-1 font-label-bold text-xs uppercase inline-block mb-4">
                {selectedEvent.category}
              </span>

              <h2 className="font-headline-xl text-3xl md:text-5xl uppercase font-bold tracking-tight mb-6">
                {selectedEvent.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="border-4 border-on-background overflow-hidden h-64 md:h-80 bg-slate-100">
                  <img 
                    src={selectedEvent.imageUrl} 
                    alt={selectedEvent.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="border-4 border-on-background p-4 bg-[#e5deff] flex items-center gap-4">
                      <span className="material-symbols-outlined text-2xl">calendar_month</span>
                      <div>
                        <p className="font-label-bold text-xs uppercase text-slate-700">DATE & TIME</p>
                        <p className="font-bold text-sm">{selectedEvent.date} • {selectedEvent.time}</p>
                      </div>
                    </div>

                    <div className="border-4 border-on-background p-4 bg-[#ffe24c] flex items-center gap-4">
                      <span className="material-symbols-outlined text-2xl">location_on</span>
                      <div>
                        <p className="font-label-bold text-xs uppercase text-slate-700">VENUE / LOCATION</p>
                        <p className="font-bold text-sm">{selectedEvent.location}</p>
                      </div>
                    </div>

                    <div className="border-4 border-on-background p-4 bg-slate-50 flex items-center gap-4">
                      <span className="material-symbols-outlined text-2xl">groups</span>
                      <div>
                        <p className="font-label-bold text-xs uppercase text-slate-700">ORGANIZED BY</p>
                        <p className="font-bold text-sm">{selectedEvent.organizer}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase mb-2">
                      <span>RSVP LIMIT: {selectedEvent.rsvps} / {selectedEvent.capacity}</span>
                      <span>{Math.round((selectedEvent.rsvps / selectedEvent.capacity) * 100)}% Full</span>
                    </div>
                    <div className="w-full bg-[#eeeeee] border-2 border-on-background h-4 overflow-hidden mb-6">
                      <div 
                        className="bg-primary h-full border-r-2 border-on-background" 
                        style={{ width: `${Math.min((selectedEvent.rsvps / selectedEvent.capacity) * 100, 100)}%` }}
                      ></div>
                    </div>

                    <button
                      onClick={() => handleRegister(selectedEvent)}
                      className={`w-full py-4 font-label-bold uppercase text-sm border-4 border-on-background neo-shadow-sm hover-lift press-down flex items-center justify-center gap-2 ${
                        myTickets.includes(selectedEvent.id)
                          ? 'bg-[#ba1a1a] text-white'
                          : 'bg-primary text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {myTickets.includes(selectedEvent.id) ? 'cancel' : 'how_to_reg'}
                      </span>
                      {myTickets.includes(selectedEvent.id) ? 'Cancel RSVP Ticket' : 'Register / Secure Spot'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t-4 border-on-background pt-6">
                <h3 className="font-headline-md text-xl font-bold uppercase mb-3">Event Details</h3>
                <p className="text-on-surface-variant leading-relaxed font-body-md text-base">
                  {selectedEvent.description}
                </p>
              </div>
            </div>
          ) : currentTab === 'dashboard' ? (
            
            /* --- Dashboard / Explore View --- */
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
                    onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
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
                                src={event.imageUrl} 
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
                                src={event.imageUrl} 
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
                  {events.length > 5 && (
                    filteredEvents.slice(5).map(event => (
                      <div 
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="md:col-span-4 group cursor-pointer"
                      >
                        <div className="bg-white border-4 border-on-background neo-shadow hover-lift h-full flex flex-col justify-between p-6">
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
                    ))
                  )}

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
          ) : currentTab === 'tickets' ? (
            
            /* --- My Tickets / QR Management View --- */
            <div className="max-w-4xl mx-auto">
              <div className="mb-10 text-center md:text-left">
                <h3 className="font-headline-xl text-headline-xl uppercase mb-2">My Ticket Wallet</h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Show these tickets at the venue entry points. The administrative officers will validate the secure QR code.
                </p>
              </div>

              {myTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {myTickets.map(id => {
                    const event = events.find(e => e.id === id);
                    if (!event) return null;
                    return (
                      <div key={event.id} className="bg-white border-4 border-on-background neo-shadow ticket-edge flex flex-col">
                        <div className="p-6 border-b-2 border-dashed border-on-background flex justify-between items-center bg-[#dcd5fd]">
                          <span className="font-label-bold uppercase text-xs tracking-wider font-semibold text-slate-800">
                            CAMPUS VIP ENTRY PASS
                          </span>
                          <span className="bg-white border-2 border-on-background px-2 py-0.5 font-bold text-xs">
                            FREE
                          </span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                          <div>
                            <h4 className="font-headline-md text-xl font-bold uppercase mb-2">
                              {event.title}
                            </h4>
                            <div className="space-y-1.5 text-xs font-bold text-slate-500 uppercase">
                              <p className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">calendar_month</span> {event.date} • {event.time}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">location_on</span> {event.location}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-center border-t-2 border-on-background/10 pt-4 text-center">
                            <div className="w-36 h-36 border-4 border-on-background p-2.5 bg-white mb-2 shadow-sm">
                              {/* QR Image representation */}
                              <span className="material-symbols-outlined text-[115px] leading-none select-none text-on-background">
                                qr_code_2
                              </span>
                            </div>
                            <span className="font-label-bold text-xs uppercase tracking-widest text-[#1b6b4f]">
                              FFLOW-TKT-{event.id}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-1 uppercase font-semibold">
                              SCANNER SECURE CODE
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-on-background text-white flex justify-between items-center">
                          <span className="text-xs font-bold uppercase text-[#a6f2cf]">Verified Pass</span>
                          <button 
                            onClick={() => handleRegister(event)}
                            className="text-[#ffdad6] hover:text-red-400 font-bold text-xs uppercase underline"
                          >
                            Cancel RSVP
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center border-4 border-dashed border-on-background bg-white p-8">
                  <span className="material-symbols-outlined text-5xl mb-4 text-[#ba1a1a]">confirmation_number</span>
                  <h3 className="font-headline-md text-xl font-bold uppercase mb-2">Your Wallet is Empty</h3>
                  <p className="text-on-surface-variant text-sm mb-6">
                    You have not registered for any events yet. Secure a free spot on the dashboard.
                  </p>
                  <button 
                    onClick={() => setCurrentTab('dashboard')}
                    className="bg-primary text-white border-4 border-on-background neo-shadow-sm px-6 py-2.5 font-label-bold uppercase text-xs hover-lift press-down"
                  >
                    Browse Events
                  </button>
                </div>
              )}
            </div>
          ) : (
            
            /* --- Admin Scanner simulator --- */
            <div className="max-w-xl mx-auto">
              <div className="mb-10 text-center">
                <h3 className="font-headline-xl text-headline-xl uppercase mb-2">Live Ticket Scanner</h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Verify student tickets at event entrance. Simulates real-time code scanning database lookup.
                </p>
              </div>

              <div className="bg-white border-4 border-on-background neo-shadow p-6 md:p-8">
                <div className="border-4 border-on-background border-dashed p-6 bg-slate-50 flex flex-col items-center justify-center text-center mb-6">
                  <span className="material-symbols-outlined text-6xl animate-pulse mb-3 text-primary">
                    qr_code_scanner
                  </span>
                  <p className="font-label-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                    Scanner Simulator Ready
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Enter code format: <code className="font-bold text-on-background">FFLOW-TKT-ID</code> (e.g. FFLOW-TKT-5 for Retro Rewind ticket or FFLOW-TKT-1 for Hackathon).
                  </p>
                </div>

                <form onSubmit={handleScanSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                      Scan Code / Input Pass Code
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        required
                        value={scanCode}
                        onChange={(e) => { setScanCode(e.target.value); setScanResult(null); }}
                        placeholder="FFLOW-TKT-5" 
                        className="flex-grow bg-white border-4 border-on-background p-3 font-label-bold focus:ring-0 focus:border-on-background text-sm"
                      />
                      <button 
                        type="submit"
                        className="bg-primary text-white border-4 border-on-background neo-shadow-sm px-6 font-label-bold uppercase text-xs hover-lift press-down"
                      >
                        Scan / Verify
                      </button>
                    </div>
                  </div>
                </form>

                {/* Scan Results Display */}
                {scanResult && (
                  <div className={`mt-6 border-4 border-on-background p-4 neo-shadow-sm flex items-start gap-4 ${
                    scanResult.success ? 'bg-[#a7f3d0]' : 'bg-[#ffdad6]'
                  }`}>
                    <span className="material-symbols-outlined text-3xl">
                      {scanResult.success ? 'check_circle' : 'cancel'}
                    </span>
                    <div>
                      <h4 className="font-headline-md text-lg font-bold uppercase mb-1">
                        {scanResult.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                      </h4>
                      <p className="text-xs font-semibold mb-2">{scanResult.message}</p>
                      {scanResult.eventTitle && (
                        <p className="text-[10px] font-bold text-slate-600 uppercase">
                          Event: {scanResult.eventTitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Helper Dropdown of User's Tickets */}
                <div className="mt-8 border-t-2 border-on-background/10 pt-4">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">Simulate scanning of my secured tickets:</p>
                  {myTickets.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {myTickets.map(id => {
                        const event = events.find(e => e.id === id);
                        if (!event) return null;
                        return (
                          <button
                            key={id}
                            onClick={() => { setScanCode(`FFLOW-TKT-${id}`); setScanResult(null); }}
                            className="bg-slate-100 hover:bg-[#ffe353] border-2 border-on-background px-3 py-1 font-bold text-xs uppercase"
                          >
                            FFLOW-TKT-{id} ({event.title.substring(0, 12)}...)
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No tickets in your wallet to simulate scanning.</p>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-6 md:p-margin-desktop border-t-4 border-on-background flex flex-col md:flex-row justify-between items-center gap-6 mt-auto bg-surface-container-low">
          <div className="flex items-center gap-4">
            <div className="bg-on-background text-white p-2 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">electric_bolt</span>
            </div>
            <div>
              <p className="font-label-bold text-xs uppercase">Platform Status</p>
              <p className="text-[10px] text-[#1b6b4f] font-bold">All Systems Operational</p>
            </div>
          </div>
          
          <div className="flex gap-8 text-[#5f5a7c]">
            <span className="font-label-bold text-xs uppercase cursor-pointer hover:underline">Privacy Policy</span>
            <span className="font-label-bold text-xs uppercase cursor-pointer hover:underline">Code of Conduct</span>
            <span className="font-label-bold text-xs uppercase cursor-pointer hover:underline">Contact Admin</span>
          </div>

          <div className="max-w-xs text-center md:text-right text-[10px] text-slate-400 uppercase font-semibold">
            © {new Date().getFullYear()} FestFlow Web Platform. Built for Campus Events.
          </div>
        </footer>

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
            onClick={() => { setCurrentTab('tickets'); setSelectedEvent(null); }}
            className={`flex flex-col items-center gap-1 ${currentTab === 'tickets' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="text-[10px] font-label-bold">TICKETS</span>
          </button>
          
          <div className="relative -top-6">
            <button 
              onClick={() => setIsHostModalOpen(true)}
              className="bg-[#ffe24c] border-4 border-on-background p-4 neo-shadow-sm flex items-center justify-center rounded-none"
            >
              <span className="material-symbols-outlined font-bold text-on-background">add</span>
            </button>
          </div>

          <button 
            onClick={() => { setCurrentTab('scanner'); setSelectedEvent(null); }}
            className={`flex flex-col items-center gap-1 ${currentTab === 'scanner' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">qr_code_scanner</span>
            <span className="text-[10px] font-label-bold">SCANNER</span>
          </button>
          
          <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-on-background">
            <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
          </div>
        </nav>
      </main>

      {/* Host Event Modal */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsHostModalOpen(false)}
          ></div>
          
          <div className="bg-white border-4 border-on-background w-full max-w-lg rounded-none overflow-hidden shadow-2xl relative z-10 p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-4 border-on-background">
              <h3 className="font-headline-md text-2xl font-bold uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span> Host Event
              </h3>
              <button 
                onClick={() => setIsHostModalOpen(false)}
                className="border-2 border-on-background p-1 hover:bg-[#ffe353] hover-lift press-down flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. GRAND TECH SUMMIT"
                  className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background font-label-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide an overview of your event..."
                  rows={2}
                  className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    placeholder="e.g. OCT 30"
                    className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="e.g. 04:00 PM"
                    className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Aud. C"
                    className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value as Event['category'] }))}
                    className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background font-bold text-xs uppercase"
                  >
                    <option value="technical">Technical</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                    <option value="academic">Academic</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Organizer</label>
                  <input
                    type="text"
                    value={newEvent.organizer}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, organizer: e.target.value }))}
                    placeholder="e.g. Music Club"
                    className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Capacity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={newEvent.imageUrl}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
                />
              </div>

              <div className="pt-4 border-t-4 border-on-background flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsHostModalOpen(false)}
                  className="border-2 border-on-background px-4 py-2 font-label-bold uppercase text-xs hover:bg-[#ffdad6] hover-lift press-down"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white border-4 border-on-background neo-shadow-sm px-6 py-2.5 font-label-bold uppercase text-xs hover-lift press-down"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
