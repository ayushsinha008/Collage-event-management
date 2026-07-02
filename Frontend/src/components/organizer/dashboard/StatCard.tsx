import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: number; // percentage
  accent?: 'yellow' | 'green' | 'blue' | 'purple';
}

const accentMap = {
  yellow: 'bg-tertiary-fixed text-on-tertiary-fixed',
  green: 'bg-primary-fixed text-on-primary-fixed',
  blue: 'bg-secondary-fixed text-on-secondary-fixed',
  purple: 'bg-secondary-container text-on-secondary-container',
};

export const StatCard: React.FC<Props> = ({ label, value, sub, icon: Icon, trend, accent = 'yellow' }) => {
  const positive = (trend ?? 0) >= 0;

  return (
    <div className={`bg-background border-4 border-on-background p-5 neo-shadow-sm hover-lift transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-label-bold uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
        <div className={`p-2 border-2 border-on-background ${accentMap[accent]}`}>
          <Icon className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-on-background" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.1)' }}>{value}</div>
      {sub && <div className="text-xs font-label-bold text-on-surface-variant mt-1 uppercase">{sub}</div>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-label-bold px-2 py-1 border-2 border-on-background inline-flex w-fit ${positive ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
          {positive ? <TrendingUp className="w-3 h-3 stroke-[3]" /> : <TrendingDown className="w-3 h-3 stroke-[3]" />}
          {positive ? '+' : ''}
          {trend}%
        </div>
      )}
    </div>
  );
};