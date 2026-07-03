import React, { useState } from 'react';
import { Event } from '../../../types/event';
import { Calendar, MapPin, Users, Edit, Trash2, Settings, Send } from 'lucide-react';
import { EventStatusBadge } from './EventStatusBadge';

interface Props {
  event: Event;
  onEdit?: (e: Event) => void;
  onDelete?: (id: string) => void;
  onView?: (e: Event) => void;
  onPublish?: (e: Event) => void;
}

export const EventCard: React.FC<Props> = ({ event, onEdit, onDelete, onView, onPublish }) => {
  const [busy, setBusy] = useState(false);
  const isDraft = (event.status || '').toLowerCase() === 'draft';

  // Type-safe image fallback (fixes the `string | undefined` TS error)
  const safeImage = (): string => {
    return event.imageUrl && event.imageUrl.length > 0
      ? event.imageUrl
      : `https://picsum.photos/seed/${event.id}/400/200`;
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await onDelete?.(event.id);
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm(`Publish "${event.title}"?`)) return;
    setBusy(true);
    try {
      await onPublish?.(event);
    } finally {
      setBusy(false);
    }
  };

  const fillPct = ((event.registrationsCount ?? 0) / event.capacity) * 100;

  return (
    <div className="bg-surface border-4 border-on-background flex flex-col neo-shadow-sm hover:neo-shadow hover-lift transition-all group">
      {/* Banner */}
      <div className="relative h-40 bg-surface-variant border-b-4 border-on-background overflow-hidden">
        <img
          src={safeImage()}
          alt={event.title}
          className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-on-background/10 group-hover:bg-transparent transition-colors pointer-events-none" />
        <div className="absolute top-2 right-2">
          <EventStatusBadge status={event.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h4 className="font-extrabold text-xl uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h4>
        <p className="text-sm font-label-bold text-on-surface-variant line-clamp-2 mt-2 leading-relaxed">{event.description}</p>

        <div className="flex flex-wrap gap-2 mt-4 text-xs font-label-bold text-on-background uppercase">
          <span className="flex items-center gap-1.5 bg-surface-variant border-2 border-on-background px-2 py-1">
            <Calendar className="w-3.5 h-3.5 stroke-[2.5]" /> {event.date}
          </span>
          <span className="flex items-center gap-1.5 bg-surface-variant border-2 border-on-background px-2 py-1 truncate max-w-[150px]">
            <MapPin className="w-3.5 h-3.5 stroke-[2.5]" /> {event.location}
          </span>
        </div>

        <div className="mt-auto pt-6">
          {/* Capacity bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-label-bold uppercase mb-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 stroke-[2.5]" />
                {event.registrationsCount ?? 0} / {event.capacity}
              </span>
              <span>{fillPct.toFixed(0)}% FULL</span>
            </div>
            <div className="h-3 bg-surface-variant border-2 border-on-background w-full relative">
              <div
                className="absolute inset-y-0 left-0 bg-tertiary-fixed border-r-2 border-on-background transition-all duration-500"
                style={{ width: `${Math.min(fillPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {isDraft && (
              <button
                onClick={handlePublish}
                disabled={busy}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-label-bold uppercase py-2.5 border-2 border-on-background bg-primary-fixed text-on-primary-fixed hover:bg-primary transition-colors press-down disabled:opacity-50"
              >
                <Send className="w-4 h-4 stroke-[2.5]" /> PUBLISH
              </button>
            )}
            <button
              onClick={() => onView?.(event)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-label-bold uppercase py-2.5 border-2 border-on-background bg-primary-fixed text-on-primary-fixed hover:bg-primary transition-colors press-down"
            >
              <Settings className="w-4 h-4 stroke-[2.5]" /> MANAGE
            </button>
            <button
              onClick={() => onEdit?.(event)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-label-bold uppercase py-2.5 border-2 border-on-background bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary transition-colors press-down"
            >
              <Edit className="w-4 h-4 stroke-[2.5]" /> EDIT
            </button>
            <button
              onClick={handleDelete}
              disabled={busy}
              className="flex items-center justify-center px-4 text-xs font-label-bold uppercase py-2.5 border-2 border-on-background bg-error-container text-on-error-container hover:bg-error hover:text-on-error disabled:opacity-50 transition-colors press-down"
            >
              <Trash2 className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};