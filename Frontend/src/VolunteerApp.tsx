import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from './types/event';
import { Camera, Zap, LayoutDashboard } from 'lucide-react';
import VolunteerDashboard from './features/volunteer/VolunteerDashboard';
import { studentApi } from './services/studentApi';
import { useAuth } from './context/AuthContext';
import { getAuthToken } from './utils/authToken';
import { API_BASE_URL } from './config/api';
import { normalizeTicketScan } from './utils/ticketScan';

const QRScanner = lazy(() => import('./features/volunteer/QRScanner'));

interface ScanLog {
  id: string;
  studentName: string;
  ticketCode: string;
  eventTitle: string;
  timestamp: string;
  status: 'success' | 'failed';
  message: string;
}

export default function VolunteerApp() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | 'all'>('all');
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const backendEvents = await studentApi.getEvents();
      setEvents(backendEvents);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Unable to load events from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCheckIn = async (qrToken: string) => {
    const tokenValue = normalizeTicketScan(qrToken);
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated.', studentName: '', eventTitle: '' };
      }

      const response = await fetch(`${API_BASE_URL}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qrToken: tokenValue }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const ticket = data.data.ticket;
        const event = data.data.event;
        const studentName = ticket?.registration?.user?.name || 'Student Attendee';
        const eventTitle = event?.title || 'Event Entry';
        const ticketCode = ticket?.ticketCode || tokenValue;
        const eventId = event?._id || event?.id;

        if (eventId) {
          setEvents((prev) =>
            prev.map((e) =>
              e.id === eventId
                ? { ...e, checkedInCount: event.checkedInCount ?? (e.checkedInCount ?? 0) + 1 }
                : e
            )
          );
        }

        const successLog: ScanLog = {
          id: `log-${Date.now()}`,
          studentName,
          ticketCode,
          eventTitle,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'success',
          message: 'Access granted. Verified and logged.',
        };
        setScanLogs((prev) => [successLog, ...prev]);

        return { success: true, message: 'Access granted. Welcome!', studentName, eventTitle };
      }

      const failedLog: ScanLog = {
        id: `log-${Date.now()}`,
        studentName: 'Unknown',
        ticketCode: tokenValue,
        eventTitle: 'Unknown Event',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'failed',
        message: data.message || 'Verification failed',
      };
      setScanLogs((prev) => [failedLog, ...prev]);

      return {
        success: false,
        message: data.message || 'Invalid ticket.',
        studentName: 'Attendee',
        eventTitle: 'Event',
      };
    } catch {
      return {
        success: false,
        message: 'Network error during check-in.',
        studentName: 'Attendee',
        eventTitle: 'Event',
      };
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fffbeb] font-body text-black">
      <aside className="hidden md:flex w-64 min-h-screen bg-white flex-col border-r-4 border-black z-20 shrink-0">
        <div className="p-5 border-b-4 border-black bg-orange-500 text-white">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" />
            <span className="text-2xl font-black tracking-tight" style={{ textShadow: '2px 2px 0 #000' }}>FESTFLOW</span>
          </div>
          <p className="text-sm font-black mt-1 uppercase tracking-widest text-yellow-300">Volunteer Node</p>
        </div>

        <nav className="flex-grow px-4 py-6 space-y-3 bg-white">
          <button
            onClick={() => setScannerOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-black font-black transition-all ${
              !scannerOpen
                ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 -translate-y-0.5'
                : 'bg-white text-black hover:bg-slate-50'
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
                : 'bg-white text-black hover:bg-slate-50'
            }`}
          >
            <Camera className="w-5 h-5 stroke-[2.5]" />
            Live Scanner
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <header className="flex justify-between items-center px-6 py-4 w-full bg-white border-b-4 border-black sticky top-0 z-10">
          <h2 className="font-headline text-lg font-black uppercase text-black flex items-center gap-2 md:hidden">
            <Zap className="w-6 h-6 text-orange-500 fill-orange-500" /> FestFlow Volunteer
          </h2>
          <div className="hidden md:block">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Node Portal</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-black text-slate-500 hover:text-black uppercase tracking-wider underline border-none bg-transparent"
          >
            Sign Out
          </button>
        </header>

        <div className="p-6 md:p-10 flex-grow">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="font-black text-xs uppercase tracking-wider text-orange-600">Loading events...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="font-black text-rose-600 uppercase mb-4">{error}</p>
              <button onClick={fetchEvents} className="bg-orange-500 text-white border-4 border-black px-6 py-2 font-black uppercase text-xs">
                Retry
              </button>
            </div>
          ) : !scannerOpen ? (
            <VolunteerDashboard
              events={events}
              scanLogs={scanLogs}
              onStartScanning={() => setScannerOpen(true)}
              selectedEventId={selectedEventId}
              setSelectedEventId={setSelectedEventId}
            />
          ) : (
            <div className="max-w-xl mx-auto bg-white border-[3px] border-black rounded-2xl p-8 text-center py-16 space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Camera className="w-12 h-12 text-orange-500 mx-auto animate-pulse" />
              <h3 className="font-headline text-xl font-black uppercase">Scanner Ready</h3>
              <button
                onClick={() => setScannerOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-6 py-3 rounded-xl border-[3px] border-black uppercase"
              >
                Open Scanner
              </button>
            </div>
          )}
        </div>

        {scannerOpen && (
          <Suspense fallback={null}>
            <QRScanner
              onCheckIn={handleCheckIn}
              onClose={() => setScannerOpen(false)}
            />
          </Suspense>
        )}
      </main>
    </div>
  );
}
