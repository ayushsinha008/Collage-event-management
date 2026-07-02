import React from 'react';
import { Registration } from '../../../types/organizer';
import { RegistrationRow } from './RegistrationRow';

interface Props {
  registrations: Registration[];
  onCheckIn?: (code: string) => void;
  loading?: boolean;
}

export const RegistrationTable: React.FC<Props> = ({ registrations, onCheckIn, loading }) => {
  if (loading) {
    return (
      <div className="bg-surface border-4 border-on-background p-12 text-center neo-shadow">
        <div className="animate-pulse font-label-bold text-on-surface-variant uppercase tracking-widest">Loading registrations...</div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="bg-surface border-4 border-on-background p-12 text-center neo-shadow">
        <p className="font-label-bold text-on-surface-variant uppercase tracking-widest">No registrations found.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border-4 border-on-background overflow-hidden neo-shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-variant border-b-4 border-on-background">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-widest border-r-4 border-on-background">Attendee</th>
              <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-widest border-r-4 border-on-background">Ticket</th>
              <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-widest border-r-4 border-on-background">Registered</th>
              <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-widest border-r-4 border-on-background">Status</th>
              <th className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-widest border-r-4 border-on-background">Check-in</th>
              <th className="px-6 py-4 text-right text-sm font-extrabold uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r, index) => (
              <RegistrationRow key={r.id} reg={r} onCheckIn={onCheckIn} isLast={index === registrations.length - 1} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};