import React, { useEffect, useState } from 'react';
import { Send, Calendar, ChevronDown } from 'lucide-react';
import { Announcement } from '../../../types/organizer';
import { organizerApi } from '../../../services/organizerApi';

interface Props {
  events: { id: string; title: string }[];
  onCreated?: (a: Announcement) => void;
}

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="block font-label-bold text-xs uppercase tracking-widest text-on-surface-variant mb-2">
    {children}
  </span>
);

const SelectShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative border-4 border-on-background bg-background focus-within:neo-shadow-sm transition-shadow">
    {children}
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-[3]" />
  </div>
);

export const AnnouncementForm: React.FC<Props> = ({ events, onCreated }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [eventId, setEventId] = useState('');
  const [audience, setAudience] = useState<'all' | 'event-attendees' | 'vip'>('event-attendees');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId && events.length > 0) {
      setEventId(events[0].id);
    }
  }, [events, eventId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!eventId) {
      setError('Create an event first, then pick it here.');
      return;
    }

    setSending(true);
    try {
      const created = await organizerApi.createAnnouncement({
        title,
        message,
        eventId,
        audience,
        scheduledAt: scheduledAt || undefined,
        createdBy: 'me',
      });

      const isFutureSchedule = scheduledAt && new Date(scheduledAt) > new Date();
      if (!isFutureSchedule) {
        await organizerApi.sendAnnouncement(created.id);
      }

      onCreated?.(created);
      setTitle('');
      setMessage('');
      setScheduledAt('');
      if (events.length > 0) setEventId(events[0].id);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to send announcement.');
    } finally {
      setSending(false);
    }
  };

  const isFutureSchedule = !!(scheduledAt && new Date(scheduledAt) > new Date());

  return (
    <form onSubmit={submit} className="bg-surface border-4 border-on-background p-6 neo-shadow space-y-5 h-fit">
      <h3 className="font-extrabold text-2xl uppercase tracking-wide border-b-4 border-on-background pb-4">
        New Announcement
      </h3>

      {events.length === 0 && (
        <p className="text-sm font-label-bold uppercase tracking-wide text-on-surface-variant border-2 border-dashed border-on-background bg-surface-variant p-4">
          No events yet — create an event first to send announcements.
        </p>
      )}

      <div className="space-y-4">
        <div>
          <FieldLabel>Announcement Title *</FieldLabel>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Gates open at 5 PM"
            className="w-full border-4 border-on-background bg-background px-4 py-3 font-label-bold text-sm focus:outline-none focus:neo-shadow-sm transition-shadow"
          />
        </div>

        <div>
          <FieldLabel>Message *</FieldLabel>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message to attendees..."
            className="w-full border-4 border-on-background bg-background px-4 py-3 font-label-bold text-sm focus:outline-none focus:neo-shadow-sm transition-shadow resize-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <FieldLabel>Target Event *</FieldLabel>
          <SelectShell>
            <select
              required
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              disabled={events.length === 0}
              className="w-full px-4 py-3 pr-10 font-label-bold text-sm bg-transparent outline-none appearance-none cursor-pointer disabled:opacity-50"
            >
              {events.length === 0 ? (
                <option value="">No events available</option>
              ) : (
                events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))
              )}
            </select>
          </SelectShell>
        </div>

        <div>
          <FieldLabel>Audience</FieldLabel>
          <SelectShell>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof audience)}
              className="w-full px-4 py-3 pr-10 font-label-bold text-sm bg-transparent outline-none appearance-none cursor-pointer"
            >
              <option value="event-attendees">Event Attendees</option>
              <option value="all">All Attendees</option>
              <option value="vip">VIP Only</option>
            </select>
          </SelectShell>
        </div>

        <div>
          <FieldLabel>Schedule (optional)</FieldLabel>
          <div className="flex items-stretch border-4 border-on-background bg-background focus-within:neo-shadow-sm transition-shadow">
            <div className="flex items-center px-4 bg-secondary-fixed border-r-4 border-on-background shrink-0">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="flex-1 min-w-0 px-4 py-3 font-label-bold text-sm bg-transparent focus:outline-none normal-case"
            />
          </div>
          <p className="mt-2 text-xs font-label-bold text-on-surface-variant uppercase tracking-wide">
            Leave empty to send immediately
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm font-label-bold uppercase tracking-wide text-on-error-container bg-error-container border-2 border-on-background px-4 py-3">
          {error}
        </p>
      )}

      <button
        disabled={sending || events.length === 0}
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-primary-fixed hover:bg-primary-container text-on-primary-fixed font-extrabold text-lg py-4 border-4 border-on-background neo-shadow-sm hover-lift uppercase transition-all disabled:opacity-50"
      >
        <Send className="w-6 h-6 stroke-[3]" />
        {sending
          ? 'Working...'
          : isFutureSchedule
            ? 'Schedule Announcement'
            : 'Send Announcement'}
      </button>
    </form>
  );
};
