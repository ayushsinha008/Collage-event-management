import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  title: string;
  data: { label: string; value: number }[];
}

const COLORS = ['#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'];

export const BarChartCard: React.FC<Props> = ({ title, data }) => (
  <div className="bg-surface border-4 border-on-background p-6 neo-shadow">
    <h3 className="font-extrabold text-xl uppercase tracking-widest mb-6 border-b-4 border-on-background pb-4">{title}</h3>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.2} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 700, fill: '#000' }} tickLine={false} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
          <YAxis tick={{ fontSize: 12, fontWeight: 700, fill: '#000' }} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '4px solid #000', borderRadius: 0, boxShadow: '4px 4px 0 0 #000', fontWeight: 'bold' }}
            itemStyle={{ color: '#000' }}
            cursor={{ fill: '#000', opacity: 0.1 }}
          />
          <Bar dataKey="value" radius={[0, 0, 0, 0]} stroke="#000" strokeWidth={4}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);