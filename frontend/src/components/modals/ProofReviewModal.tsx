import { useState } from 'react';
import Modal from './Modal';
import StatusBadge from '../ui/StatusBadge';
import { verifyProof } from '../../services/paymentService';
import { showErrorToast } from '../../services/api';
import { toast } from 'sonner';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { formatUSD } from '../../services/rateService';
import type { PaymentProof } from '../../types';

interface ProofReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: PaymentProof;
  onVerified: () => void;
  invoiceType?: string;
}

export default function ProofReviewModal({ isOpen, onClose, proof, onVerified, invoiceType }: ProofReviewModalProps) {
  const [verifying, setVerifying] = useState(false);
  const { rate } = useExchangeRate();

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyProof(proof.invoice, proof.id, 'paid');
      toast.success('Pago verificado correctamente');
      onVerified();
      onClose();
    } catch (err) {
      showErrorToast(err, 'Error al verificar el pago');
    } finally {
      setVerifying(false);
    }
  };

  const methodLabels: Record<string, string> = {
    pago_movil: 'Pago Móvil',
    transferencia: 'Transferencia',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    overdue: 'Vencido',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Revisar comprobante" size="lg">
      <div className="space-y-5">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <StatusBadge
            label={statusLabels[proof.status] || proof.status}
            variant={proof.status as 'paid' | 'pending' | 'overdue'}
          />
          <span className="text-sm text-on-surface-variant font-inter">
            {new Date(proof.submitted_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Proof image */}
        {proof.image && (
          <div className="rounded-lg overflow-hidden border border-white/10 bg-black/20">
            <img
              src={proof.image.startsWith('http') ? proof.image : `${window.location.origin}${proof.image}`}
              alt="Comprobante de pago"
              className="w-full max-h-80 object-contain"
            />
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-inter mb-1">Método</p>
            <p className="text-sm text-on-surface font-inter font-medium">
              {methodLabels[proof.method] || proof.method}
            </p>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-inter mb-1">Monto en VES</p>
            <p className="text-sm text-on-surface font-inter font-medium">
              {parseFloat(proof.amount_ves).toLocaleString('es-ES', { minimumFractionDigits: 2 })} VES
              {rate ? <span className="ml-1 text-on-surface-variant">({formatUSD(parseFloat(proof.amount_ves) / rate)})</span> : null}
            </p>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-inter mb-1">Teléfono</p>
            <p className="text-sm text-on-surface font-inter font-medium">{proof.phone}</p>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-inter mb-1">Cédula / RIF</p>
            <p className="text-sm text-on-surface font-inter font-medium">
              {proof.id_number}
            </p>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-inter mb-1">Referencia</p>
            <p className="text-sm text-on-surface font-inter font-medium">{proof.reference || '—'}</p>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-inter mb-1">Banco de origen</p>
            <p className="text-sm text-on-surface font-inter font-medium">{proof.bank_origin || '—'}</p>
          </div>
        </div>

        {/* Actions */}
        {proof.status === 'pending' && (
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg glass-panel text-on-surface font-inter text-sm hover:bg-white/10 transition-colors"
              disabled={verifying}
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-inter text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {invoiceType === 'plan_renewal' ? 'Verificar y renovar' : 'Verificar pago'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
