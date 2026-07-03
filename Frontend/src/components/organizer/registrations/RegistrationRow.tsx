import React from 'react';
import { Registration } from '../../../types/organizer';
import { Check, Mail, CalendarDays } from 'lucide-react';

interface Props {
  reg: Registration;
  onCheckIn?: (code: string) => void;
  isLast?: boolean;
  showEventColumn?: boolean;
}

export const RegistrationRow: React.FC<Props> = ({ reg, onCheckIn, isLast, showEventColumn = true }) => {
  const statusColor: Record<string, string> = {
    confirmed: 'bg-primary-container text-on-primary-container',
    waitlist: 'bg-secondary-container text-on-secondary-container',
    cancelled: 'bg-error-container text-on-error-container',
  };

  return (
    <tr className={`bg-background hover:bg-surface-variant transition-colors group ${!isLast ? 'border-b-4 border-on-background' : ''}`}>
      <td className="px-6 py-4 border-r-4 border-on-background">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-tertiary-fixed border-4 border-on-background flex items-center justify-center font-extrabold text-xl shadow-[2px_2px_0_0_#000] overflow-hidden">
            {reg.attendeeAvatarUrl ? (
              <img src={reg.attendeeAvatarUrl} alt={reg.attendeeName} className="w-full h-full object-cover" />
            ) : (
              reg.attendeeName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-extrabold text-sm uppercase tracking-wide group-hover:text-primary transition-colors">{reg.attendeeName}</p>
            <p className="text-xs font-label-bold text-on-surface-variant flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 stroke-[2.5]" /> {reg.attendeeEmail}
            </p>
          </div>
        </div>
      </td>
      {showEventColumn && (
        <td className="px-6 py-4 border-r-4 border-on-background">
          <span className="inline-flex items-center gap-1.5 max-w-[220px] font-label-bold text-xs uppercase bg-tertiary-fixed text-on-tertiary-fixed border-2 border-on-background px-3 py-1.5 line-clamp-2">
            <CalendarDays className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            {reg.eventTitle || 'Unknown Event'}
          </span>
        </td>
      )}
      <td className="px-6 py-4 border-r-4 border-on-background">
        <span className="font-mono text-xs font-extrabold bg-surface px-2 py-1 border-2 border-on-background whitespace-nowrap">{reg.ticketCode}</span>
      </td>
      <td className="px-6 py-4 border-r-4 border-on-background font-label-bold text-sm">
        {new Date(reg.registeredAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 border-r-4 border-on-background">
        <span className={`px-3 py-1.5 text-xs font-label-bold uppercase border-2 border-on-background inline-block ${statusColor[reg.status] || statusColor.confirmed}`}>
          {reg.status}
        </span>
      </td>
      <td className="px-6 py-4 border-r-4 border-on-background">
        {reg.checkedIn ? (
          <span className="flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed border-2 border-on-background px-3 py-1.5 w-fit font-label-bold text-xs uppercase">
            <Check className="w-4 h-4 stroke-[3]" /> CHECKED IN
          </span>
        ) : (
          <span className="font-label-bold text-xs text-on-surface-variant uppercase px-3 py-1.5 border-2 border-transparent">PENDING</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        {!reg.checkedIn && reg.status === 'confirmed' && (
          <button
            onClick={() => onCheckIn?.(reg.ticketCode)}
            className="text-xs font-label-bold px-4 py-2 border-4 border-on-background bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary hover-lift uppercase transition-all shadow-[2px_2px_0_0_#000]"
          >
            CHECK IN
          </button>
        )}
      </td>
    </tr>
  );
};