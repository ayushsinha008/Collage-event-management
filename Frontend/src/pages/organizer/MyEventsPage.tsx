import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOrganizerEvents } from '../../hooks/useOrganizerEvents';
import { EventCard } from '../../components/organizer/events/EventCard';
import { EventFilters } from '../../components/organizer/events/EventFilters';
import HostEventModal from '../../components/common/HostEventModal';
import { Event } from '../../types/event';
import { Plus } from 'lucide-react';

const EMPTY_EVENT = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  organizer: '',
  capacity: 100,
  category: 'technical' as Event['category'],
  imageUrl: '',
};

const eventFromForm = (form: HTMLFormElement): Omit<Event, 'id'> => {
  const fd = new FormData(form);
  return {
    title:       String(fd.get('title') ?? ''),
    description: String(fd.get('description') ?? ''),
    date:        String(fd.get('date') ?? ''),
    time:        String(fd.get('time') ?? ''),
    location:    String(fd.get('location') ?? ''),
    organizer:   String(fd.get('organizer') ?? ''),
    capacity:    Number(fd.get('capacity') ?? 100),
    category:    (fd.get('category') as Event['category']) ?? 'technical',
    imageUrl:    String(fd.get('imageUrl') ?? ''),
    status:      'Upcoming' as any, // backend accepts status values and UI maps published/Upcoming
  };
};

export const MyEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { events, loading, error, filters, setFilters, create, update, remove, publish } = useOrganizerEvents();
  const [editing, setEditing] = useState<Event | null>(null);
  const [showCreate, setShowCreate] = useState(params.get('create') === 'true');

  // Support deep-linking straight into the edit modal, e.g. from the Manage
  // Event page's "Edit" button: /organizer/events?edit=<id>
  useEffect(() => {
    const editId = params.get('edit');
    if (editId && !editing && events.length > 0) {
      const match = events.find((e) => e.id === editId);
      if (match) setEditing(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, events]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create(eventFromForm(e.currentTarget as HTMLFormElement));
    setShowCreate(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await update(editing.id, eventFromForm(e.currentTarget as HTMLFormElement));
    setEditing(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-8 border-primary pl-6 py-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
            My Events
          </h1>
          <p className="text-on-surface-variant mt-2 font-label-bold text-sm tracking-widest uppercase">
            Manage all events you've created.
          </p>
        </div>
        <button
          onClick={() => navigate('/organizer/events/new')}
          className="flex items-center gap-2 bg-tertiary-fixed hover:bg-tertiary text-on-background font-label-bold px-6 py-3 border-4 border-on-background neo-shadow-sm hover-lift transition-all uppercase"
        >
          <Plus className="w-5 h-5 stroke-[3]" /> CREATE EVENT
        </button>
      </div>

      <EventFilters
        search={filters.search || ''}
        setSearch={(v) => setFilters({ ...filters, search: v })}
        status={filters.status || 'all'}
        setStatus={(v) => setFilters({ ...filters, status: v })}
        category={filters.category || 'all'}
        setCategory={(v) => setFilters({ ...filters, category: v })}
      />

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-on-background border-t-primary rounded-full animate-spin"></div>
          <p className="font-label-bold text-on-surface-variant uppercase tracking-widest">Loading Events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-surface border-4 border-on-background p-12 text-center neo-shadow">
          <p className="text-lg font-label-bold text-on-surface-variant uppercase tracking-wide">
            {error ? `ERROR: ${typeof error === 'object' ? JSON.stringify(error) : error}` : 'No events yet. Create your first event!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              onEdit={(ev) => setEditing(ev)}
              onView={(ev) => navigate(`/organizer/events/${ev.id}`)}
              onDelete={(id) => remove(id)}
              onPublish={(ev) => publish(ev.id)}
            />
          ))}
        </div>
      )}

      {(showCreate || editing) && (
        <HostEventModal
          isOpen
          onClose={() => { setShowCreate(false); setEditing(null); }}
          mode={editing ? 'edit' : 'create'}
          newEvent={
            editing
              ? {
                  title: editing.title,
                  description: editing.description ?? '',
                  date: editing.date,
                  time: editing.time,
                  location: editing.location,
                  organizer: editing.organizer ?? '',
                  capacity: editing.capacity,
                  category: editing.category as any,
                  imageUrl: editing.imageUrl ?? '',
                }
              : EMPTY_EVENT
          }
          handleSubmit={handleCreate}
          onUpdate={handleEdit}
        />
      )}
    </div>
  );
};