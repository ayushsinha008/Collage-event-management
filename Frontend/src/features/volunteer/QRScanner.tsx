import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle2, AlertTriangle, Keyboard } from 'lucide-react';
import { normalizeTicketScan } from '../../utils/ticketScan';
import {
  captureStreamFromScanner,
  stopCameraTracksNow,
  stopHtml5QrcodeScanner,
} from '../../utils/cameraCleanup';

const SCANNER_ELEMENT_ID = 'volunteer-qr-scanner';

async function pickCameraId(): Promise<string | MediaTrackConstraints> {
  try {
    const cameras = await Html5Qrcode.getCameras();
    if (cameras.length === 0) return { facingMode: 'user' };
    const back = cameras.find((c) => /back|rear|environment/i.test(c.label));
    return back?.id ?? cameras[0].id;
  } catch {
    return { facingMode: 'user' };
  }
}

interface QRScannerProps {
  onCheckIn: (ticketId: string) => Promise<{ success: boolean; message: string; studentName: string; eventTitle: string }>;
  onClose: () => void;
}

export default function QRScanner({ onCheckIn, onClose }: QRScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);

  const [scanResult, setScanResult] = useState<{
    success: boolean;
    studentName: string;
    ticketCode: string;
    eventTitle: string;
    message: string;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const sessionRef = useRef(0);
  const processingRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);
  const onCheckInRef = useRef(onCheckIn);
  const onCloseRef = useRef(onClose);
  onCheckInRef.current = onCheckIn;
  onCloseRef.current = onClose;

  const clearResumeTimer = () => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const shutdownCamera = useCallback(async () => {
    sessionRef.current += 1;
    stopCameraTracksNow();

    const scanner = scannerRef.current;
    scannerRef.current = null;

    await stopHtml5QrcodeScanner(scanner);
    setCameraReady(false);
  }, []);

  const handleClose = useCallback(async () => {
    clearResumeTimer();
    processingRef.current = false;
    setCameraActive(false);
    stopCameraTracksNow();
    await shutdownCamera();
    stopCameraTracksNow();
    onCloseRef.current();
  }, [shutdownCamera]);

  const playSound = (type: 'success' | 'error') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // optional
    }
  };

  const processScan = useCallback(
    async (ticketCodeStr: string) => {
      if (processingRef.current) return;

      const cleanCode = normalizeTicketScan(ticketCodeStr);
      if (!cleanCode) return;

      processingRef.current = true;
      setCameraActive(false);
      await shutdownCamera();

      const res = await onCheckInRef.current(cleanCode);

      if (res.success) {
        playSound('success');
        setScanResult({
          success: true,
          studentName: res.studentName,
          ticketCode: cleanCode,
          eventTitle: res.eventTitle,
          message: res.message,
        });
      } else {
        playSound('error');
        setScanResult({
          success: false,
          studentName: res.studentName || 'Student Attendee',
          ticketCode: cleanCode,
          eventTitle: res.eventTitle || 'Event Entry',
          message: res.message,
        });
      }

      processingRef.current = false;

      clearResumeTimer();
      resumeTimerRef.current = window.setTimeout(() => {
        resumeTimerRef.current = null;
        setScanResult(null);
        setCameraActive(true);
      }, 2800);
    },
    [shutdownCamera]
  );

  const resumeScanning = useCallback(() => {
    clearResumeTimer();
    processingRef.current = false;
    setScanResult(null);
    setCameraActive(true);
  }, []);

  useEffect(() => {
    if (!cameraActive || scanResult) return;

    if (!window.isSecureContext) {
      setCameraError('Camera requires HTTPS or localhost. Use manual ticket entry.');
      return;
    }

    const session = sessionRef.current + 1;
    sessionRef.current = session;
    let cancelled = false;

    const start = async () => {
      setCameraError(null);
      setCameraReady(false);

      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
      if (cancelled || session !== sessionRef.current) return;

      const host = document.getElementById(SCANNER_ELEMENT_ID);
      if (!host) return;

      let scanner: Html5Qrcode | null = null;

      try {
        scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false });
        scannerRef.current = scanner;

        const cameraId = await pickCameraId();
        if (cancelled || session !== sessionRef.current) return;

        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (!processingRef.current && session === sessionRef.current) {
              void processScan(decodedText);
            }
          },
          () => {}
        );

        if (!cancelled && session === sessionRef.current) {
          captureStreamFromScanner(SCANNER_ELEMENT_ID);
          setCameraReady(true);
        }
      } catch (err) {
        console.error('Camera start failed:', err);
        if (!cancelled && session === sessionRef.current) {
          setCameraError(
            'Could not start camera. Allow permission in browser settings, or use manual entry.'
          );
        }
        if (scanner) {
          stopCameraTracksNow();
          await stopHtml5QrcodeScanner(scanner);
          if (scannerRef.current === scanner) scannerRef.current = null;
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopCameraTracksNow();
      void (async () => {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        await stopHtml5QrcodeScanner(scanner);
        stopCameraTracksNow();
        setCameraReady(false);
      })();
    };
  }, [cameraActive, scanResult, processScan]);

  useEffect(() => {
    return () => {
      clearResumeTimer();
      stopCameraTracksNow();
      void shutdownCamera();
    };
  }, [shutdownCamera]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    void processScan(manualCode);
    setManualCode('');
    setShowManualInput(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col lg:flex-row text-white overflow-hidden font-body">
      <div className="lg:w-80 w-full bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-6 flex flex-col shrink-0 overflow-y-auto">
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
            type="button"
            onClick={() => void handleClose()}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 flex items-center justify-center transition-colors text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {cameraError && (
          <div className="mb-4 bg-rose-950/50 border-2 border-rose-800 text-rose-200 p-3 rounded-lg text-xs flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-bold">{cameraError}</span>
          </div>
        )}

        <div className="mb-6 space-y-2">
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="w-full flex items-center justify-center gap-2 border-2 border-slate-800 hover:border-slate-700 bg-slate-950/40 py-2.5 rounded-xl text-xs font-black text-slate-300"
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
                placeholder="TKT-ABC123-4567"
                className="w-full bg-slate-900 border-2 border-slate-700 px-3 py-2 text-xs rounded-lg text-white font-mono placeholder-slate-600 focus:outline-none focus:border-orange-500"
                autoComplete="off"
              />
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 border-2 border-black text-white text-xs font-black py-2 rounded-lg uppercase"
              >
                Validate Pass
              </button>
            </form>
          )}
        </div>

        <p className="mt-auto text-[10px] text-slate-500 font-semibold">
          {cameraReady
            ? 'Camera live — point at the QR on the student ticket.'
            : cameraActive
              ? 'Starting camera… allow permission if asked.'
              : 'Camera paused.'}
        </p>
      </div>

      <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center p-4 lg:p-8 min-h-[360px]">
        {!scanResult && (
          <div className="relative w-full max-w-md">
            <div className="rounded-2xl border-4 border-orange-500 overflow-hidden bg-black min-h-[320px]">
              <div
                id={SCANNER_ELEMENT_ID}
                className="w-full min-h-[320px] [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover [&_canvas]:!hidden"
              />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/90 border border-slate-700 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  cameraReady ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500 animate-pulse'
                }`}
              />
              {cameraReady ? 'Scanning…' : cameraActive ? 'Starting camera…' : 'Paused'}
            </div>
          </div>
        )}

        {scanResult && (
          <div
            className={`absolute inset-0 z-40 flex flex-col items-center justify-center p-6 ${
              scanResult.success ? 'bg-emerald-950/95' : 'bg-rose-950/95'
            }`}
          >
            <div className="max-w-md w-full text-center space-y-6">
              {scanResult.success ? (
                <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto" />
              ) : (
                <AlertTriangle className="w-20 h-20 text-rose-400 mx-auto" />
              )}
              <h3 className="font-headline text-3xl font-black uppercase">
                {scanResult.success ? 'Access Granted' : 'Access Denied'}
              </h3>
              <div className="bg-slate-950 border-4 border-black p-6 rounded-2xl text-left space-y-3">
                <p className="text-lg font-black">{scanResult.studentName}</p>
                <p className="text-sm font-bold uppercase text-white/80">{scanResult.eventTitle}</p>
                <p className="text-xs font-mono text-slate-400">{scanResult.ticketCode}</p>
                <p className="text-xs">{scanResult.message}</p>
              </div>
              <button
                type="button"
                onClick={resumeScanning}
                className="px-6 py-2.5 bg-orange-500 border-2 border-black rounded-xl text-xs font-black uppercase"
              >
                Scan Next Pass
              </button>
            </div>
          </div>
        )}

        <div className="absolute top-6 left-6 z-30">
          <button
            type="button"
            onClick={() => void handleClose()}
            className="flex items-center gap-2 bg-slate-900 border-2 border-slate-800 text-slate-200 text-xs font-black px-4 py-2.5 rounded-xl"
          >
            <X className="w-4 h-4" />
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  );
}
