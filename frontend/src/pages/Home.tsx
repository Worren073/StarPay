import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Skeleton from '../components/ui/Skeleton';
import RevenueChart from '../components/charts/RevenueChart';
import AthletesByLevelChart from '../components/charts/AthletesByLevelChart';
import PaymentStatusChart from '../components/charts/PaymentStatusChart';
import AthleteFormModal from '../components/modals/AthleteFormModal';
import CompetitionFormModal from '../components/modals/CompetitionFormModal';
import { getAthletes } from '../services/athleteService';
import { getCompetitions } from '../services/competitionService';
import { getInvoices, getTransactions } from '../services/paymentService';
import type { Athlete, Invoice, Transaction } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useExchangeRate } from '../hooks/useExchangeRate';

export default function Home() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [compCount, setCompCount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [athleteModalOpen, setAthleteModalOpen] = useState(false);
  const [competitionModalOpen, setCompetitionModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatBoth } = useExchangeRate();
  const isAdmin = user?.role === 'admin';

  const loadData = async () => {
    try {
      const [athletesData, invoicesData, compsData, txnData] = await Promise.all([
        getAthletes(),
        getInvoices(),
        getCompetitions({ status: 'upcoming' }),
        getTransactions(),
      ]);
      setAthletes(athletesData);
      setInvoices(invoicesData);
      setCompCount(compsData.length);
      setTransactions(txnData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeAthletes = athletes.filter((a) => a.status === 'active').length;
  const pendingPayments = invoices.filter((i) => i.status === 'pending').length;
  const pendingAmount = invoices
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + parseFloat(i.amount), 0);

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 30) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const recentActivity = useMemo(() => {
    const items: {
      icon: string; color: string; bg: string; text: string; sub: string; badge?: string; badgeVariant?: 'active' | 'positive' | 'warning' | 'error'; amount?: string;
    }[] = [];

    transactions
      .filter((t) => t.status === 'paid')
      .slice(0, 5)
      .forEach((t) => {
        items.push({
          icon: 'payments',
          color: 'text-secondary',
          bg: 'bg-secondary/10',
          text: `Pago recibido: ${t.reference}`,
          sub: `${timeAgo(t.processed_at)} · ${t.method}`,
          amount: `+${formatBoth(parseFloat(t.amount))}`.split(' (')[0],
        });
      });

    athletes
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .forEach((a) => {
        items.push({
          icon: 'person_add',
          color: 'text-primary',
          bg: 'bg-primary/10',
          text: `Nueva inscripción: ${a.name}`,
          sub: `${timeAgo(a.created_at)} · Nivel ${a.level}`,
          badge: a.status === 'active' ? 'Activo' : undefined,
          badgeVariant: 'active',
        });
      });

    items.sort((a, b) => {
      const getTime = (sub: string) => {
        if (sub.startsWith('Ahora')) return 0;
        const m = sub.match(/Hace (\d+) min/);
        if (m) return parseInt(m[1]) * 60000;
        const h = sub.match(/Hace (\d+) hora/);
        if (h) return parseInt(h[1]) * 3600000;
        if (sub.startsWith('Ayer')) return 86400000;
        const d = sub.match(/Hace (\d+) días/);
        if (d) return parseInt(d[1]) * 86400000;
        return Infinity;
      };
      return getTime(a.sub) - getTime(b.sub);
    });

    return items.slice(0, 10);
  }, [transactions, athletes, formatBoth]);

  const handleExportReport = () => {
    const reportData = {
      atletas: athletes.map((a) => ({
        nombre: a.name,
        nivel: a.level,
        categoria: a.category,
        velocidad: a.speed_score,
        tecnica: a.technique_score,
        forma: a.form_score,
      })),
      facturas: invoices.map((i) => ({
        atleta: i.athlete_name,
        monto: i.amount,
        estado: i.status,
        vencimiento: i.due_date,
      })),
      resumen: {
        total_recaudado: invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + parseFloat(i.amount), 0),
        pendiente: pendingAmount,
        atletas_activos: activeAthletes,
        competencias_proximas: compCount,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `starpay-reporte-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Reporte exportado correctamente');
  };

  if (loading) {
    return (
      <>
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="w-64 h-10" />
            <Skeleton className="w-80 h-4" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="w-32 h-12" />
            <Skeleton className="w-36 h-12" />
          </div>
        </header>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 md:mb-10">
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-40" />)}
          </div>
          <div className="md:col-span-4">
            <Skeleton variant="card" className="h-80" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-montserrat text-3xl md:text-5xl font-bold text-on-background mb-2">
            Bienvenido, <span className="text-primary">Entrenador</span>
          </h1>
          <p className="font-inter text-lg text-on-surface-variant">Aquí está tu resumen de rendimiento de hoy.</p>
        </div>
        <div className="flex gap-4 mb-4">
          {isAdmin && (
            <Button variant="ghost" icon="add" onClick={() => setAthleteModalOpen(true)}>Agregar atleta</Button>
          )}
          {isAdmin && (
            <Button variant="primary" icon="event" onClick={() => setCompetitionModalOpen(true)}>Registrar evento</Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <MetricCard
            title="Atletas activos"
            value={activeAthletes}
            icon="directions_run"
            badge={{ label: `${athletes.length} en total`, variant: 'positive' }}
          />
          <MetricCard
            title="Pagos pendientes"
            value={pendingAmount > 0 ? formatBoth(pendingAmount).split(' (')[0] : '$0'}
            icon="account_balance_wallet"
            color="text-on-surface"
            subtitle={`${pendingPayments} facturas pendientes`}
          />
          <MetricCard
            title="Próximas competencias"
            value={compCount}
            icon="emoji_events"
            color="text-on-surface"
            badge={{ label: 'Acción requerida', variant: 'warning' }}
          />
        </div>

        <div className="md:col-span-4 glass-panel p-6 rounded-xl flex flex-col gap-4">
          <h3 className="font-montserrat text-xl font-semibold text-on-surface mb-2">Acciones rápidas</h3>
          {isAdmin && (
            <button
              onClick={() => setAthleteModalOpen(true)}
              className="w-full bg-surface-container-high hover:bg-surface-variant border border-white/10 rounded-lg p-4 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <Icon name="person_add" className="w-5 h-5" />
                </div>
                <span className="font-inter text-sm text-on-surface">Agregar atleta</span>
              </div>
              <Icon name="chevron_right" className="w-5 h-5 text-on-surface-variant" />
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setCompetitionModalOpen(true)}
              className="w-full bg-surface-container-high hover:bg-surface-variant border border-white/10 rounded-lg p-4 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <Icon name="event_available" className="w-5 h-5" />
                </div>
                <span className="font-inter text-sm text-on-surface">Registrar evento</span>
              </div>
              <Icon name="chevron_right" className="w-5 h-5 text-on-surface-variant" />
            </button>
          )}
          <button
            onClick={handleExportReport}
            className="w-full bg-surface-container-high hover:bg-surface-variant border border-white/10 rounded-lg p-4 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <Icon name="download" className="w-5 h-5" />
              </div>
              <span className="font-inter text-sm text-on-surface">Exportar reporte</span>
            </div>
            <Icon name="chevron_right" className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="md:col-span-8 glass-panel p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-montserrat text-xl font-semibold text-on-surface">Actividad reciente</h3>
            <button onClick={() => navigate('/athletes')} className="text-xs text-primary hover:underline font-inter">Ver todo</button>
          </div>
          <div className="flex flex-col gap-4">
            {recentActivity.map((item, i) => (
              <div key={i}>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center ${item.color} shrink-0`}>
                    <Icon name={item.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-inter text-base text-on-surface font-medium">{item.text}</p>
                    <p className="text-xs text-on-surface-variant font-inter">{item.sub}</p>
                  </div>
                  {item.badge && <StatusBadge label={item.badge} variant={item.badgeVariant} />}
                  {item.amount && <span className="font-inter text-sm text-on-surface font-semibold">{item.amount}</span>}
                </div>
                {i < recentActivity.length - 1 && <div className="w-full h-[1px] bg-white/10"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-4 glass-panel mb-6 rounded-xl overflow-hidden relative min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low to-surface-container z-0"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #4cd7f6 0, #4cd7f6 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}></div>
          <div className="relative z-10 p-6 flex flex-col h-full justify-end">
            <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-md flex items-center justify-center text-primary mb-4 border border-primary/30">
              <Icon name="speed" className="w-7 h-7" />
            </div>
            <h3 className="font-montserrat text-xl font-semibold text-on-surface mb-2 leading-tight">Eleva tu programa</h3>
            <p className="font-inter text-base text-on-surface-variant mb-6">Desbloquea módulos avanzados de seguimiento biomecánico para tus patinadores élite.</p>
            <button
              onClick={() => navigate('/athletes')}
              className="glass-panel w-full py-3 rounded-lg font-inter text-sm text-primary font-semibold hover:bg-white/10 transition-colors border-primary/30"
            >
              Explorar módulos
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 md:mb-10">
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
          <h3 className="font-montserrat text-xl font-semibold text-on-surface mb-6">Tendencia de ingresos</h3>
          <RevenueChart invoices={invoices} />
        </div>
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="font-montserrat text-xl font-semibold text-on-surface mb-6">Estado de pagos</h3>
          <PaymentStatusChart invoices={invoices} />
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl mb-4 md:mb-6">
        <h3 className="font-montserrat text-xl font-semibold text-on-surface mb-6">Atletas por nivel</h3>
        <AthletesByLevelChart athletes={athletes} />
      </div>

      <AthleteFormModal
        isOpen={athleteModalOpen}
        onClose={() => setAthleteModalOpen(false)}
        athlete={null}
        onSuccess={loadData}
      />

      <CompetitionFormModal
        isOpen={competitionModalOpen}
        onClose={() => setCompetitionModalOpen(false)}
        competition={null}
        onSuccess={loadData}
      />
    </>
  );
}
