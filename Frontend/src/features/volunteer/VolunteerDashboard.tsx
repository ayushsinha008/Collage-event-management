import { Event } from '../../types';
import { Play, CheckCircle, Users, Clock, ArrowRight, Activity, Calendar } from 'lucide-react';

interface ScanLog {
  id: string;
  studentName: string;
  ticketCode: string;
  eventTitle: string;
  timestamp: string;
  status: 'success' | 'failed';
  message: string;
}

interface VolunteerDashboardProps {
  events: Event[];
  scanLogs: ScanLog[];
  checkedInCounts: Record<string, number>;
  onStartScanning: () => void;
  selectedEventId: string | 'all';
  setSelectedEventId: (id: string | 'all') => void;
}

export default function VolunteerDashboard({
  events,
  scanLogs,
  checkedInCounts,
  onStartScanning,
  selectedEventId,
  setSelectedEventId
}: VolunteerDashboardProps) {
  
  // Aggregate stats based on selected event or all events
  const filteredEvents = selectedEventId === 'all' 
    ? events 
    : events.filter(e => e.id === selectedEventId);

  const totalRegistered = filteredEvents.reduce((acc, curr) => acc + curr.rsvps, 0);
  const totalCheckedIn = filteredEvents.reduce((acc, curr) => acc + (checkedInCounts[curr.id] || 0), 0);
  const totalRemaining = Math.max(0, totalRegistered - totalCheckedIn);
  const checkInRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  // Filter logs for selected event
  const filteredLogs = selectedEventId === 'all' 
    ? scanLogs 
    : scanLogs.filter(log => {
        const ev = events.find(e => e.id === selectedEventId);
        return ev ? log.eventTitle === ev.title : true;
      });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome banner - orange/yellow background, rounded, black border & shadow */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-200 via-orange-200 to-amber-100 p-8 border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-white border-2 border-black text-black mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse"></span>
            CAMPUS ACCESS NODE
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-black text-black leading-tight tracking-tight uppercase">
            Access Control Terminal
          </h2>
          <p className="mt-2 text-black/85 font-bold">
            Monitor real-time entrance status, check-in student ticket logs, and operate the handheld scanning device.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={onStartScanning}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm px-6 py-3.5 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover-lift press-down transition-all uppercase tracking-wide"
            >
              <Play className="w-4 h-4 fill-white shrink-0" />
              Start Ticket Scanner
            </button>
          </div>
        </div>
      </div>

      {/* Selector and Main Stats Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <label htmlFor="event-filter" className="block text-xs font-black text-black uppercase tracking-wider">
            Active Event Viewport
          </label>
          <select
            id="event-filter"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full md:w-80 bg-white border-[3px] border-black px-4 py-2.5 rounded-xl text-black font-black focus:ring-0 text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="all">All Events Aggregated</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        <div className="text-right flex flex-col items-start md:items-end">
          <p className="text-xs font-black text-black uppercase tracking-wider">Operational Status</p>
          <div className="mt-1.5 flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-black text-xs text-black uppercase tracking-wide">Sync Connected</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - white backgrounds, thick black borders, solid shadows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Registered */}
        <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Registered</p>
            <h3 className="text-3xl font-black text-black font-headline">{totalRegistered}</h3>
            <p className="text-[11px] text-slate-500 font-bold">Total RSVP count</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Checked In */}
        <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-orange-500 uppercase tracking-wider">Checked In</p>
            <h3 className="text-3xl font-black text-black font-headline">{totalCheckedIn}</h3>
            <p className="text-[11px] text-emerald-600 font-black">{checkInRate}% attendance rate</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-100 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Remaining</p>
            <h3 className="text-3xl font-black text-black font-headline">{totalRemaining}</h3>
            <p className="text-[11px] text-slate-500 font-bold">Awaiting entry check</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-100 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Check-In Progress Ring card */}
        <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
          <div className="space-y-1.5 flex-grow">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Check-in Rate</p>
            <h3 className="text-3xl font-black text-black font-headline">{checkInRate}%</h3>
            <div className="w-full bg-slate-100 border-2 border-black rounded-full h-3">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${checkInRate}%` }}
              ></div>
            </div>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0 ml-3">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" className="stroke-slate-100" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="24" className="stroke-orange-500" strokeWidth="4" strokeLinecap="round" fill="transparent"
                strokeDasharray={150.7}
                strokeDashoffset={150.7 - (150.7 * checkInRate) / 100}
              />
            </svg>
            <span className="absolute text-[10px] font-black text-black">{checkInRate}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Events Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-headline text-lg font-black text-black uppercase mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Active Checklists
            </h3>
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {filteredEvents.map(event => {
                const eventChecked = checkedInCounts[event.id] || 0;
                const percent = event.rsvps > 0 ? Math.round((eventChecked / event.rsvps) * 100) : 0;
                return (
                  <div key={event.id} className="p-4 rounded-xl bg-orange-50/40 border-2 border-black space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-xs text-black line-clamp-1 uppercase leading-tight">
                        {event.title}
                      </h4>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>Venue: {event.location}</span>
                      <span className="font-black text-black">{eventChecked} / {event.rsvps}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-full bg-white border-2 border-black rounded-full h-2.5">
                        <div 
                          className="bg-yellow-400 h-1.5 rounded-full transition-all" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                        <span>Check-In Rate</span>
                        <span>{percent}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Scan Logs Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-lg font-black text-black uppercase flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                Live Attendance Feed
              </h3>
              <span className="text-xs bg-slate-100 border-2 border-black text-black px-3 py-1 rounded-full font-black uppercase tracking-wider">
                {filteredLogs.length} Records
              </span>
            </div>

            <div className="flex-grow space-y-4 max-h-[360px] overflow-y-auto pr-2">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <div 
                    key={log.id} 
                    className={`flex items-start justify-between p-4 rounded-xl border-2 border-black transition-all ${
                      log.status === 'success' 
                        ? 'bg-emerald-50/50 hover:bg-emerald-100/40' 
                        : 'bg-rose-50/50 hover:bg-rose-100/40'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-7 h-7 rounded-full border-2 border-black flex items-center justify-center shrink-0 ${
                        log.status === 'success' 
                          ? 'bg-emerald-200 text-black' 
                          : 'bg-rose-200 text-black'
                      }`}>
                        {log.status === 'success' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-xs font-black">!</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-sm text-black">{log.studentName}</p>
                          <span className="text-[9px] bg-slate-200 border border-black text-black px-2 py-0.5 rounded font-mono font-black">
                            {log.ticketCode}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                          Event: {log.eventTitle}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">{log.message}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-black text-black/50 flex items-center gap-1">
                        <Clock className="w-3 h-3 inline" />
                        {log.timestamp}
                      </p>
                      <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black mt-1.5 ${
                        log.status === 'success'
                          ? 'bg-emerald-200 text-black'
                          : 'bg-rose-200 text-black'
                      }`}>
                        {log.status === 'success' ? 'GRANTED' : 'DENIED'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-60 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                  <Activity className="w-12 h-12 stroke-[1.5] animate-pulse" />
                  <p className="font-black text-black">Awaiting Scan Activities</p>
                  <p className="text-xs max-w-xs font-bold">Start checking in tickets to populate the real-time access control feed.</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <button 
                onClick={onStartScanning}
                className="text-xs font-black text-orange-600 hover:text-orange-700 uppercase tracking-wider inline-flex items-center gap-1.5 hover:underline"
              >
                Launch camera overlay scanner
                <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
