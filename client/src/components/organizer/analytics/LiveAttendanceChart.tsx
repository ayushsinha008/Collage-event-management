import { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Users, TrendingUp, ArrowUp, ArrowDown, Activity, Zap, Maximize2 } from 'lucide-react';
import type { LiveAttendanceData } from '../../../types/organizer';

interface Props {
  data: LiveAttendanceData;
  eventTitle?: string;
  compact?: boolean;
}

interface BrutalTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string;
}

const BrutalTooltip = ({ active, payload, label }: BrutalTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const inside = payload.find((p) => p.dataKey === 'inside')?.value ?? 0;
  const cum = payload.find((p) => p.dataKey === 'cumulative')?.value ?? 0;
  return (
    <div className="bg-tertiary-fixed border-4 border-on-background px-3 py-2 neo-shadow-sm">
      <p className="font-extrabold uppercase text-xs">⏱ {label}</p>
      <p className="text-sm font-label-bold">Inside: <span className="font-extrabold">{inside}</span></p>
      <p className="text-sm font-label-bold">Cumulative: <span className="font-extrabold">{cum}</span></p>
    </div>
  );
};

interface KpiCellProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: 'up' | 'down';
}

const KpiCell = ({ label, value, sub, icon: Icon, color, trend }: KpiCellProps) => (
  <div className={`${color} border-4 border-on-background p-3 neo-shadow-sm`}>
    <div className="flex items-center justify-between">
      <Icon className="w-5 h-5 stroke-[3]" />
      {trend === 'up' && <ArrowUp className="w-4 h-4 stroke-[3]" />}
      {trend === 'down' && <ArrowDown className="w-4 h-4 stroke-[3]" />}
    </div>
    <p className="text-2xl font-extrabold mt-2 leading-none">{value}</p>
    <p className="text-[10px] font-label-bold uppercase tracking-widest mt-1">{label}</p>
    {sub && <p className="text-[10px] font-bold uppercase mt-0.5 opacity-70">{sub}</p>}
  </div>
);

export const LiveAttendanceChart = ({ data, eventTitle, compact }: Props) => {
  const [tick, setTick] = useState(0);
  const [displayedInside, setDisplayedInside] = useState<number>(data.currentlyInside);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTick((x) => x + 1);
      setDisplayedInside((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = Math.max(0, Math.min(data.capacity, prev + delta));
        return next;
      });
      setPulse(true);
      const p = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(p);
    }, 2000);
    return () => clearInterval(t);
  }, [data.capacity]);

  const projectedPeak = useMemo(() => {
    const last = data.timeline[data.timeline.length - 1];
    if (!last) return data.peakToday;
    return Math.max(data.peakToday, last.inside + 60);
  }, [data]);

  const fillPct = ((displayedInside / data.capacity) * 100).toFixed(1);
  const peakPct = ((data.peakToday / data.capacity) * 100).toFixed(1);
  const turnover = data.totalCheckedIn > 0 ? Math.round(((data.totalCheckedIn - displayedInside) / data.totalCheckedIn) * 100) : 0;

  return (
    <div className={`bg-surface border-4 border-on-background ${compact ? 'p-4' : 'p-6'} neo-shadow`}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-on-background pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-error border-4 border-on-background flex items-center justify-center ${pulse ? 'scale-110' : ''} transition-transform`}>
            <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-label-bold uppercase tracking-widest text-error flex items-center gap-2">
              <span className="w-2 h-2 bg-error rounded-full animate-pulse" /> LIVE ATTENDANCE
            </p>
            <h3 className="font-extrabold text-xl uppercase tracking-tight">{eventTitle ?? 'Now Inside Venue'}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-label-bold uppercase tracking-widest text-on-surface-variant">Currently Inside</p>
          <p className={`text-5xl font-extrabold tabular-nums leading-none ${pulse ? 'text-primary' : ''} transition-colors`} style={{ textShadow: '3px 3px 0 #000' }}>
            {displayedInside.toLocaleString()}
          </p>
          <p className="text-xs font-label-bold uppercase mt-1">
            <span className="bg-tertiary-fixed border-2 border-on-background px-2 py-0.5">{fillPct}% CAPACITY</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCell label="Peak Today" value={data.peakToday.toLocaleString()} icon={TrendingUp} color="bg-primary-fixed" sub={`${peakPct}% capacity`} />
        <KpiCell label="Total Check-ins" value={data.totalCheckedIn.toLocaleString()} icon={Users} color="bg-secondary-container" sub="Unique arrivals" />
        <KpiCell label="Projected Peak" value={projectedPeak.toLocaleString()} icon={Maximize2} color="bg-tertiary-container" sub="Forecast +1h" trend="up" />
        <KpiCell label="Turnover" value={`${turnover}%`} icon={Activity} color="bg-surface-variant" sub="Arrived but left" trend={turnover > 5 ? 'down' : 'up'} />
      </div>

      <div className="h-72 bg-background border-4 border-on-background p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.timeline} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="g-inside" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1b6b4f" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#a6f2cf" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="g-cum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6d5e00" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#ffe24c" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.15} vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 11, fontWeight: 700, fill: '#000' }} tickLine={false} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
            <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#000' }} tickLine={false} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
            <Tooltip content={<BrutalTooltip />} />
            <ReferenceLine y={data.peakToday} stroke="#ba1a1a" strokeWidth={3} strokeDasharray="6 4" label={{ value: 'PEAK', position: 'right', fill: '#ba1a1a', fontWeight: 800, fontSize: 11 }} />
            <Area type="monotone" dataKey="cumulative" stroke="#6d5e00" strokeWidth={3} fill="url(#g-cum)" />
            <Area type="monotone" dataKey="inside"     stroke="#1b6b4f" strokeWidth={4} fill="url(#g-inside)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-3 text-[10px] font-label-bold uppercase tracking-widest text-on-surface-variant">
        <span className="flex items-center gap-2"><Zap className="w-3 h-3" /> Tick #{tick} · refreshes every 2s</span>
        <span>Yellow = cumulative arrivals · Green = currently inside venue</span>
      </div>
    </div>
  );
};

export default LiveAttendanceChart;