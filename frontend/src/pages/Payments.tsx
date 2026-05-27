import { useEffect, useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import Icon from '../components/ui/Icon';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import InvoiceFormModal from '../components/modals/InvoiceFormModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { getInvoices, getPaymentSummary, getTransactions } from '../services/paymentService';
import type { Invoice, PaymentSummary, Transaction } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function Payments() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();
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

  if (loading) {
    return (
      <>
        <div className="space-y-2 mb-8">
          <Skeleton className="w-56 h-10" />
          <Skeleton className="w-96 h-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      <div className="flex justify-between items-start mb-8">
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
              ${summary?.total_collected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
              ${summary?.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
              ${summary?.overdue_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 flex-1">
        <GlassCard className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-montserrat text-xl font-semibold text-on-surface">Transacciones recientes</h2>
          </div>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container font-inter text-sm mr-3 border border-white/5">
                    {invoice.athlete_name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-inter text-sm text-on-surface">{invoice.athlete_name}</div>
                    <div className="text-xs text-on-surface-variant font-inter">FAC-{invoice.id.toString().padStart(5, '0')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-inter text-sm text-on-surface">${parseFloat(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <StatusBadge
                      label={invoice.status === 'paid' ? 'Pagado' : invoice.status === 'pending' ? 'Pendiente' : 'Vencido'}
                      variant={invoice.status as 'paid' | 'pending' | 'overdue'}
                    />
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => { setSelectedInvoice(invoice); setFormModalOpen(true); }} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                        <Icon name="settings" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
                  <span className="font-inter text-sm text-on-surface font-semibold">${parseFloat(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedInvoice(null); }}
        onConfirm={confirmDelete}
        title="Eliminar factura"
        message="¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer."
        loading={deleteLoading}
      />
    </>
  );
}
