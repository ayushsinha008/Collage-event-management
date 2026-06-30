import React from 'react';
import { Event } from '../../types';

interface HostEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEvent: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    organizer: string;
    capacity: number;
    category: Event['category'];
    imageUrl: string;
  };
  setNewEvent: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    organizer: string;
    capacity: number;
    category: Event['category'];
    imageUrl: string;
  }>>;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function HostEventModal({
  isOpen,
  onClose,
  newEvent,
  setNewEvent,
  handleSubmit
}: HostEventModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="bg-white border-4 border-on-background w-full max-w-lg rounded-none overflow-hidden shadow-2xl relative z-10 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6 pb-4 border-b-4 border-on-background">
          <h3 className="font-headline-md text-2xl font-bold uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span> Host Event
          </h3>
          <button 
            onClick={onClose}
            className="border-2 border-on-background p-1 hover:bg-[#ffe353] hover-lift press-down flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-sm font-bold">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. GRAND TECH SUMMIT"
              className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background font-label-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide an overview of your event..."
              rows={2}
              className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
              <input
                type="text"
                required
                value={newEvent.date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                placeholder="e.g. OCT 30"
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time *</label>
              <input
                type="text"
                required
                value={newEvent.time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                placeholder="e.g. 04:00 PM"
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location *</label>
              <input
                type="text"
                required
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Aud. C"
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value as Event['category'] }))}
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background font-bold text-xs uppercase"
              >
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="academic">Academic</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Organizer</label>
              <input
                type="text"
                value={newEvent.organizer}
                onChange={(e) => setNewEvent(prev => ({ ...prev, organizer: e.target.value }))}
                placeholder="e.g. Music Club"
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Capacity *</label>
              <input
                type="number"
                required
                min={1}
                value={newEvent.capacity}
                onChange={(e) => setNewEvent(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Image URL (Optional)</label>
            <input
              type="url"
              value={newEvent.imageUrl}
              onChange={(e) => setNewEvent(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-white border-4 border-on-background p-2 text-sm focus:ring-0 focus:border-on-background"
            />
          </div>

          <div className="pt-4 border-t-4 border-on-background flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-on-background px-4 py-2 font-label-bold uppercase text-xs hover:bg-[#ffdad6] hover-lift press-down"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white border-4 border-on-background neo-shadow-sm px-6 py-2.5 font-label-bold uppercase text-xs hover-lift press-down"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
