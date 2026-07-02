import React from 'react';
import { Announcement } from '../../../types/organizer';
import { AnnouncementCard } from './AnnouncementCard';

interface Props {
  announcements: Announcement[];
  onDelete?: (id: string) => void;
}

export const AnnouncementList: React.FC<Props> = ({ announcements, onDelete }) => (
  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
    {announcements.length === 0 && (
      <p className="font-label-bold text-on-surface-variant uppercase tracking-widest text-center py-10 border-4 border-dashed border-on-background bg-surface-variant">No announcements yet.</p>
    )}
    {announcements.map((a) => (
      <AnnouncementCard key={a.id} a={a} onDelete={onDelete} />
    ))}
  </div>
);