import React from 'react';
import { Event } from '../../types';

interface NewEventShape {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  capacity: number;
  category: Event['category'];
  imageUrl: string;
}

interface HostEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEvent: NewEventShape;
  setNewEvent?: React.Dispatch<React.SetStateAction<NewEventShape>>;
  handleSubmit: (e: React.FormEvent) => void;
  mode?: 'create' | 'edit';
  onUpdate?: (e: React.FormEvent) => void;
}

export default function HostEventModal({
  isOpen,
  onClose,
  newEvent,
  setNewEvent,
  handleSubmit,
  mode = 'create',
  onUpdate,
}: HostEventModalProps) {
  if (!isOpen) return null;
  const isEdit = mode === 'edit';

  const safeSet = (updater: (prev: NewEventShape) => NewEventShape) => {
    if (setNewEvent) setNewEvent(updater);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white border-4 border-on-background w-full max-w-lg rounded-none overflow-hidden shadow-2xl relative z-10 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b-4 border-on-background">
          <h3 className="font-headline-md text-2xl font-bold uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">{isEdit ? 'edit' : 'add_circle'}</span>
            {isEdit ? 'Edit Event' : 'Host Event'}
          </h3>
          <button onClick={onClose} className="border-2 border-on-background p-1 hover:bg-[#ffe353] hover-lift press-down flex items-center justify-center">
            <span className="material-symbols-outlined text-sm font-bold">close</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            if (isEdit && onUpdate) onUpdate(e);
            else handleSubmit(e);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Title *</label>
            <input
              name="title" type="text" required
              defaultValue={newEvent.title}
              onChange={(e) => safeSet((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. GRAND TECH SUMMIT"
              className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background font-label-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              name="description"
              defaultValue={newEvent.description}
              onChange={(e) => safeSet((p) => ({ ...p, description: e.target.value }))}
              placeholder="Provide an overview of your event..." rows={2}
              className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
              <input
                name="date" type="text" required
                defaultValue={newEvent.date}
                onChange={(e) => safeSet((p) => ({ ...p, date: e.target.value }))}
                placeholder="e.g. OCT 30"
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time *</label>
              <input
                name="time" type="text" required
                defaultValue={newEvent.time}
                onChange={(e) => safeSet((p) => ({ ...p, time: e.target.value }))}
                placeholder="e.g. 04:00 PM"
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location *</label>
              <input
                name="location" type="text" required
                defaultValue={newEvent.location}
                onChange={(e) => safeSet((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Aud. C"
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
              <select
                name="category"
                defaultValue={newEvent.category as string}
                onChange={(e) => safeSet((p) => ({ ...p, category: e.target.value as Event['category'] }))}
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background font-bold text-xs uppercase"
              >
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="academic">Academic</option>
                <option value="other">Other</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Organizer</label>
              <input
                name="organizer" type="text"
                defaultValue={newEvent.organizer}
                onChange={(e) => safeSet((p) => ({ ...p, organizer: e.target.value }))}
                placeholder="e.g. Music Club"
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Capacity *</label>
              <input
                name="capacity" type="number" required min={1}
                defaultValue={newEvent.capacity}
                onChange={(e) => safeSet((p) => ({ ...p, capacity: Number(e.target.value) }))}
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Image URL (Optional)</label>
            <input
              name="imageUrl" type="url"
              defaultValue={newEvent.imageUrl}
              onChange={(e) => safeSet((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
            />
          </div>

          <div className="pt-4 border-t-4 border-on-background flex justify-end gap-3">
            <button type="button" onClick={onClose} className="border-2 border-on-background px-4 py-2 font-label-bold uppercase text-xs hover:bg-[#ffdad6] hover-lift press-down">
              Cancel
            </button>
            <button type="submit" className="bg-primary text-white border-4 border-on-background neo-shadow-sm px-6 py-2.5 font-label-bold uppercase text-xs hover-lift press-down">
              {isEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}