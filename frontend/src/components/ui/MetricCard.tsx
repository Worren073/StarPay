import Icon from './Icon';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  color?: string;
  glow?: boolean;
  badge?: { label: string; variant: string };
}

export default function MetricCard({ title, value, icon, subtitle, color = 'text-primary', glow = false, badge }: MetricCardProps) {
  return (
    <div className={`glass-panel rounded-xl p-6 flex flex-col justify-between ${glow ? 'glass-panel-glow' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ${color}`}>
          <Icon name={icon} className="w-6 h-6" />
        </div>
        {badge && (
          <span className={`px-2 py-1 rounded-full text-xs font-inter font-semibold border ${
            badge.variant === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
            badge.variant === 'warning' ? 'bg-primary/20 text-primary border-primary/30' :
            'bg-surface-variant/50 text-on-surface-variant border-white/10'
          }`}>
            {badge.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-inter">{title}</p>
        <p className={`font-montserrat text-2xl font-bold ${color}`}>{value}</p>
        {subtitle && <p className="text-sm text-on-surface-variant mt-1 font-inter">{subtitle}</p>}
      </div>
    </div>
  );
}
