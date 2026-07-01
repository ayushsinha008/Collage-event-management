import React from 'react';
import { Event } from '../../types';

interface TicketScannerProps {
  events: Event[];
  myTickets: string[];
  scanCode: string;
  setScanCode: (code: string) => void;
  scanResult: {
    success: boolean;
    message: string;
    eventTitle?: string;
  } | null;
  setScanResult: (result: any) => void;
  handleScanSubmit: (e: React.FormEvent) => void;
}

export default function TicketScanner({
  events,
  myTickets,
  scanCode,
  setScanCode,
  scanResult,
  setScanResult,
  handleScanSubmit
}: TicketScannerProps) {
  return (
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
                    type="button"
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
  );
}
