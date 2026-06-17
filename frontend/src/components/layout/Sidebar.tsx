import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';

export const adminNavItems = [
  { path: '/', icon: 'home', label: 'Inicio' },
  { path: '/payments', icon: 'payments', label: 'Pagos' },
  { path: '/athletes', icon: 'group', label: 'Atletas' },
  { path: '/competitions', icon: 'emoji_events', label: 'Competencias' },
  { path: '/staff', icon: 'badge', label: 'Personal' },
];

export const athleteNavItems = [
  { path: '/athlete/pagos', icon: 'payments', label: 'Mis Pagos' },
  { path: '/athlete/rendimiento', icon: 'trending_up', label: 'Rendimiento' },
  { path: '/athlete/competencias', icon: 'emoji_events', label: 'Competencias' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAthlete = user?.role === 'athlete';
  const navItems = isAthlete ? athleteNavItems : adminNavItems;

  return (
    <aside className="hidden md:flex flex-col h-full py-6 px-4 fixed left-4 top-4 bottom-4 w-sidebar-collapsed hover:w-sidebar-expanded transition-all duration-300 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl z-50 group">
      <div className="flex items-center gap-4 mb-10 pl-2">
        <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-surface-container flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-7 h-7">
            <defs>
              <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path d="M50 15 L58 35 L80 35 L62 48 L70 70 L50 56 L30 70 L38 48 L20 35 L42 35 Z" fill="url(#starGrad)" />
            <path d="M20 85 Q35 90 50 82 Q65 74 80 85" fill="none" stroke="#4cd7f6" strokeWidth="3" strokeLinecap="round" />
            <path d="M25 82 Q40 70 55 78" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          </svg>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
          <h2 className="font-montserrat text-sm font-bold text-primary">StarPay</h2>
          <p className="text-xs text-on-surface-variant">Elite Performance ⛸️</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all scale-95 active:scale-90 ${
                isActive
                  ? 'text-primary font-bold drop-shadow-[0_0_8px_rgba(76,215,246,0.5)] bg-white/10'
                  : 'text-on-surface-variant hover:bg-white/10 hover:text-primary'
              }`}
            >
              <span className="shrink-0">
                <Icon name={item.icon} className="w-6 h-6" solid={isActive} />
              </span>
              <span className="font-inter text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 p-3 rounded-lg text-on-surface-variant hover:bg-white/10 hover:text-primary transition-colors scale-95 active:scale-90 w-full"
        >
          <span className="shrink-0">
            <Icon name="logout" className="w-6 h-6" />
          </span>
          <span className="font-inter text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
