import { useEffect, useState, useCallback } from 'react';
import { Registration } from '../types/organizer';
import { organizerApi } from '../services/organizerApi';

export const useRegistrations = (eventId?: string) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const checkIn = async (ticketCode: string) => {
    await organizerApi.checkInAttendee(ticketCode);
    await fetch();
  };

  return { registrations, loading, search, setSearch, refetch: fetch, checkIn };
};