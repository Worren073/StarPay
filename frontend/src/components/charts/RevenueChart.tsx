import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Invoice } from '../../types';
import { useExchangeRate } from '../../hooks/useExchangeRate';

interface RevenueChartProps {
  invoices: Invoice[];
}

export default function RevenueChart({ invoices }: RevenueChartProps) {
  const { formatBoth } = useExchangeRate();
  const monthlyData = invoices.reduce<Record<string, number>>((acc, inv) => {
    const month = new Date(inv.created_at).toLocaleString('es', { month: 'short' });
    if (inv.status === 'paid') {
      acc[month] = (acc[month] || 0) + parseFloat(inv.amount);
    }
    return acc;
  }, {});

  const data = Object.entries(monthlyData).map(([month, amount]) => ({
    name: month.charAt(0).toUpperCase() + month.slice(1),
    amount,
  }));

  if (data.length === 0) {
    return <p className="text-on-surface-variant text-sm font-inter text-center py-8">Sin datos de ingresos disponibles</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="#869397" fontSize={12} tick={{ fill: '#869397' }} />
        <YAxis stroke="#869397" fontSize={12} tick={{ fill: '#869397' }} tickFormatter={(v) => (v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`)} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(18, 33, 49, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#d4e4fa',
          }}
          formatter={(value: number) => [formatBoth(value), 'Ingresos'] as [React.ReactNode, React.ReactNode]}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#06b6d4"
          strokeWidth={2}
          fill="url(#revenueGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
