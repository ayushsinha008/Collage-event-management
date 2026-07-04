import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Registration } from '../types/organizer';
import { organizerApi } from '../services/organizerApi';

export const useRegistrations = (eventId?: string) => {
  const [params, setParams] = useSearchParams();
  const urlSearch = params.get('q') ?? '';
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  // Sync URL search param to local state
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync debounced search to URL params
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debouncedSearch) {
      if (next.get('q') !== debouncedSearch) {
        next.set('q', debouncedSearch);
        setParams(next, { replace: true });
      }
    } else {
      if (next.has('q')) {
        next.delete('q');
        setParams(next, { replace: true });
      }
    }
  }, [debouncedSearch, params, setParams]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await organizerApi.getRegistrations({ eventId, search: debouncedSearch });
      setRegistrations(data as Registration[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [eventId, debouncedSearch]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateSearch = (newSearch: string) => {
    setSearch(newSearch);
  };

  const checkIn = async (ticketCode: string) => {
    await organizerApi.checkInAttendee(ticketCode);
    await fetch();
  };

  return { registrations, loading, search, setSearch: updateSearch, refetch: fetch, checkIn };
};