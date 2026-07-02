import { useState, useEffect, useRef } from 'react';
import { Event } from '../../types';
import { Camera, X, CheckCircle2, AlertTriangle, RefreshCw, Keyboard } from 'lucide-react';

interface QRScannerProps {
  events: Event[];
  myTickets: string[];
  checkedInCounts: Record<string, number>;
  onCheckIn: (ticketId: string) => { success: boolean; message: string; studentName: string; eventTitle: string };
  onClose: () => void;
}

export default function QRScanner({
  events,
  myTickets,
  checkedInCounts,
  onCheckIn,
  onClose
}: QRScannerProps) {
  // Mode selection: real camera vs simulator
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Scan HUD Overlay Feedback
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    studentName: string;
    ticketCode: string;
    eventTitle: string;
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Audio Context Synthesizer for check-in chime/buzzer
  const playSound = (type: 'success' | 'error') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      if (type === 'success') {
        // High ascending double beep
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);

        setTimeout(() => {
          if (audioCtx.state === 'closed') return;
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(783.99, audioCtx.currentTime); // G5
          gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.12);
        }, 80);
      } else {
        // Low buzzer sound
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, audioCtx.currentTime); // Buzzer pitch
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (err) {
      console.warn('Audio synthesis failed:', err);
    }
  };

  // Vibration feedback
  const triggerVibrate = (type: 'success' | 'error') => {
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [100] : [200, 100, 200]);
    }
  };

  // Turn on/off Webcam stream
  useEffect(() => {
    if (useRealCamera) {
      setCameraError(null);
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Camera access failed:', err);
        setCameraError('Unable to access camera. Please check permissions or select simulator mode.');
        setUseRealCamera(false);
      });
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [useRealCamera]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Process a ticket scan action (called by simulator, manual entry, or scanner)
  const processScan = (ticketCodeStr: string) => {
    if (scanResult) return; // Prevent double scans

    const cleanCode = ticketCodeStr.trim().toUpperCase();
    const match = cleanCode.match(/FFLOW-TKT-(\d+)/i);
    
    if (!match) {
      const errorMsg = 'Invalid code pattern. Expected FFLOW-TKT-{id}';
      playSound('error');
      triggerVibrate('error');
      setScanResult({
        success: false,
        studentName: 'Unknown Student',
        ticketCode: cleanCode,
        eventTitle: 'Invalid Ticket',
        message: errorMsg
      });
      
      // Auto-clear
      setTimeout(() => setScanResult(null), 3000);
      return;
    }

    const ticketId = match[1];
    
    // Execute backend check-in logic
    const res = onCheckIn(ticketId);

    if (res.success) {
      playSound('success');
      triggerVibrate('success');
      setScanResult({
        success: true,
        studentName: res.studentName,
        ticketCode: cleanCode,
        eventTitle: res.eventTitle,
        message: res.message
      });
    } else {
      playSound('error');
      triggerVibrate('error');
      setScanResult({
        success: false,
        studentName: res.studentName || 'Student Attendee',
        ticketCode: cleanCode,
        eventTitle: res.eventTitle || 'Event Entry',
        message: res.message
      });
    }

    // Auto-clear notification after 2.8 seconds
    setTimeout(() => {
      setScanResult(null);
    }, 2800);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processScan(manualCode);
    setManualCode('');
    setShowManualInput(false);
  };

  // Mock student list for instant simulator testing
  const mockStudents = [
    { id: '1', name: 'Alex Rivera', ticket: 'FFLOW-TKT-1' },
    { id: '2', name: 'David Chen', ticket: 'FFLOW-TKT-2' },
    { id: '3', name: 'Emily Watson', ticket: 'FFLOW-TKT-3' },
    { id: '4', name: 'Sophia Martinez', ticket: 'FFLOW-TKT-4' },
    { id: '5', name: 'Liam Harrison', ticket: 'FFLOW-TKT-5' },
    { id: '6', name: 'Olivia Bennett', ticket: 'FFLOW-TKT-6' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col md:flex-row text-white overflow-hidden font-body animate-fadeIn">
      
      {/* Sidebar Control Panel */}
      <div className="md:w-80 w-full bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 border-2 border-white flex items-center justify-center">
              <Camera className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="font-headline font-black text-xs uppercase tracking-wider text-orange-400">Scanner HUD</h2>
              <p className="text-[10px] text-slate-400 font-bold">Telemetry Access Staff</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 flex items-center justify-center transition-colors text-slate-300 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Mode switches */}
        <div className="bg-slate-950 p-3 rounded-xl border-2 border-slate-800 mb-6 space-y-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Scanner Input Mode</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => setUseRealCamera(false)}
              className={`py-2 rounded-lg font-black transition-all border-2 ${
                !useRealCamera 
                  ? 'bg-orange-500 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Simulator
            </button>
            <button
              onClick={() => setUseRealCamera(true)}
              className={`py-2 rounded-lg font-black transition-all border-2 ${
                useRealCamera 
                  ? 'bg-orange-500 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Real Camera
            </button>
          </div>
        </div>

        {cameraError && (
          <div className="mb-4 bg-rose-950/50 border-2 border-rose-800 text-rose-200 p-3 rounded-lg text-xs flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-bold">{cameraError}</span>
          </div>
        )}

        {/* Manual Code Input option */}
        <div className="mb-6 space-y-2">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="w-full flex items-center justify-center gap-2 border-2 border-slate-800 hover:border-slate-700 bg-slate-950/40 py-2.5 rounded-xl text-xs font-black text-slate-300 transition-colors"
          >
            <Keyboard className="w-4 h-4" />
            {showManualInput ? 'Hide Manual Input' : 'Type Ticket Code'}
          </button>

          {showManualInput && (
            <form onSubmit={handleManualSubmit} className="space-y-2.5 p-3 bg-slate-950 rounded-xl border-2 border-slate-800">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="FFLOW-TKT-5"
                className="w-full bg-slate-900 border-2 border-slate-700 px-3 py-2 text-xs rounded-lg text-white font-mono placeholder-slate-600 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 border-2 border-black text-white text-xs font-black py-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors uppercase tracking-wider"
              >
                Validate Pass
              </button>
            </form>
          )}
        </div>

        {/* Mock passes list to click and scan */}
        <div className="flex-grow flex flex-col justify-end">
          <div className="border-t-2 border-slate-800/80 pt-4 mt-4">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Quick Test Simulator</span>
              <span className="bg-orange-950/60 border border-orange-800/50 text-orange-400 px-2 py-0.5 rounded text-[8px] font-black">Debugger</span>
            </h4>
            <p className="text-[10px] text-slate-500 mb-3 font-semibold leading-relaxed">
              Click any mock pass to simulate a QR code scan event.
            </p>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {mockStudents.map(student => {
                const event = events.find(e => e.id === student.id);
                const isSecured = myTickets.includes(student.id);
                const isAlreadyCheckedIn = checkedInCounts[student.id] > 0;
                
                return (
                  <button
                    key={student.id}
                    onClick={() => processScan(student.ticket)}
                    className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800/50 border-2 border-slate-800 hover:border-slate-700 rounded-lg text-xs flex items-center justify-between group transition-all active:translate-y-px"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-200 group-hover:text-orange-400 truncate">{student.name}</span>
                        <span className="font-mono text-[9px] text-slate-500 shrink-0">{student.ticket}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 truncate uppercase font-bold">
                        Event: {event ? event.title : 'General'}
                      </p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 border ${
                      isAlreadyCheckedIn 
                        ? 'bg-rose-950/60 text-rose-400 border-rose-800/40' 
                        : isSecured 
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                          : 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                    }`}>
                      {isAlreadyCheckedIn ? 'Checked In' : isSecured ? 'RSVP' : 'No Pass'}
                    </span>
                  </button>
                );
              })}
              
              {/* Bad ticket simulator */}
              <button
                onClick={() => processScan('FFLOW-TKT-99')}
                className="w-full text-left p-2.5 bg-rose-950/20 hover:bg-rose-950/30 border-2 border-rose-900/60 rounded-lg text-xs flex items-center justify-between text-rose-200 transition-all active:translate-y-px"
              >
                <div className="space-y-0.5">
                  <span className="font-black">Simulate Invalid Code</span>
                  <p className="text-[9px] text-rose-400/70 uppercase font-bold">Ticket ID #99 (No RSVP)</p>
                </div>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Camera Video / Simulation area */}
      <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center p-6 select-none">
        
        {/* Real Video element */}
        {useRealCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : (
          /* Simulator UI background */
          <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden opacity-50 flex items-center justify-center">
            {/* Animated particles simulating digital scanning camera feed */}
            <div className="absolute w-[180%] h-[180%] bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-25 animate-pulse"></div>
            <div className="flex flex-col items-center gap-4 text-slate-500 z-10 text-center px-6">
              <RefreshCw className="w-12 h-12 stroke-[1.2] text-slate-700 animate-spin" style={{ animationDuration: '10s' }} />
              <div>
                <p className="text-xs font-black tracking-widest text-slate-400 uppercase">Telemetry Camera Feed Simulated</p>
                <p className="text-[10px] text-slate-600 mt-1 max-w-xs font-semibold">Click any mock student in the debugger panel to trigger access scans.</p>
              </div>
            </div>
          </div>
        )}

        {/* HUD Scanner Box frame overlay */}
        <div className="relative z-10 w-full max-w-sm aspect-square border-[4px] border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 bg-slate-950/20 backdrop-blur-[1px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          
          {/* Orange/Yellow corners */}
          <div className="absolute top-[-4px] left-[-4px] w-12 h-12 border-t-8 border-l-8 border-orange-500 rounded-tl-2xl"></div>
          <div className="absolute top-[-4px] right-[-4px] w-12 h-12 border-t-8 border-r-8 border-orange-500 rounded-tr-2xl"></div>
          <div className="absolute bottom-[-4px] left-[-4px] w-12 h-12 border-b-8 border-l-8 border-orange-500 rounded-bl-2xl"></div>
          <div className="absolute bottom-[-4px] right-[-4px] w-12 h-12 border-b-8 border-r-8 border-orange-500 rounded-br-2xl"></div>

          {/* Glowing orange laser sliding line */}
          <div className="absolute left-[3%] right-[3%] h-1.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_4px_#f97316] scanner-laser rounded-full z-20"></div>

          {/* Central target grid representation */}
          <div className="border border-orange-500/20 border-dashed rounded-xl w-3/4 h-3/4 flex flex-col items-center justify-center text-center opacity-45">
            <Camera className="w-8 h-8 text-orange-500 animate-pulse mb-2" />
            <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Awaiting Ticket Scan</span>
          </div>

          <div className="absolute bottom-6 flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl text-[10px] text-slate-400 font-black uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-blink shrink-0"></span>
            Scanbox active
          </div>
        </div>

        {/* Scan Results Full-Screen Screen Overlay */}
        {scanResult && (
          <div className={`absolute inset-0 z-40 flex flex-col items-center justify-center p-6 animate-fadeIn ${
            scanResult.success 
              ? 'bg-emerald-950/95 text-emerald-100' 
              : 'bg-rose-950/95 text-rose-100'
          }`}>
            
            <div className="max-w-md w-full text-center space-y-6 animate-scaleUp">
              
              {/* Graphic icon */}
              <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                {scanResult.success ? (
                  <CheckCircle2 className="w-20 h-20 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-20 h-20 text-rose-400" />
                )}
              </div>

              {/* Access Banner */}
              <div>
                <h3 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tight">
                  {scanResult.success ? 'Access Granted' : 'Access Denied'}
                </h3>
                <div className="h-1.5 w-20 bg-current mx-auto mt-3 rounded-full opacity-35"></div>
              </div>

              {/* Attendee Details - styled with thick black border and shadow */}
              <div className="bg-slate-950 border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4 text-left">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Attendee Name</p>
                    <p className="text-lg font-black text-white">{scanResult.studentName}</p>
                  </div>
                  <span className="font-mono text-xs bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-300 font-black">
                    {scanResult.ticketCode}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Event Registered</p>
                  <p className="text-sm font-bold uppercase text-white/90 line-clamp-1">{scanResult.eventTitle}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex gap-2 items-center text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                  <span className="text-white/85">{scanResult.message}</span>
                </div>
              </div>

              {/* Next/Dismiss info */}
              <p className="text-[11px] text-white/55 animate-pulse uppercase font-black tracking-wider">
                Scanning will resume in 3 seconds...
              </p>

              <button
                onClick={() => setScanResult(null)}
                className="mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover-lift press-down transition-colors"
              >
                Scan Next Pass
              </button>
            </div>
          </div>
        )}

        {/* Back and help buttons inside layout */}
        <div className="absolute top-6 left-6 z-30 hidden md:block">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-slate-900 border-2 border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-200 text-xs font-black px-4 py-2.5 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
            BACK TO DASHBOARD
          </button>
        </div>

        {/* Small operational notice footer */}
        <div className="absolute bottom-6 z-20 text-[10px] text-slate-500 text-center max-w-sm pointer-events-none px-6 font-bold">
          Device telemetry connected. Access validations logged automatically to server console.
        </div>
      </div>
    </div>
  );
}
