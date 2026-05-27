import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Athlete } from '../../types';

interface AthletesByLevelChartProps {
  athletes: Athlete[];
}

export default function AthletesByLevelChart({ athletes }: AthletesByLevelChartProps) {
  const levelData = [
    { name: 'Élite', count: athletes.filter((a) => a.level === 'elite').length, fill: '#eec200' },
    { name: 'Profesional', count: athletes.filter((a) => a.level === 'pro').length, fill: '#4cd7f6' },
    { name: 'Principiante', count: athletes.filter((a) => a.level === 'beginner').length, fill: '#bec6e0' },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={levelData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="#869397" fontSize={12} tick={{ fill: '#869397' }} />
        <YAxis stroke="#869397" fontSize={12} tick={{ fill: '#869397' }} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          contentStyle={{
            backgroundColor: 'rgba(18, 33, 49, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#d4e4fa',
          }}
          formatter={(value, _name, props) => [`${value} atletas`, props.payload.name]}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} activeBar={false}>
          {levelData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
