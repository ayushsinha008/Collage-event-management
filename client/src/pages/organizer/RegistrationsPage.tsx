import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRegistrations } from '../../hooks/useRegistrations';
import { useOrganizerEvents } from '../../hooks/useOrganizerEvents';
import { RegistrationTable } from '../../components/organizer/registrations/RegistrationTable';
import { ExportButton } from '../../components/organizer/registrations/ExportButton';
import { BulkImportModal } from '../../components/organizer/registrations/BulkImportModal';
import { Search, Upload } from 'lucide-react';

export const RegistrationsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const eventId = params.get('eventId') || undefined;
  const { registrations, loading, search, setSearch, checkIn, refetch } = useRegistrations(eventId);
  const { events } = useOrganizerEvents();

  const [showImport, setShowImport] = useState(false);

  // Support the Dashboard's "Bulk Import" quick action:
  // /organizer/registrations?import=true
  useEffect(() => {
    if (params.get('import') === 'true') {
      setShowImport(true);
      const next = new URLSearchParams(params);
      next.delete('import');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between flex-wrap gap-6 border-l-8 border-primary pl-6 py-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>Registrations</h1>
          <p className="text-on-surface-variant mt-2 font-label-bold text-sm tracking-widest uppercase">View and manage event attendees.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
          <div className="flex flex-1 items-center border-4 border-on-background bg-background neo-shadow-sm focus-within:neo-shadow transition-shadow">
            <div className="pl-3 py-2 bg-surface-variant border-r-4 border-on-background">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH ATTENDEES..."
              className="flex-1 px-4 py-2 font-label-bold text-sm bg-transparent focus:outline-none uppercase min-w-[200px]"
            />
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center justify-center gap-2 text-sm font-label-bold px-6 py-2.5 border-4 border-on-background bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary hover-lift transition-all neo-shadow-sm uppercase"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" /> IMPORT CSV
          </button>
          {eventId && <ExportButton eventId={eventId} />}
        </div>
      </div>

      <RegistrationTable
        registrations={registrations}
        loading={loading}
        onCheckIn={checkIn}
      />

      {showImport && (
        <BulkImportModal
          events={events}
          defaultEventId={eventId}
          onClose={() => setShowImport(false)}
          onImported={refetch}
        />
      )}
    </div>
  );
};
