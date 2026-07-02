import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from './types';
import { Camera, Zap, LayoutDashboard, ArrowLeft, Building } from 'lucide-react';
import VolunteerDashboard from './features/volunteer/VolunteerDashboard';
import QRScanner from './features/volunteer/QRScanner';

interface ScanLog {
  id: string;
  studentName: string;
  ticketCode: string;
  eventTitle: string;
  timestamp: string;
  status: 'success' | 'failed';
  message: string;
}

const INITIAL_MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'NEON PULSE MUSIC FESTIVAL',
    description: 'The biggest musical extravaganza on campus. Three nights, ten artists, and infinite memories. Get your early bird tickets before they\'re gone.',
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
    id: '2',
    title: 'AI & THE FUTURE OF CREATIVITY',
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
    id: '3',
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
    id: '4',
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

export default function VolunteerApp() {
  const navigate = useNavigate();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('volunteer_authenticated') === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | 'all'>('all');
  
  // Checked In states
  const [checkedInTickets, setCheckedInTickets] = useState<string[]>([]);
  const [checkedInCounts, setCheckedInCounts] = useState<Record<string, number>>({
    '1': 5,
    '2': 3
  });

  // Scanner Logs list
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([
    {
      id: 'log-1',
      studentName: 'Marcus Vance',
      ticketCode: 'FFLOW-TKT-1',
      eventTitle: 'NEON PULSE MUSIC FESTIVAL',
      timestamp: '01:15 PM',
      status: 'success',
      message: 'Access granted. Checked in successfully.'
    },
    {
      id: 'log-2',
      studentName: 'Zoe Chen',
      ticketCode: 'FFLOW-TKT-2',
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
      const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${baseURL}/events`);
      if (!response.ok) {
        throw new Error('Connection failed');
      }
      const data = await response.json();
      
      const mapBackendEvent = (e: any): Event => ({
        id: e._id || e.id,
        title: e.title,
        description: e.description,
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: e.startTime || e.time,
        location: e.venue || e.location,
        category: e.category,
        organizer: e.organizer?.name || e.organizer || 'Unknown',
        capacity: e.capacity,
        imageUrl: e.bannerImage || e.imageUrl,
        status: e.status,
        registrationsCount: e.registrationsCount || 0,
        rsvps: e.registrationsCount || 0,
      });

      if (data.success) {
        const backendEvents = data.data.events || data.data;
        setEvents(backendEvents.map(mapBackendEvent));
      } else {
        setEvents(data.map(mapBackendEvent));
      }
    } catch (err) {
      console.warn('Backend server offline, falling back to mock data.');
      setEvents(INITIAL_MOCK_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1293') {
      localStorage.setItem('volunteer_authenticated', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('INVALID PASSWORD. ACCESS DENIED.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('volunteer_authenticated');
    localStorage.removeItem('auth_user');
    setIsAuthenticated(false);
    setPassword('');
    navigate('/login');
  };

  const handleCheckIn = async (ticketCode: string) => {
    // Return a promise to QRScanner or handle it properly if QRScanner expects sync.
    // Wait, QRScanner expects a sync return. So I'll return a pending state or we should make QRScanner await it.
    // Let's adapt QRScanner to handle promises in the next step, for now just return a dummy sync and do async in background, OR we can just return a promise and assume QRScanner will handle it if we make it async.
    return new Promise<{ success: boolean; message: string; studentName: string; eventTitle: string }>(async (resolve) => {
      try {
        const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
        // Ensure ticketCode includes prefix if they just scanned the mock ticket ID '1'
        const codeToSend = ticketCode.startsWith('FFLOW-TKT-') ? ticketCode : `FFLOW-TKT-${ticketCode}`;
        
        const response = await fetch(`${baseURL}/check-in`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            // Organizer/Volunteer Auth Token
            'Authorization': `Bearer valid_mock_token` // Ideally the real volunteer token
          },
          body: JSON.stringify({ qrToken: codeToSend })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          const ticket = data.data.ticket;
          const event = data.data.event;
          
          setCheckedInTickets(prev => [...prev, ticketCode]);
          setCheckedInCounts(prev => ({
            ...prev,
            [event._id]: (prev[event._id] || 0) + 1
          }));

          const successLog: ScanLog = {
            id: `log-${Date.now()}`,
            studentName: ticket.registration?.user?.name || 'Student Attendee',
            ticketCode: codeToSend,
            eventTitle: event?.title || 'Event Entry',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            message: 'Access granted. Verified and logged.'
          };
          setScanLogs(prev => [successLog, ...prev]);

          resolve({
            success: true,
            message: 'Access granted. Welcome to the event!',
            studentName: successLog.studentName,
            eventTitle: successLog.eventTitle
          });
        } else {
          const failedLog: ScanLog = {
            id: `log-${Date.now()}`,
            studentName: 'Unknown Attendee',
            ticketCode: codeToSend,
            eventTitle: 'Unknown Event',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'failed',
            message: data.message || 'Verification Failed'
          };
          setScanLogs(prev => [failedLog, ...prev]);

          resolve({
            success: false,
            message: data.message || 'Invalid Ticket.',
            studentName: 'Attendee',
            eventTitle: 'Event'
          });
        }
      } catch(err) {
        resolve({
          success: false,
          message: 'Network error checking in.',
          studentName: 'Attendee',
          eventTitle: 'Event'
        });
      }
    });
  };

  const [scannerOpen, setScannerOpen] = useState(false);

  // Auth Guard Gate view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fffbeb] flex items-center justify-center p-6 relative overflow-hidden text-black font-body">
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
        
        {/* Decorative shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-amber-400 border-4 border-black neo-shadow -rotate-12 pointer-events-none hidden md:block"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-400 border-4 border-black neo-shadow rounded-full rotate-45 pointer-events-none hidden md:block"></div>
 
        <div className="w-full max-w-md bg-white border-4 border-black p-10 neo-shadow relative z-10">
          <div className="flex items-center justify-center gap-3 mb-10 border-b-4 border-black pb-6">
            <div className="bg-orange-500 p-2 border-4 border-black shadow-[4px_4px_0_0_#000] rotate-[-10deg]">
              <Zap className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">FestFlow<span className="text-orange-500 tracking-normal ml-2">VOL</span></h1>
          </div>
 
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-2">Volunteer Access Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-4 border-black bg-white px-4 py-3 font-black text-sm uppercase focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-shadow"
                placeholder="••••••••"
              />
            </div>
 
            {error && (
              <div className="bg-rose-100 border-4 border-black p-3 flex items-center justify-center">
                <p className="text-sm font-black text-rose-700 uppercase tracking-wide">{error}</p>
              </div>
            )}
 
            <button
              type="submit"
              className="w-full flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-black text-lg py-4 border-4 border-black neo-shadow-sm hover-lift uppercase transition-all mt-8"
            >
              VALIDATE KEYS
            </button>
            
            <button
              type="button"
              onClick={() => {
                const savedUser = localStorage.getItem('auth_user');
                let parsed = null;
                try {
                  parsed = savedUser ? JSON.parse(savedUser) : null;
                } catch (e) {}
                if (parsed && parsed.role === 'student') {
                  navigate('/');
                } else {
                  navigate('/login');
                }
              }}
              className="w-full text-center text-xs font-black text-slate-500 hover:text-black uppercase tracking-wider underline mt-4 block"
            >
              Back to Student Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fffbeb] font-body text-black">
      {/* Sidebar Layout */}
      <aside className="hidden md:flex w-64 min-h-screen bg-white flex-col border-r-4 border-black z-20 shrink-0">
        {/* Logo */}
        <div className="p-5 border-b-4 border-black bg-orange-500 text-white">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" />
            <span className="text-2xl font-black tracking-tight" style={{ textShadow: '2px 2px 0 #000' }}>FESTFLOW</span>
          </div>
          <p className="text-sm font-black mt-1 uppercase tracking-widest text-yellow-300">
            Volunteer Node
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-grow px-4 py-6 space-y-3 bg-white">
          <button
            onClick={() => setScannerOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-black font-black transition-all ${
              !scannerOpen
                ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 -translate-y-0.5'
                : 'bg-white text-black hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 stroke-[2.5]" />
            Dashboard
          </button>
          <button
            onClick={() => setScannerOpen(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-black font-black transition-all ${
              scannerOpen
                ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 -translate-y-0.5'
                : 'bg-white text-black hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <Camera className="w-5 h-5 stroke-[2.5]" />
            Live Scanner
          </button>
        </nav>

        {/* CTAs to other areas */}
        <div className="p-5 border-t-4 border-black bg-slate-50 space-y-3">
          <button
            onClick={() => {
              const savedUser = localStorage.getItem('auth_user');
              let parsed = null;
              try {
                parsed = savedUser ? JSON.parse(savedUser) : null;
              } catch (e) {}
              if (parsed && parsed.role === 'student') {
                navigate('/');
              } else {
                navigate('/login');
              }
            }}
            className="w-full bg-[#e5deff] border-4 border-black hover:bg-[#ffe24c] font-black py-2.5 px-4 flex items-center justify-center gap-2 uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover-lift"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" /> Student Mode
          </button>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="w-full bg-[#ffe5ec] border-4 border-black hover:bg-[#ffb3c1] font-black py-2.5 px-4 flex items-center justify-center gap-2 uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover-lift"
          >
            <Building className="w-4 h-4 stroke-[3] inline" /> Organizer Mode
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-slate-200 border-4 border-black hover:bg-slate-350 font-black py-2.5 px-4 flex items-center justify-center gap-2 uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover-lift"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Simple Header Bar */}
        <header className="flex justify-between items-center px-6 py-4 w-full bg-white border-b-4 border-black sticky top-0 z-10">
          <h2 className="font-headline text-lg font-black uppercase text-black flex items-center gap-2 md:hidden">
            <Zap className="w-6 h-6 text-orange-500 fill-orange-500" /> FestFlow Volunteer
          </h2>
          <div className="hidden md:block">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Node Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="text-xs font-black text-slate-500 hover:text-black uppercase tracking-wider underline border-none bg-transparent"
            >
              Sign Out
            </button>
            <span className="text-xs font-black bg-orange-100 border-2 border-black text-orange-600 px-3 py-1 rounded-full uppercase tracking-wider">
              Staff Portal
            </span>
          </div>
        </header>

        {/* Dynamic content viewport */}
        <div className="p-6 md:p-10 flex-grow">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="font-black text-xs uppercase tracking-wider text-orange-600">Initializing telemetry...</p>
            </div>
          ) : !scannerOpen ? (
            <VolunteerDashboard
              events={events}
              scanLogs={scanLogs}
              checkedInCounts={checkedInCounts}
              onStartScanning={() => setScannerOpen(true)}
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
                onClick={() => setScannerOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-6 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover-lift press-down transition-all uppercase tracking-wider"
              >
                OPEN SCANNER WINDOW
              </button>
            </div>
          )}
        </div>

        {/* Full-Screen Camera Scanning Overlay */}
        {scannerOpen && (
          <QRScanner
            events={events}
            myTickets={['1', '3', '5']}
            checkedInCounts={checkedInCounts}
            onCheckIn={handleCheckIn}
            onClose={() => setScannerOpen(false)}
          />
        )}
      </main>
    </div>
  );
}
