import Modal from './Modal';
import StatusBadge from '../ui/StatusBadge';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import type { Invoice, PaymentProof } from '../../types';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  proofs: PaymentProof[];
  isAdmin: boolean;
  onDelete: () => void;
}

const methodLabels: Record<string, string> = {
  pago_movil: 'Pago Móvil',
  transferencia: 'Transferencia',
  cash: 'Efectivo',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  overdue: 'Vencido',
};

export default function InvoiceDetailModal({ isOpen, onClose, invoice, proofs, isAdmin, onDelete }: InvoiceDetailModalProps) {
  const { formatBoth } = useExchangeRate();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`FAC-${invoice.id.toString().padStart(5, '0')}`} size="lg">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <StatusBadge
            label={statusLabels[invoice.status] || invoice.status}
            variant={invoice.status as 'paid' | 'pending' | 'overdue'}
          />
          {invoice.invoice_type === 'plan_renewal' && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-semibold font-inter">
              Renovación
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-inter mb-1">Atleta</p>
            <p className="text-sm text-on-surface font-inter font-medium">{invoice.athlete_name}</p>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-inter mb-1">Monto</p>
            <p className="text-sm text-on-surface font-inter font-medium">{formatBoth(parseFloat(invoice.amount))}</p>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-inter mb-1">Descripción</p>
            <p className="text-sm text-on-surface font-inter font-medium">{invoice.description || '—'}</p>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-inter mb-1">Fecha de vencimiento</p>
            <p className="text-sm text-on-surface font-inter font-medium">
              {new Date(invoice.due_date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {proofs.length > 0 && (
          <>
            <h3 className="font-montserrat text-sm font-semibold text-on-surface pt-2 border-t border-white/10">
              Comprobante de pago
            </h3>
            {proofs.map((proof) => (
              <div key={proof.id} className="space-y-4">
                {proof.image && (
                  <div className="rounded-lg overflow-hidden border border-white/10 bg-black/20">
                    <img
                      src={proof.image.startsWith('http') ? proof.image : `${window.location.origin}${proof.image}`}
                      alt="Comprobante de pago"
                      className="w-full max-h-80 object-contain"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel rounded-lg p-3">
                    <p className="text-xs text-on-surface-variant font-inter mb-1">Método</p>
                    <p className="text-sm text-on-surface font-inter font-medium">
                      {methodLabels[proof.method] || proof.method}
                    </p>
                  </div>
                  <div className="glass-panel rounded-lg p-3">
                    <p className="text-xs text-on-surface-variant font-inter mb-1">Estado</p>
                    <StatusBadge label={statusLabels[proof.status] || proof.status} variant={proof.status as 'paid' | 'pending' | 'overdue'} />
                  </div>
                  <div className="glass-panel rounded-lg p-3">
                    <p className="text-xs text-on-surface-variant font-inter mb-1">Monto en VES</p>
                    <p className="text-sm text-on-surface font-inter font-medium">
                      {parseFloat(proof.amount_ves).toLocaleString('es-ES', { minimumFractionDigits: 2 })} VES
                    </p>
                  </div>
                  {proof.method !== 'cash' && (
                    <>
                      <div className="glass-panel rounded-lg p-3">
                        <p className="text-xs text-on-surface-variant font-inter mb-1">Teléfono</p>
                        <p className="text-sm text-on-surface font-inter font-medium">{proof.phone}</p>
                      </div>
                      <div className="glass-panel rounded-lg p-3">
                        <p className="text-xs text-on-surface-variant font-inter mb-1">Cédula / RIF</p>
                        <p className="text-sm text-on-surface font-inter font-medium">{proof.id_number}</p>
                      </div>
                      <div className="glass-panel rounded-lg p-3">
                        <p className="text-xs text-on-surface-variant font-inter mb-1">Referencia</p>
                        <p className="text-sm text-on-surface font-inter font-medium">{proof.reference || '—'}</p>
                      </div>
                      <div className="glass-panel rounded-lg p-3">
                        <p className="text-xs text-on-surface-variant font-inter mb-1">Banco de origen</p>
                        <p className="text-sm text-on-surface font-inter font-medium">{proof.bank_origin || '—'}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-xs text-on-surface-variant font-inter text-right">
                  {new Date(proof.submitted_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        <div className="flex gap-3 justify-end pt-2 border-t border-white/10">
          {isAdmin && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 rounded-lg bg-error-container text-error font-inter text-sm font-semibold hover:bg-error-container/80 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar factura
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg glass-panel text-on-surface font-inter text-sm hover:bg-white/10 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
