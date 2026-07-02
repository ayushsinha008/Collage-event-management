import React, { useEffect, useState } from 'react';
import { CalendarRange, Users, Ticket, TrendingUp } from 'lucide-react';
import { StatCard } from '../../components/organizer/dashboard/StatCard';
import { RecentEvents } from '../../components/organizer/dashboard/RecentEvents';
import { ActivityFeed } from '../../components/organizer/dashboard/ActivityFeed';
import { QuickActions } from '../../components/organizer/dashboard/QuickActions';
import { organizerApi } from '../../services/organizerApi';
import { useOrganizerContext } from '../../context/OrganizerContext';

export const DashboardPage: React.FC = () => {
  const { organizer } = useOrganizerContext();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await organizerApi.getDashboardStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    console.log('DashboardPage render - loading:', loading, 'stats:', stats, 'organizer:', organizer);
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-on-background border-t-primary rounded-full animate-spin"></div>
        <p className="font-label-bold text-on-surface-variant uppercase tracking-widest">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="border-l-8 border-primary pl-6 py-2">
        <h1 className="text-4xl font-extrabold tracking-tight uppercase" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
          Welcome back, {organizer?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-on-surface-variant mt-2 font-label-bold text-sm tracking-widest uppercase">
          Here's what's happening with your events today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Events"
          value={stats?.totalEvents ?? 0}
          sub="All time"
          icon={CalendarRange}
          trend={12}
          accent="yellow"
        />
        <StatCard
          label="Active Events"
          value={stats?.activeEvents ?? 0}
          sub="Currently live"
          icon={Ticket}
          trend={5}
          accent="green"
        />
        <StatCard
          label="Total Registrations"
          value={stats?.totalRegistrations ?? 0}
          sub="Across all events"
          icon={Users}
          trend={-2}
          accent="blue"
        />
        <StatCard
          label="This Week"
          value={stats?.thisWeekRegistrations ?? 0}
          sub="New registrations"
          icon={TrendingUp}
          trend={18}
          accent="purple"
        />
      </div>

      {/* Two-col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <RecentEvents events={stats?.upcomingEvents ?? []} />
        </div>
        <div className="space-y-8">
          <QuickActions />
          <ActivityFeed activities={stats?.recentActivity ?? []} />
        </div>
      </div>
    </div>
  );
};