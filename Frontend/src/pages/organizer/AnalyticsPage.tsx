import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { LineChartCard } from '../../components/organizer/analytics/LineChartCard';
import { BarChartCard } from '../../components/organizer/analytics/BarChartCard';
import { PieChartCard } from '../../components/organizer/analytics/PieChartCard';
import { MetricSummary } from '../../components/organizer/analytics/MetricSummary';
import { LiveAttendanceChart } from '../../components/organizer/analytics/LiveAttendanceChart';
import { organizerApi } from '../../services/organizerApi';
import { LiveAttendanceData } from '../../types/organizer';

export const AnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const { data, loading } = useAnalytics(range);
  const [live, setLive] = useState<LiveAttendanceData | null>(null);
  const [liveEventTitle, setLiveEventTitle] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const events = await organizerApi.getMyEvents();
        const top = events.sort((a, b) => (b.registrationsCount ?? 0) - (a.registrationsCount ?? 0))[0];
        if (!top?.id) return;
        const attendance = await organizerApi.getLiveAttendance(top.id);
        setLive(attendance);
        setLiveEventTitle(top.title);
      } catch {
        setLive(null);
      }
    })();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-on-background border-t-primary rounded-full animate-spin"></div>
        <p className="font-label-bold text-on-surface-variant uppercase tracking-widest">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between flex-wrap gap-6 border-l-8 border-primary pl-6 py-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight uppercase" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>Analytics</h1>
          <p className="text-on-surface-variant mt-2 font-label-bold text-sm tracking-widest uppercase">Track event performance and growth.</p>
        </div>
        <div className="flex gap-0 border-4 border-on-background bg-background neo-shadow-sm">
          {(['7d', '30d', '90d', 'all'] as const).map((r, i) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 font-label-bold text-sm uppercase transition-all ${i !== 0 ? 'border-l-4 border-on-background' : ''} ${range === r ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-transparent text-on-surface hover:bg-surface-variant'
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* LIVE ATTENDANCE — signature screen */}
      {live && <LiveAttendanceChart data={live} eventTitle={liveEventTitle || 'Top Event'} />}

      <MetricSummary
        metrics={[
          { label: 'Total Events', value: data?.totalEvents || 0 },
          { label: 'Registrations', value: data?.totalRegistrations || 0 },
          { label: 'Attendees', value: data?.totalAttendees || 0 },
          { label: 'Attendance Rate', value: `${data?.attendanceRate || 0}%` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LineChartCard title="Registrations Over Time" data={data?.registrationsOverTime || []} />
        <PieChartCard
          title="Events by Category"
          data={Array.isArray(data?.eventsByCategory) ? data.eventsByCategory.map((c) => ({ name: c.category, value: c.count })) : []}
        />
        <BarChartCard
          title="Top Events"
          data={Array.isArray(data?.topEvents) ? data.topEvents.map((e) => ({ label: e?.title?.slice(0, 12) || '', value: e?.registrations || 0 })) : []}
        />
        <LineChartCard
          title="Revenue Trend"
          data={Array.isArray(data?.registrationsOverTime) ? data.registrationsOverTime.map((d) => ({ date: d.date, count: d.count * 50 })) : []}
          color="#1b6b4f"
        />
      </div>
    </div>
  );
};