import React, { useEffect, useState } from 'react';
import { AnnouncementForm } from '../../components/organizer/announcements/AnnouncementForm';
import { AnnouncementList } from '../../components/organizer/announcements/AnnouncementList';
import { organizerApi } from '../../services/organizerApi';
import { Announcement } from '../../types/organizer';
import { useOrganizerEvents } from '../../hooks/useOrganizerEvents';

export const AnnouncementsPage: React.FC = () => {
  const [list, setList] = useState<Announcement[]>([]);
  const { events } = useOrganizerEvents();

  const fetch = async () => {
    const data = await organizerApi.getAnnouncements();
    setList(data);
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="space-y-8">
      <div className="border-l-8 border-primary pl-6 py-2">
        <h1 className="text-4xl font-extrabold tracking-tight uppercase" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>Announcements</h1>
        <p className="text-on-surface-variant mt-2 font-label-bold text-sm tracking-widest uppercase">Broadcast updates to your attendees.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnnouncementForm
          events={events.map((e) => ({ id: e.id, title: e.title }))}
          onCreated={() => fetch()}
        />
        <div className="bg-surface border-4 border-on-background p-6 neo-shadow h-fit">
          <h3 className="font-extrabold text-2xl uppercase tracking-wide mb-6 border-b-4 border-on-background pb-4">Recent Announcements</h3>
          <AnnouncementList
            announcements={list}
            onDelete={async (id) => {
              await organizerApi.deleteAnnouncement(id);
              fetch();
            }}
          />
        </div>
      </div>
    </div>
  );
};