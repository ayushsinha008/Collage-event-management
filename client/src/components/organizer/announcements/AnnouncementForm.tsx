import React, { useState } from 'react';
import { Send, Calendar } from 'lucide-react';
import { Announcement } from '../../../types/organizer';
import { organizerApi } from '../../../services/organizerApi';

interface Props {
  events: { id: string; title: string }[];
  onCreated?: (a: Announcement) => void;
}

export const AnnouncementForm: React.FC<Props> = ({ events, onCreated }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [eventId, setEventId] = useState('');
  const [audience, setAudience] = useState<'all' | 'event-attendees' | 'vip'>('all');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const created = await organizerApi.createAnnouncement({
        title,
        message,
        eventId: eventId || undefined,
        audience,
        scheduledAt: scheduledAt || undefined,
        createdBy: 'me',
      });
      await organizerApi.sendAnnouncement(created.id);
      onCreated?.(created);
      setTitle('');
      setMessage('');
      setEventId('');
      setScheduledAt('');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-surface border-4 border-on-background p-6 neo-shadow space-y-5 h-fit">
      <h3 className="font-extrabold text-2xl uppercase tracking-wide border-b-4 border-on-background pb-4">New Announcement</h3>

      <div className="space-y-4">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ANNOUNCEMENT TITLE"
          className="w-full border-4 border-on-background bg-background px-4 py-3 font-label-bold text-sm uppercase focus:outline-none focus:neo-shadow-sm transition-shadow"
        />

        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="WRITE YOUR MESSAGE..."
          className="w-full border-4 border-on-background bg-background px-4 py-3 font-label-bold text-sm focus:outline-none focus:neo-shadow-sm transition-shadow resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative border-4 border-on-background bg-background focus-within:neo-shadow-sm transition-shadow">
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full px-3 py-2 font-label-bold text-sm bg-transparent uppercase outline-none appearance-none cursor-pointer"
          >
            <option value="">ALL EVENTS</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative border-4 border-on-background bg-background focus-within:neo-shadow-sm transition-shadow">
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as any)}
            className="w-full px-3 py-2 font-label-bold text-sm bg-transparent uppercase outline-none appearance-none cursor-pointer"
          >
            <option value="all">ALL ATTENDEES</option>
            <option value="event-attendees">EVENT ATTENDEES</option>
            <option value="vip">VIP ONLY</option>
          </select>
        </div>

        <div className="flex items-center border-4 border-on-background bg-background focus-within:neo-shadow-sm transition-shadow">
          <div className="px-3 py-2 bg-secondary-fixed border-r-4 border-on-background">
            <Calendar className="w-5 h-5 stroke-[2.5]" />
          </div>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="flex-1 px-3 py-2 font-label-bold text-sm bg-transparent focus:outline-none uppercase"
          />
        </div>
      </div>

      <button
        disabled={sending}
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-primary-fixed hover:bg-primary-container text-on-primary-fixed font-extrabold text-lg py-4 border-4 border-on-background neo-shadow-sm hover-lift uppercase transition-all disabled:opacity-50 mt-6"
      >
        <Send className="w-6 h-6 stroke-[3]" /> {sending ? 'SENDING...' : 'SEND ANNOUNCEMENT'}
      </button>
    </form>
  );
};