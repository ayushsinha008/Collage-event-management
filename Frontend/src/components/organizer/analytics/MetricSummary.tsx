import React from 'react';

interface Metric {
  label: string;
  value: string | number;
  sub?: string;
}

export const MetricSummary: React.FC<{ metrics: Metric[] }> = ({ metrics }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {metrics.map((m) => (
      <div key={m.label} className="bg-tertiary-fixed border-4 border-on-background p-6 neo-shadow-sm hover-lift transition-all">
        <p className="text-sm font-label-bold uppercase text-on-tertiary-fixed tracking-widest">{m.label}</p>
        <p className="text-4xl font-extrabold mt-2 text-on-tertiary-fixed tracking-tight" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>{m.value}</p>
        {m.sub && <p className="text-xs font-label-bold text-on-tertiary-fixed/80 mt-2 uppercase">{m.sub}</p>}
      </div>
    ))}
  </div>
);