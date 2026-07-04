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

  // Sync URL search param to local state
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await organizerApi.getRegistrations({ eventId, search });
      setRegistrations(data as Registration[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [eventId, search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateSearch = (newSearch: string) => {
    setSearch(newSearch);
    const next = new URLSearchParams(params);
    if (newSearch) {
      next.set('q', newSearch);
    } else {
      next.delete('q');
    }
    setParams(next, { replace: true });
  };

  const checkIn = async (ticketCode: string) => {
    await organizerApi.checkInAttendee(ticketCode);
    await fetch();
  };

  return { registrations, loading, search, setSearch: updateSearch, refetch: fetch, checkIn };
};