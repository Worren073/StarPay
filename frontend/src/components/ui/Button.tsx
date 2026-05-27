import type { ReactNode } from 'react';
import Icon from './Icon';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'secondary';
  icon?: string;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export default function Button({ children, onClick, variant = 'primary', icon, className = '', type = 'button', disabled = false }: ButtonProps) {
  const baseStyles = 'font-inter text-sm font-semibold flex items-center gap-2 transition-all scale-95 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary to-primary-container text-on-primary-container px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]',
    ghost: 'glass-panel px-6 py-3 rounded-lg text-primary hover:bg-white/10',
    secondary: 'bg-surface-container-high hover:bg-surface-variant border border-white/10 rounded-lg px-6 py-3 text-on-surface',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {icon && <Icon name={icon} className="w-5 h-5" />}
      {children}
    </button>
  );
}
