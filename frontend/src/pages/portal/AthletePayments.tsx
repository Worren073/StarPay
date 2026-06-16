import { useEffect, useState } from 'react';
import Icon from '../../components/ui/Icon';
import StatusBadge from '../../components/ui/StatusBadge';
import Skeleton from '../../components/ui/Skeleton';
import PlanProgressBar from '../../components/ui/PlanProgressBar';
import PaymentModal from '../../components/modals/PaymentModal';
import { getMyPayments, getMyPlan } from '../../services/athleteService';
import { showErrorToast } from '../../services/api';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import type { Invoice, AthletePlan } from '../../types';

export default function AthletePayments() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plan, setPlan] = useState<AthletePlan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const { formatBoth } = useExchangeRate();

  const loadData = () => {
    setLoading(true);
    setPlanLoading(true);
    Promise.all([
      getMyPayments(),
      getMyPlan(),
    ])
      .then(([invData, planData]) => {
        setInvoices(invData);
        setPlan(planData && Object.keys(planData).length > 0 ? planData : null);
      })
      .catch((err) => showErrorToast(err, 'Error al cargar datos'))
      .finally(() => {
        setLoading(false);
        setPlanLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const statusLabels: Record<string, string> = {
    paid: 'Pagado',
    pending: 'Pendiente',
    overdue: 'Vencido',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="card" className="h-28" />
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-96 h-4" />
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-20" />)}
      </div>
    );
  }

  const pendingInvoices = invoices.filter((inv) => inv.status === 'pending' || inv.status === 'overdue');
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');

  return (
    <div className="space-y-6">
        {/* Plan Progress Bar */}
      <PlanProgressBar
        plan={plan}
        loading={planLoading}
        athleteId={plan?.athlete ?? null}
        hasPendingRenewal={invoices.some(
          (inv) => inv.invoice_type === 'plan_renewal' && inv.status === 'pending'
        )}
        onRenew={loadData}
      />

      <div>
        <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-on-surface mb-2">Mis Pagos</h2>
        <p className="font-inter text-base text-on-surface-variant">
          {pendingInvoices.length > 0
            ? `Tienes ${pendingInvoices.length} pago${pendingInvoices.length !== 1 ? 's' : ''} pendiente${pendingInvoices.length !== 1 ? 's' : ''}`
            : 'Todos tus pagos están al día'}
        </p>
      </div>

      {pendingInvoices.length > 0 && (
        <div>
          <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
            <Icon name="warning" className="w-5 h-5 text-amber-500" />
            Pendientes
          </h3>
          <div className="space-y-3">
              {pendingInvoices.map((inv) => (
              <div key={inv.id} className="glass-panel rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-inter font-semibold text-on-surface">{inv.description || 'Sin descripción'}</p>
                  <p className="text-sm text-on-surface-variant font-inter mt-1">
                    {inv.invoice_type === 'plan_renewal' && (
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-semibold mr-2">
                        Renovación de plan
                      </span>
                    )}
                    Vence: {new Date(inv.due_date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-montserrat font-bold text-lg text-on-surface">{formatBoth(inv.amount)}</p>
                    <StatusBadge
                      label={statusLabels[inv.status] || inv.status}
                      variant={inv.status as any}
                    />
                  </div>
                  <button
                    onClick={() => setPayingInvoice(inv)}
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-inter text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
                  >
                    <Icon name="payments" className="w-4 h-4" />
                    Pagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {paidInvoices.length > 0 && (
        <div>
          <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
            <Icon name="check_circle" className="w-5 h-5 text-emerald-500" />
            Historial de Pagos
          </h3>
          <div className="space-y-3">
            {paidInvoices.map((inv) => (
              <div key={inv.id} className="glass-panel rounded-xl p-4 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                <div>
                  <p className="font-inter font-semibold text-on-surface">{inv.description || 'Sin descripción'}</p>
                  <p className="text-sm text-on-surface-variant font-inter mt-1">
                    {new Date(inv.due_date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-montserrat font-bold text-lg text-on-surface">{formatBoth(inv.amount)}</p>
                  <StatusBadge label="Pagado" variant="paid" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {invoices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-32 h-32 mb-6 opacity-50">
            <img src="/images/skating-empty.svg" alt="Sin datos" className="w-full h-full" />
          </div>
          <h3 className="font-montserrat text-xl font-semibold text-on-surface mb-2">Sin pagos registrados</h3>
          <p className="font-inter text-sm text-on-surface-variant text-center max-w-md">
            Aún no tienes pagos registrados en el sistema.
          </p>
        </div>
      )}

      {/* Payment Modal */}
      {payingInvoice && (
        <PaymentModal
          isOpen={!!payingInvoice}
          onClose={() => setPayingInvoice(null)}
          invoice={payingInvoice}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
