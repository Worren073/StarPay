import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Invoice } from '../../types';

interface PaymentStatusChartProps {
  invoices: Invoice[];
}

export default function PaymentStatusChart({ invoices }: PaymentStatusChartProps) {
  const statusData = [
    { name: 'Pagado', value: invoices.filter((i) => i.status === 'paid').length, fill: '#10b981' },
    { name: 'Pendiente', value: invoices.filter((i) => i.status === 'pending').length, fill: '#eec200' },
    { name: 'Vencido', value: invoices.filter((i) => i.status === 'overdue').length, fill: '#ff6b6b' },
  ].filter((d) => d.value > 0);

  if (statusData.length === 0) {
    return <p className="text-on-surface-variant text-sm font-inter text-center py-8">Sin datos de pagos disponibles</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={statusData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
        >
          {statusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(18, 33, 49, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#d4e4fa',
          }}
        />
        <Legend
          wrapperStyle={{ color: '#bcc9cd', fontSize: '12px' }}
          formatter={(value) => <span style={{ color: '#bcc9cd' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
