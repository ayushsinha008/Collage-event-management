import React from 'react';
import { Download } from 'lucide-react';
import { organizerApi } from '../../../services/organizerApi';

export const ExportButton: React.FC<{ eventId: string; label?: string }> = ({ eventId, label = 'EXPORT CSV' }) => {
  const handleExport = async () => {
    const blob = await organizerApi.exportRegistrations(eventId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center justify-center gap-2 text-sm font-label-bold px-6 py-2.5 border-4 border-on-background bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed hover-lift transition-all neo-shadow-sm uppercase"
    >
      <Download className="w-4 h-4 stroke-[2.5]" /> {label}
    </button>
  );
};