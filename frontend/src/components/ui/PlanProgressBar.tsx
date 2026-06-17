import { useState } from 'react';
import type { AthletePlan } from '../../types';
import { generateRenewalInvoice } from '../../services/athleteService';
import { showErrorToast } from '../../services/api';
import { toast } from 'sonner';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { formatBoth } from '../../services/rateService';
import Icon from './Icon';

interface PlanProgressBarProps {
  plan: AthletePlan | null;
  loading?: boolean;
  athleteId?: number | null;
  hasPendingRenewal?: boolean;
  onRenew?: () => void;
}

export default function PlanProgressBar({ plan, loading, athleteId, hasPendingRenewal, onRenew }: PlanProgressBarProps) {
  const [generating, setGenerating] = useState(false);
  const { rate } = useExchangeRate();

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-5">
        <div className="h-5 bg-surface-variant rounded-full animate-pulse mb-3"></div>
        <div className="h-3 bg-surface-variant rounded animate-pulse w-2/3"></div>
      </div>
    );
  }

  if (!plan || !plan.plan_name) {
    return (
      <div className="glass-panel rounded-xl p-5 text-center">
        <p className="text-sm text-on-surface-variant font-inter">Sin plan asignado</p>
      </div>
    );
  }

  const isExpired = plan.status === 'expired';
  const isWarning = plan.status === 'expiring';
  const isNormal = plan.status === 'active';

  const barColor = isExpired
    ? 'bg-red-500'
    : isWarning
    ? 'bg-amber-500'
    : 'bg-gradient-to-r from-cyan-500 to-blue-500';

  const textColor = isExpired
    ? 'text-red-400'
    : isWarning
    ? 'text-amber-400'
    : 'text-emerald-400';

  const titleColor = isExpired
    ? 'text-red-400'
    : isWarning
    ? 'text-amber-400'
    : 'text-on-surface';

  const handleRenew = async () => {
    if (!athleteId) return;
    setGenerating(true);
    try {
      await generateRenewalInvoice(athleteId);
      toast.success('Factura de renovación generada');
      onRenew?.();
    } catch (err) {
      showErrorToast(err, 'Error al generar factura');
    } finally {
      setGenerating(false);
    }
  };

  const showRenewButton = athleteId && (isExpired || isWarning) && !hasPendingRenewal;
  const showPendingMessage = athleteId && (isExpired || isWarning) && hasPendingRenewal;

  return (
    <div className="glass-panel rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-montserrat font-semibold text-on-surface">
            {plan.plan_name}
            {plan.plan_price && <span className="ml-2 text-sm text-on-surface-variant font-inter font-normal">
              ({formatBoth(plan.plan_price, rate)})
            </span>}
          </h3>
          <p className={`text-xs font-inter mt-0.5 ${textColor}`}>
            {isExpired
              ? 'Plan vencido'
              : isWarning
              ? `¡Solo ${plan.days_remaining} día${plan.days_remaining !== 1 ? 's' : ''} restante${plan.days_remaining !== 1 ? 's' : ''}!`
              : `${plan.days_remaining} día${plan.days_remaining !== 1 ? 's' : ''} restante${plan.days_remaining !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-montserrat font-bold ${titleColor}`}>
            {plan.progress_percentage}%
          </p>
          <p className="text-xs text-on-surface-variant font-inter">
            Día {plan.duration_days - plan.days_remaining} de {plan.duration_days}
          </p>
        </div>
      </div>

      <div className="h-3 w-full bg-surface-variant rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${Math.min(100, plan.progress_percentage)}%` }}
        />
        {plan.progress_percentage > 10 && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 text-sm">⛸️</span>
        )}
      </div>

      {showRenewButton && (
        <button
          type="button"
          onClick={handleRenew}
          disabled={generating}
          className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-inter text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generando...
            </>
          ) : (
            <>
              ⛸️ Renovar plan
            </>
          )}
        </button>
      )}

      {showPendingMessage && (
        <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
          <p className="text-xs text-amber-400 font-inter">
            <Icon name="schedule" className="w-3.5 h-3.5 inline-block mr-1" />
            Factura de renovación pendiente — completa el pago para renovar
          </p>
        </div>
      )}

      {isExpired && !athleteId && (
        <p className="text-xs text-red-400 font-inter text-center">
          El plan ha vencido. Contacta al administrador para renovar.
        </p>
      )}
    </div>
  );
}
