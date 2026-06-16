import { useEffect, useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import Icon from '../components/ui/Icon';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import InvoiceFormModal from '../components/modals/InvoiceFormModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import ProofReviewModal from '../components/modals/ProofReviewModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { getInvoices, getPaymentSummary, getTransactions, getInvoiceProofs, submitCashPayment, deleteInvoice } from '../services/paymentService';
import type { Invoice, PaymentSummary, Transaction, PaymentProof } from '../types';
import InvoiceDetailModal from '../components/modals/InvoiceDetailModal';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useExchangeRate } from '../hooks/useExchangeRate';

export default function Payments() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reviewProof, setReviewProof] = useState<PaymentProof | null>(null);
  const [reviewInvoiceType, setReviewInvoiceType] = useState<string>('other');
  const [proofsByInvoice, setProofsByInvoice] = useState<Record<number, PaymentProof[]>>({});
  const [collectingInvoice, setCollectingInvoice] = useState<number | null>(null);
  const [cashConfirmInvoice, setCashConfirmInvoice] = useState<Invoice | null>(null);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [detailProofs, setDetailProofs] = useState<PaymentProof[]>([]);
  const { user } = useAuth();
  const { formatBoth } = useExchangeRate();
  const isAdmin = user?.role === 'admin';

  const loadData = async () => {
    try {
      const [invData, summaryData, txnData] = await Promise.all([
        getInvoices(),
        getPaymentSummary(),
        getTransactions(),
      ]);
      setInvoices(invData);
      setSummary(summaryData);
      setTransactions(txnData);

      // Fetch proofs for pending invoices
      const pendingInvs = invData.filter((inv) => inv.status === 'pending');
      if (pendingInvs.length > 0) {
        const results = await Promise.allSettled(
          pendingInvs.map((inv) => getInvoiceProofs(inv.id))
        );
        const map: Record<number, PaymentProof[]> = {};
        pendingInvs.forEach((inv, i) => {
          if (results[i].status === 'fulfilled') {
            const proofs = (results[i] as PromiseFulfilledResult<PaymentProof[]>).value;
            if (proofs.length > 0) map[inv.id] = proofs;
          }
        });
        setProofsByInvoice(map);
      } else {
        setProofsByInvoice({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmDelete = async () => {
    if (!selectedInvoice) return;
    setDeleteLoading(true);
    try {
      await deleteInvoice(selectedInvoice.id);
      toast.success('Factura eliminada correctamente');
      loadData();
    } catch {
      toast.error('Error al eliminar la factura');
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelectedInvoice(null);
    }
  };

  const handleCardClick = async (invoice: Invoice) => {
    const proofs = await getInvoiceProofs(invoice.id);
    const pending = proofs.find((p) => p.status === 'pending');
    if (pending) {
      setReviewProof(pending);
      setReviewInvoiceType(invoice.invoice_type);
    } else {
      setDetailProofs(proofs);
      setDetailInvoice(invoice);
    }
  };

  const handleCashCollect = async (invoice: Invoice) => {
    setCashConfirmInvoice(null);
    setCollectingInvoice(invoice.id);
    try {
      await submitCashPayment(invoice.id, {
        method: 'cash',
        phone: '0000000000',
        id_type: 'V',
        id_number: '00000000',
        amount_ves: invoice.amount,
        reference: 'EFECTIVO',
        bank_origin: 'Efectivo',
      });
      toast.success('Pago en efectivo registrado y plan renovado');
      loadData();
    } catch (err) {
      const msg = (err as any)?.response?.data?.error || (err as any)?.response?.data && Object.values((err as any).response.data)[0]?.[0] || 'Error al procesar pago en efectivo';
      toast.error(msg);
    } finally {
      setCollectingInvoice(null);
    }
  };

  if (loading) {
    return (
      <>
        <div className="space-y-2 mb-8">
          <Skeleton className="w-56 h-10" />
          <Skeleton className="w-96 h-4" />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton variant="card" className="h-96" />
          </div>
          <Skeleton variant="card" className="h-96" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-montserrat text-3xl md:text-5xl font-bold text-on-background mb-2">Resumen de pagos</h1>
          <p className="font-inter text-base text-on-surface-variant">Gestiona ingresos, facturas pendientes y ciclos de facturación.</p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon="add" onClick={() => { setSelectedInvoice(null); setFormModalOpen(true); }}>Nueva factura</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard glow>
          <div className="flex justify-between items-start mb-4">
            <span className="font-inter text-sm text-on-surface-variant uppercase tracking-wider">Total recaudado</span>
            <Icon name="account_balance_wallet" className="w-6 h-6 text-primary-container" />
          </div>
          <div>
            <div className="font-montserrat text-3xl md:text-5xl font-bold text-secondary-container mb-1">
              {formatBoth(summary?.total_collected ?? 0)}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <span className="font-inter text-sm text-on-surface-variant uppercase tracking-wider">Pendiente</span>
            <Icon name="pending_actions" className="w-6 h-6 text-error-container" />
          </div>
          <div>
            <div className="font-montserrat text-2xl font-bold text-on-surface mb-1">
              {formatBoth(summary?.outstanding ?? 0)}
            </div>
            <div className="text-xs text-on-surface-variant flex items-center font-inter">
              <Icon name="schedule" className="w-4 h-4 mr-1" />
              {summary?.pending_invoices_count} facturas pendientes
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <span className="font-inter text-sm text-on-surface-variant uppercase tracking-wider">Vencido</span>
            <Icon name="warning" className="w-6 h-6 text-error" />
          </div>
          <div>
            <div className="font-montserrat text-2xl font-bold text-error mb-1">
              {formatBoth(summary?.overdue_amount ?? 0)}
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-montserrat text-xl font-semibold text-on-surface">Transacciones recientes</h2>
          </div>
          <div className="space-y-4">
            {invoices.map((invoice) => {
              const hasPendingProof = proofsByInvoice[invoice.id]?.some((p) => p.status === 'pending');
              return (
                <div
                  key={invoice.id}
                  onClick={() => handleCardClick(invoice)}
                  className="flex items-center justify-between p-3 rounded-lg transition-colors border cursor-pointer hover:bg-white/5 hover:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    {hasPendingProof && (
                      <div className="relative">
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container font-inter text-sm border border-white/5">
                       {invoice.athlete_name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-inter text-sm text-on-surface">{invoice.athlete_name}</div>
                      <div className="text-xs text-on-surface-variant font-inter">
                        FAC-{invoice.id.toString().padStart(5, '0')}
                        {invoice.invoice_type === 'plan_renewal' && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-semibold">
                            Renovación
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-inter text-sm text-on-surface">{formatBoth(invoice.amount)}</div>
                      <StatusBadge
                        label={invoice.status === 'paid' ? 'Pagado' : invoice.status === 'pending' ? 'Pendiente' : 'Vencido'}
                        variant={invoice.status as 'paid' | 'pending' | 'overdue'}
                      />
                    </div>
                    {isAdmin && hasPendingProof && (
                      <div className="px-2 py-1 rounded-md bg-amber-500/20 text-amber-400 text-xs font-inter font-semibold whitespace-nowrap">
                        Revisar
                      </div>
                    )}
                    {isAdmin && !hasPendingProof && invoice.invoice_type === 'plan_renewal' && invoice.status === 'pending' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setCashConfirmInvoice(invoice); }}
                        disabled={collectingInvoice === invoice.id}
                        className="px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-inter font-semibold hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {collectingInvoice === invoice.id ? (
                          <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Icon name="payments" className="w-3.5 h-3.5" />
                        )}
                        Cobrar y renovar
                      </button>
                    )}
                    {isAdmin && !hasPendingProof && invoice.invoice_type !== 'plan_renewal' && (
                      <div className="flex gap-1 ml-2">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedInvoice(invoice); setFormModalOpen(true); }} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                          <Icon name="settings" className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-montserrat text-xl font-semibold text-on-surface">Registro de transacciones</h2>
          </div>
          <div className="space-y-4">
            {transactions.map((txn) => (
              <div key={txn.id} className="p-3 rounded-lg bg-surface-container-high/50 border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-inter text-sm text-on-surface font-medium">{txn.reference}</span>
                  <span className="font-inter text-sm text-on-surface font-semibold">{formatBoth(txn.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-on-surface-variant font-inter">{txn.method}</span>
                  <StatusBadge label={txn.status === 'paid' ? 'Pagado' : txn.status === 'pending' ? 'Pendiente' : 'Vencido'} variant={txn.status as 'paid' | 'pending' | 'overdue'} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <InvoiceFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice}
        onSuccess={loadData}
      />

      {detailInvoice && (
        <InvoiceDetailModal
          isOpen={!!detailInvoice}
          onClose={() => setDetailInvoice(null)}
          invoice={detailInvoice}
          proofs={detailProofs}
          isAdmin={isAdmin}
          onDelete={() => {
            const inv = detailInvoice;
            setDetailInvoice(null);
            setSelectedInvoice(inv);
            setDeleteModalOpen(true);
          }}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedInvoice(null); }}
        onConfirm={confirmDelete}
        title="Eliminar factura"
        message="¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer."
        loading={deleteLoading}
      />

      {reviewProof && (
        <ProofReviewModal
          isOpen={!!reviewProof}
          onClose={() => setReviewProof(null)}
          proof={reviewProof}
          onVerified={loadData}
          invoiceType={reviewInvoiceType}
        />
      )}

      <ConfirmModal
        isOpen={!!cashConfirmInvoice}
        onClose={() => setCashConfirmInvoice(null)}
        onConfirm={() => cashConfirmInvoice && handleCashCollect(cashConfirmInvoice)}
        title="Cobrar en efectivo"
        message={`¿Cobrar ${cashConfirmInvoice ? formatBoth(cashConfirmInvoice.amount) : ''} en efectivo por "${cashConfirmInvoice?.description}"? Esto renovará el plan automáticamente.`}
        confirmLabel="Cobrar y renovar"
        variant="warning"
        icon="question"
        loading={!!collectingInvoice}
      />
    </>
  );
}
