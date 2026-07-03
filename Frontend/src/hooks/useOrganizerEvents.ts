import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Event } from '../types/event';
import { organizerApi } from '../services/organizerApi';

export interface EventFilters {
  search?: string;
  status?: string;
  category?: string;
}

export const useOrganizerEvents = (initialFilters: EventFilters = {}) => {
  const [params] = useSearchParams();
  const urlSearch = params.get('q') ?? '';
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilters>({ ...initialFilters, search: urlSearch });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await organizerApi.getMyEvents(filters);
      setEvents(data);
      setError(null);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (data: Omit<Event, 'id'>) => {
      const created = await organizerApi.createEvent(data as any);
      await fetch();
      return created;
    },
    [fetch]
  );

  const update = useCallback(
    async (id: string, data: Partial<Event>) => {
      await organizerApi.updateEvent(id, data);
      await fetch();
    },
    [fetch]
  );

  const remove = useCallback(
    async (id: string) => {
      await organizerApi.deleteEvent(id);
      await fetch();
    },
    [fetch]
  );

  return { events, loading, error, filters, setFilters, refetch: fetch, create, update, remove };
};