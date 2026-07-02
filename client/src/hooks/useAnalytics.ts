import { useEffect, useState } from 'react';
import { AnalyticsData } from '../types/organizer';
import { organizerApi } from '../services/organizerApi';

export const useAnalytics = (range: '7d' | '30d' | '90d' | 'all' = '30d') => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await organizerApi.getAnalytics({ range });
        setData(d);
      } finally {
        setLoading(false);
      }
    })();
  }, [range]);

  return { data, loading };
};