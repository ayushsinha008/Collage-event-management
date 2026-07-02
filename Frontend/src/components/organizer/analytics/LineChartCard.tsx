import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  title: string;
  data: { date: string; count: number }[];
  color?: string;
}

export const LineChartCard: React.FC<Props> = ({ title, data, color = '#2b2a29' }) => (
  <div className="bg-surface border-4 border-on-background p-6 neo-shadow">
    <h3 className="font-extrabold text-xl uppercase tracking-widest mb-6 border-b-4 border-on-background pb-4">{title}</h3>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.2} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fontWeight: 700, fill: '#000' }} tickLine={false} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
          <YAxis tick={{ fontSize: 12, fontWeight: 700, fill: '#000' }} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '4px solid #000', borderRadius: 0, boxShadow: '4px 4px 0 0 #000', fontWeight: 'bold' }}
            itemStyle={{ color: '#000' }}
          />
          <Line type="monotone" dataKey="count" stroke={color} strokeWidth={4} dot={{ r: 6, fill: '#fff', stroke: '#000', strokeWidth: 3 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);