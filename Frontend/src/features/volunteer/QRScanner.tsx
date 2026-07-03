import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle2, AlertTriangle, Keyboard } from 'lucide-react';

const SCANNER_ELEMENT_ID = 'volunteer-qr-scanner';

interface QRScannerProps {
  onCheckIn: (ticketId: string) => Promise<{ success: boolean; message: string; studentName: string; eventTitle: string }>;
  onClose: () => void;
}

export default function QRScanner({ onCheckIn, onClose }: QRScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  const [scanResult, setScanResult] = useState<{
    success: boolean;
    studentName: string;
    ticketCode: string;
    eventTitle: string;
    message: string;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const scanBlockedRef = useRef(false);
  const onCheckInRef = useRef(onCheckIn);
  onCheckInRef.current = onCheckIn;

  const playSound = (type: 'success' | 'error') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      if (type === 'success') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } else {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // audio optional
    }
  };

  const triggerVibrate = (type: 'success' | 'error') => {
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [100] : [200, 100, 200]);
    }
  };

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // ignore cleanup errors
    }
    scannerRef.current = null;
  }, []);

  const processScan = useCallback(async (ticketCodeStr: string) => {
    if (processingRef.current || scanBlockedRef.current) return;

    const cleanCode = ticketCodeStr.trim();
    if (!cleanCode) return;

    processingRef.current = true;
    scanBlockedRef.current = true;
    await stopScanner();
    setScanning(false);

    const res = await onCheckInRef.current(cleanCode);

    if (res.success) {
      playSound('success');
      triggerVibrate('success');
      setScanResult({
        success: true,
        studentName: res.studentName,
        ticketCode: cleanCode,
        eventTitle: res.eventTitle,
        message: res.message,
      });
    } else {
      playSound('error');
      triggerVibrate('error');
      setScanResult({
        success: false,
        studentName: res.studentName || 'Student Attendee',
        ticketCode: cleanCode,
        eventTitle: res.eventTitle || 'Event Entry',
        message: res.message,
      });
    }

    processingRef.current = false;

    setTimeout(() => {
      setScanResult(null);
      scanBlockedRef.current = false;
      setScanning(true);
    }, 2800);
  }, [stopScanner]);

  const resumeScanning = useCallback(() => {
    setScanResult(null);
    scanBlockedRef.current = false;
    setScanning(true);
  }, []);

  useEffect(() => {
    if (!scanning || scanBlockedRef.current) return;

    let cancelled = false;
    setCameraError(null);

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
          (decodedText) => {
            if (!cancelled) processScan(decodedText);
          },
          () => {}
        );
      } catch (err) {
        console.error('Camera/scanner failed:', err);
        if (!cancelled) {
          setCameraError('Camera access failed. Use manual ticket entry below.');
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [scanning, processScan, stopScanner]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processScan(manualCode);
    setManualCode('');
    setShowManualInput(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col md:flex-row text-white overflow-hidden font-body animate-fadeIn">

      <div className="md:w-80 w-full bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 border-2 border-white flex items-center justify-center">
              <Camera className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="font-headline font-black text-xs uppercase tracking-wider text-orange-400">Scanner HUD</h2>
              <p className="text-[10px] text-slate-400 font-bold">Gate Check-In</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 flex items-center justify-center transition-colors text-slate-300 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border-2 border-slate-800 mb-6">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">How to scan</p>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            Point the camera at the student&apos;s ticket QR code. You can also type the ticket code (TKT-...) or QR token manually.
          </p>
        </div>

        {cameraError && (
          <div className="mb-4 bg-rose-950/50 border-2 border-rose-800 text-rose-200 p-3 rounded-lg text-xs flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-bold">{cameraError}</span>
          </div>
        )}

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
                placeholder="TKT-ABC123-4567 or QR UUID"
                className="w-full bg-slate-900 border-2 border-slate-700 px-3 py-2 text-xs rounded-lg text-white font-mono placeholder-slate-600 focus:outline-none focus:border-orange-500"
                autoComplete="off"
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

        <div className="mt-auto border-t-2 border-slate-800/80 pt-4">
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            Each ticket can only be checked in once. Duplicate scans will be rejected by the server.
          </p>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center p-6 select-none">
        <div
          id={SCANNER_ELEMENT_ID}
          className={`absolute inset-0 w-full h-full ${scanning && !scanResult ? 'opacity-90' : 'opacity-0 pointer-events-none'}`}
        />

        {!scanning && !scanResult && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Processing scan...</p>
          </div>
        )}

        <div className="relative z-10 w-full max-w-sm aspect-square border-[4px] border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 bg-slate-950/20 backdrop-blur-[1px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] pointer-events-none">
          <div className="absolute top-[-4px] left-[-4px] w-12 h-12 border-t-8 border-l-8 border-orange-500 rounded-tl-2xl"></div>
          <div className="absolute top-[-4px] right-[-4px] w-12 h-12 border-t-8 border-r-8 border-orange-500 rounded-tr-2xl"></div>
          <div className="absolute bottom-[-4px] left-[-4px] w-12 h-12 border-b-8 border-l-8 border-orange-500 rounded-bl-2xl"></div>
          <div className="absolute bottom-[-4px] right-[-4px] w-12 h-12 border-b-8 border-r-8 border-orange-500 rounded-br-2xl"></div>

          <div className="absolute left-[3%] right-[3%] h-1.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_4px_#f97316] scanner-laser rounded-full z-20"></div>

          <div className="border border-orange-500/20 border-dashed rounded-xl w-3/4 h-3/4 flex flex-col items-center justify-center text-center opacity-45">
            <Camera className="w-8 h-8 text-orange-500 animate-pulse mb-2" />
            <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Awaiting Ticket Scan</span>
          </div>

          <div className="absolute bottom-6 flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl text-[10px] text-slate-400 font-black uppercase tracking-wider">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${scanning && !scanResult ? 'bg-orange-500 animate-blink' : 'bg-slate-600'}`}></span>
            {scanning && !scanResult ? 'Scanbox active' : 'Paused'}
          </div>
        </div>

        {scanResult && (
          <div className={`absolute inset-0 z-40 flex flex-col items-center justify-center p-6 animate-fadeIn ${
            scanResult.success
              ? 'bg-emerald-950/95 text-emerald-100'
              : 'bg-rose-950/95 text-rose-100'
          }`}>
            <div className="max-w-md w-full text-center space-y-6 animate-scaleUp">
              <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                {scanResult.success ? (
                  <CheckCircle2 className="w-20 h-20 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-20 h-20 text-rose-400" />
                )}
              </div>

              <div>
                <h3 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tight">
                  {scanResult.success ? 'Access Granted' : 'Access Denied'}
                </h3>
                <div className="h-1.5 w-20 bg-current mx-auto mt-3 rounded-full opacity-35"></div>
              </div>

              <div className="bg-slate-950 border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4 text-left">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Attendee Name</p>
                    <p className="text-lg font-black text-white">{scanResult.studentName}</p>
                  </div>
                  <span className="font-mono text-xs bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-300 font-black max-w-[120px] truncate">
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

              <p className="text-[11px] text-white/55 animate-pulse uppercase font-black tracking-wider">
                Scanning will resume in 3 seconds...
              </p>

              <button
                onClick={resumeScanning}
                className="mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover-lift press-down transition-colors"
              >
                Scan Next Pass
              </button>
            </div>
          </div>
        )}

        <div className="absolute top-6 left-6 z-30 hidden md:block">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-slate-900 border-2 border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-black px-4 py-2.5 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  );
}
