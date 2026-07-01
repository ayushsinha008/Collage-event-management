import { useState, useEffect } from 'react';
import { Event } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import VolunteerDashboard from './features/volunteer/VolunteerDashboard';
import QRScanner from './features/volunteer/QRScanner';
import { LayoutDashboard, Camera } from 'lucide-react';

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
    title: 'BRUTALIST UI LAB',
    description: 'Hands-on session on creating high-impact visual identities and raw digital layouts using advanced HTML/CSS styling.',
    date: 'OCT 30',
    time: '02:00 PM',
    location: 'Design Lab 4',
    organizer: 'Design Club',
    capacity: 50,
    rsvps: 42,
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
    title: 'CLUB NIGHT: RETRO REWIND',
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
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'scanner'>('dashboard');

  // Data States
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);


  // Active filter for Event Viewport in Dashboard
  const [selectedEventId, setSelectedEventId] = useState<string | 'all'>('all');

  // Check-In counts database
  const [checkedInCounts, setCheckedInCounts] = useState<Record<string, number>>({
    '1': 312,
    '2': 142,
    '3': 18,
    '4': 285,
    '5': 122
  });

  // Track checked in ticket IDs to prevent double scans
  const [checkedInTickets, setCheckedInTickets] = useState<string[]>(['101', '102']);

  // Live access feed logs
  const [scanLogs, setScanLogs] = useState<any[]>([
    {
      id: 'log-1',
      studentName: 'Marcus Vance',
      ticketCode: 'FFLOW-TKT-101',
      eventTitle: 'NEON PULSE MUSIC FESTIVAL',
      timestamp: '01:15 PM',
      status: 'success',
      message: 'Access granted. Checked in successfully.'
    },
    {
      id: 'log-2',
      studentName: 'Zoe Chen',
      ticketCode: 'FFLOW-TKT-102',
      eventTitle: 'AI & THE FUTURE OF CREATIVITY',
      timestamp: '01:10 PM',
      status: 'success',
      message: 'Access granted. CS Student ID verified.'
    }
  ]);

  // Fetch Events from API / server
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
    } catch (err) {
      console.warn('Backend server offline, falling back to mock data.');
      setEvents(INITIAL_MOCK_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle single ticket check-in verification
  const handleCheckIn = (ticketId: string) => {
    const studentNameMap: Record<string, string> = {
      '1': 'Alex Rivera',
      '2': 'David Chen',
      '3': 'Emily Watson',
      '4': 'Sophia Martinez',
      '5': 'Liam Harrison',
      '6': 'Olivia Bennett'
    };

    const studentName = studentNameMap[ticketId] || `Attendee #${ticketId}`;
    
    // Map ticketId to event. For simplicity, tickets 1 to 5 map to events 1 to 5.
    const targetEventId = ['1', '2', '3', '4', '5'].includes(ticketId) ? ticketId : '1';
    const event = events.find(e => e.id === targetEventId);
    const eventTitle = event ? event.title : 'General Event Admission';

    // 1. Verify Duplicate check-in
    if (checkedInTickets.includes(ticketId)) {
      const duplicateLog = {
        id: `log-${Date.now()}`,
        studentName,
        ticketCode: `FFLOW-TKT-${ticketId}`,
        eventTitle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'failed' as const,
        message: 'FRAUD ALERT: Duplicate scan detected!'
      };
      setScanLogs(prev => [duplicateLog, ...prev]);
      return {
        success: false,
        message: 'Duplicate Scan! Ticket already verified.',
        studentName,
        eventTitle
      };
    }

    // 2. Verify Capacity limits
    if (event && (checkedInCounts[event.id] || 0) >= event.capacity) {
      const capacityLog = {
        id: `log-${Date.now()}`,
        studentName,
        ticketCode: `FFLOW-TKT-${ticketId}`,
        eventTitle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'failed' as const,
        message: 'DENIED: Venue capacity limit reached!'
      };
      setScanLogs(prev => [capacityLog, ...prev]);
      return {
        success: false,
        message: 'Entry denied. Venue is full.',
        studentName,
        eventTitle
      };
    }

    // 3. Success check-in
    setCheckedInTickets(prev => [...prev, ticketId]);
    setCheckedInCounts(prev => ({
      ...prev,
      [targetEventId]: (prev[targetEventId] || 0) + 1
    }));

    const successLog = {
      id: `log-${Date.now()}`,
      studentName,
      ticketCode: `FFLOW-TKT-${ticketId}`,
      eventTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'success' as const,
      message: 'Access granted. Verified and logged.'
    };
    setScanLogs(prev => [successLog, ...prev]);

    return {
      success: true,
      message: 'Access granted. Welcome to the event!',
      studentName,
      eventTitle
    };
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden font-body bg-[#fffbeb] text-black">

      {/* Sidebar Layout */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">

        {/* Top Header bar */}
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        {/* Dynamic viewport pages */}
        <div className="p-6 md:p-10 flex-grow">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="font-black text-xs uppercase tracking-wider text-orange-600">Initializing telemetry...</p>
            </div>
          ) : currentTab === 'dashboard' ? (
            <VolunteerDashboard
              events={events}
              scanLogs={scanLogs}
              checkedInCounts={checkedInCounts}
              onStartScanning={() => setCurrentTab('scanner')}
              selectedEventId={selectedEventId}
              setSelectedEventId={setSelectedEventId}
            />
          ) : (
            <div className="max-w-xl mx-auto bg-white border-[3px] border-black rounded-2xl p-8 text-black text-center py-16 space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Camera className="w-12 h-12 text-orange-500 mx-auto animate-pulse" />
              <h3 className="font-headline text-xl font-black uppercase tracking-wider">Access Scanner Ready</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto font-bold">
                Launch full-screen camera overlay to verify student tickets and manage entries.
              </p>
              <button
                onClick={() => setCurrentTab('scanner')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-6 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover-lift press-down transition-all uppercase tracking-wider"
              >
                OPEN SCANNER WINDOW
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Bottom Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black flex justify-around items-center py-2 z-40 shadow-lg">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${
              currentTab === 'dashboard' ? 'text-orange-600 font-black' : 'text-slate-500 hover:text-black font-bold'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentTab('scanner')}
            className="flex flex-col items-center justify-center -mt-6 w-12 h-12 rounded-xl bg-orange-500 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => setCurrentTab('scanner')}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${
              currentTab === 'scanner' ? 'text-orange-600 font-black' : 'text-slate-500 hover:text-black font-bold'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Scanner</span>
          </button>
        </nav>

        {/* Full-Screen Camera Scanning Overlay */}
        {currentTab === 'scanner' && (
          <QRScanner
            events={events}
            myTickets={['1', '3', '5']} // Mock secured passes for testing
            checkedInCounts={checkedInCounts}
            onCheckIn={handleCheckIn}
            onClose={() => setCurrentTab('dashboard')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
