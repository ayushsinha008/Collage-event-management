import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { organizerApi } from '../../../services/organizerApi';
import { Event } from '../../../types/event';

interface ParsedRow {
  attendeeName: string;
  attendeeEmail: string;
  valid: boolean;
  reason?: string;
}

interface Props {
  events: Event[];
  defaultEventId?: string;
  onClose: () => void;
  onImported: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimal, dependency-free CSV parser: handles a header row + comma-separated
// name/email columns. Good enough for a simple bulk-import flow without
// pulling in a parsing library.
const parseCsv = (text: string): ParsedRow[] => {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
  const nameIdx = header.findIndex((h) => h.includes('name'));
  const emailIdx = header.findIndex((h) => h.includes('email'));
  const hasHeader = nameIdx !== -1 && emailIdx !== -1;
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const nCol = hasHeader ? nameIdx : 0;
  const eCol = hasHeader ? emailIdx : 1;

  return dataLines.map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const attendeeName = cols[nCol] || '';
    const attendeeEmail = cols[eCol] || '';
    if (!attendeeName || !attendeeEmail) {
      return { attendeeName, attendeeEmail, valid: false, reason: 'Missing name or email' };
    }
    if (!EMAIL_RE.test(attendeeEmail)) {
      return { attendeeName, attendeeEmail, valid: false, reason: 'Invalid email' };
    }
    return { attendeeName, attendeeEmail, valid: true };
  });
};

export const BulkImportModal: React.FC<Props> = ({ events, defaultEventId, onClose, onImported }) => {
  const [eventId, setEventId] = useState(defaultEventId ?? events[0]?.id ?? '');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setRows(parseCsv(String(reader.result ?? '')));
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const downloadTemplate = () => {
    const blob = new Blob(['name,email\nAlex Kumar,alex@college.edu\nSarah Lee,sarah@college.edu\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  const submit = async () => {
    if (!eventId || validRows.length === 0) return;
    setImporting(true);
    try {
      const res = await organizerApi.importRegistrations(eventId, validRows);
      setDone(res.imported);
      onImported();
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface border-4 border-on-background w-full max-w-2xl relative z-10 neo-shadow max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b-4 border-on-background bg-tertiary-fixed sticky top-0">
          <h3 className="font-extrabold uppercase text-xl flex items-center gap-2">
            <Upload className="w-5 h-5 stroke-[3]" /> Bulk Import Registrations
          </h3>
          <button onClick={onClose} className="border-2 border-on-background p-1 hover-lift press-down">
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {done !== null ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
              <p className="font-extrabold uppercase text-lg">{done} registration{done === 1 ? '' : 's'} imported</p>
              <button onClick={onClose} className="border-4 border-on-background bg-primary-fixed px-6 py-2.5 font-label-bold uppercase neo-shadow-sm hover-lift press-down">
                Done
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1">Import into event *</label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full border-4 border-on-background bg-background px-3 py-2 font-label-bold uppercase text-sm"
                >
                  {events.length === 0 && <option value="">No events available</option>}
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileInput.current?.click()}
                className="border-4 border-dashed border-on-background bg-background p-8 text-center cursor-pointer hover:bg-surface-variant transition-colors"
              >
                <FileText className="w-8 h-8 mx-auto mb-2 stroke-[2.5]" />
                <p className="font-label-bold uppercase text-sm">
                  {fileName ? fileName : 'Click to choose a CSV, or drag & drop it here'}
                </p>
                <p className="text-xs text-on-surface-variant mt-1 uppercase">Columns: name, email</p>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>

              <button onClick={downloadTemplate} className="flex items-center gap-2 text-xs font-label-bold uppercase text-primary hover:underline">
                <Download className="w-3.5 h-3.5" /> Download CSV template
              </button>

              {rows.length > 0 && (
                <div className="border-4 border-on-background">
                  <div className="flex items-center justify-between bg-surface-variant border-b-4 border-on-background px-4 py-2 text-xs font-extrabold uppercase">
                    <span>{rows.length} rows parsed</span>
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-primary"><CheckCircle2 className="w-3.5 h-3.5" /> {validRows.length} valid</span>
                      {invalidRows.length > 0 && (
                        <span className="flex items-center gap-1 text-error"><AlertCircle className="w-3.5 h-3.5" /> {invalidRows.length} skipped</span>
                      )}
                    </span>
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y-2 divide-on-background">
                    {rows.map((r, i) => (
                      <div key={i} className={`flex items-center justify-between gap-3 px-4 py-2 text-sm ${!r.valid ? 'bg-error-container/40' : ''}`}>
                        <span className="font-label-bold truncate">{r.attendeeName || '—'}</span>
                        <span className="text-on-surface-variant truncate">{r.attendeeEmail || '—'}</span>
                        {!r.valid && <span className="text-[10px] font-extrabold uppercase text-error shrink-0">{r.reason}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={submit}
                disabled={!eventId || validRows.length === 0 || importing}
                className="w-full border-4 border-on-background bg-primary-fixed text-on-primary-fixed py-3 font-extrabold uppercase neo-shadow-sm hover-lift press-down disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 stroke-[3]" />
                {importing ? 'Importing…' : `Import ${validRows.length || ''} Registration${validRows.length === 1 ? '' : 's'}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
