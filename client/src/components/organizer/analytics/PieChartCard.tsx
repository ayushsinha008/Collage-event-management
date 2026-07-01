import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  title: string;
  data: { name: string; value: number }[];
}

const COLORS = ['#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#f97316'];

export const PieChartCard: React.FC<Props> = ({ title, data }) => (
  <div className="bg-surface border-4 border-on-background p-6 neo-shadow">
    <h3 className="font-extrabold text-xl uppercase tracking-widest mb-6 border-b-4 border-on-background pb-4">{title}</h3>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={{ stroke: '#000', strokeWidth: 2 }}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#000" strokeWidth={4} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '4px solid #000', borderRadius: 0, boxShadow: '4px 4px 0 0 #000', fontWeight: 'bold' }}
            itemStyle={{ color: '#000' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);