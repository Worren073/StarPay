interface StatusBadgeProps {
  label: string;
  variant?: 'active' | 'inactive' | 'pending' | 'overdue' | 'paid' | 'elite' | 'pro' | 'beginner' | 'on_ice' | 'in_facility' | 'off_duty' | 'upcoming' | 'ongoing' | 'completed' | 'qualifier' | 'championship' | 'exhibition';
}

const variantStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  inactive: 'bg-surface-variant/50 text-on-surface-variant border-border-subtle',
  paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  pending: 'bg-secondary-container/20 text-secondary border-secondary-container/30',
  overdue: 'bg-error-container/20 text-error border-error-container/30',
  elite: 'bg-secondary-container/20 text-secondary-container border-secondary-container/30',
  pro: 'bg-primary/20 text-primary border-primary/30',
  beginner: 'bg-bg-active text-on-surface-variant border-border-subtle',
  on_ice: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  in_facility: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  off_duty: 'bg-surface-variant/50 text-on-surface-variant border-border-subtle',
  upcoming: 'bg-primary/20 text-primary border-primary/30',
  ongoing: 'bg-secondary-container/20 text-secondary border-secondary-container/30',
  completed: 'bg-tertiary/20 text-tertiary-fixed-dim border-tertiary/30',
  qualifier: 'bg-secondary-container/20 text-secondary border-secondary/30',
  championship: 'bg-secondary-container/20 text-secondary border-secondary/30',
  exhibition: 'bg-tertiary/20 text-tertiary-fixed-dim border-tertiary/30',
};

const variantEmoji: Record<string, string> = {
  qualifier: '🏅',
  championship: '🏆',
  exhibition: '🎪',
  in_facility: '🏢',
  off_duty: '🏠',
  upcoming: '📅',
  ongoing: '🔄',
  completed: '✔️',
};

export default function StatusBadge({ label, variant = 'active' }: StatusBadgeProps) {
  const styles = variantStyles[variant] || variantStyles.active;
  const emoji = variantEmoji[variant] || '';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-inter font-semibold border ${styles}`}>
      {emoji && <span className="mr-1">{emoji}</span>}{label}
    </span>
  );
}
