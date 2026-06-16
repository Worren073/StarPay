import { useState, useCallback } from 'react';
import Modal from './Modal';
import Icon from '../ui/Icon';
import { submitPayment } from '../../services/paymentService';
import { showErrorToast } from '../../services/api';
import { toast } from 'sonner';
import type { Invoice } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSuccess?: () => void;
}

function formatId(type: string, raw: string): string {
  const clean = raw.replace(/^[VEJ]-/, '');
  return `${type}-${clean}`;
}

export default function PaymentModal({ isOpen, onClose, invoice, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<'pago_movil' | 'transferencia'>('pago_movil');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState<'V' | 'E' | 'J'>('V');
  const [idNumber, setIdNumber] = useState('');
  const [amountVes, setAmountVes] = useState('');
  const [reference, setReference] = useState('');
  const [bankOrigin, setBankOrigin] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleIdTypeChange = useCallback((newType: 'V' | 'E' | 'J') => {
    setIdType(newType);
    setIdNumber((prev) => formatId(newType, prev));
  }, []);

  const handleIdNumberChange = useCallback((value: string) => {
    setIdNumber(formatId(idType, value));
  }, [idType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast.error('Debes adjuntar el comprobante de pago');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('method', method);
      formData.append('phone', phone);
      formData.append('id_type', idType);
      formData.append('id_number', idNumber);
      formData.append('amount_ves', amountVes);
      formData.append('reference', reference);
      formData.append('bank_origin', bankOrigin);
      formData.append('image', image);

      await submitPayment(invoice.id, formData);
      toast.success('Comprobante enviado con éxito. Espera la verificación del administrador.');
      onClose();
      onSuccess?.();
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          const msgs = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
            .join('\n');
          toast.error(msgs || 'Error al enviar el comprobante');
        } else {
          showErrorToast(err, 'Error al enviar el comprobante');
        }
      } else {
        showErrorToast(err, 'Error al enviar el comprobante');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Realizar Pago" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass-panel rounded-lg p-4 space-y-1">
          <p className="text-sm text-on-surface-variant font-inter">Factura #{invoice.id}</p>
          <p className="text-lg font-montserrat font-bold text-on-surface">
            ${invoice.amount} {invoice.description && `- ${invoice.description}`}
          </p>
        </div>

        {/* Method selector */}
        <div>
          <label className="block text-sm font-inter font-medium text-on-surface mb-2">
            Método de pago
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['pago_movil', 'transferencia'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`p-3 rounded-lg border text-sm font-inter font-medium transition-all ${
                  method === m
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/10 text-on-surface-variant hover:border-white/20'
                }`}
              >
                {m === 'pago_movil' ? 'Pago Móvil' : 'Transferencia'}
              </button>
            ))}
          </div>
        </div>

        {/* Shared fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-inter text-on-surface-variant mb-1">Teléfono</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface font-inter text-sm focus:outline-none focus:border-primary"
              placeholder="0412-1234567"
              maxLength={15}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-inter text-on-surface-variant mb-1">Monto en VES</label>
            <input
              type="text"
              value={amountVes}
              onChange={(e) => setAmountVes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface font-inter text-sm focus:outline-none focus:border-primary"
              placeholder="0.00"
              maxLength={14}
              required
            />
          </div>
        </div>

        {/* ID fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-inter text-on-surface-variant mb-1">Tipo de Cédula</label>
            <select
              value={idType}
              onChange={(e) => handleIdTypeChange(e.target.value as 'V' | 'E' | 'J')}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface font-inter text-sm focus:outline-none focus:border-primary"
            >
              <option value="V">Venezolana</option>
              <option value="E">Extranjera</option>
              <option value="J">Jurídica</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-inter text-on-surface-variant mb-1">Cédula / RIF</label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => handleIdNumberChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface font-inter text-sm focus:outline-none focus:border-primary"
              placeholder="V-12345678"
              maxLength={20}
              required
            />
          </div>
        </div>

        {/* Reference & bank origin (both methods) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-inter text-on-surface-variant mb-1">
              Número de referencia
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface font-inter text-sm focus:outline-none focus:border-primary"
              placeholder="REF-123456"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-xs font-inter text-on-surface-variant mb-1">
              Banco de origen
            </label>
            <input
              type="text"
              value={bankOrigin}
              onChange={(e) => setBankOrigin(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface font-inter text-sm focus:outline-none focus:border-primary"
              placeholder="Banco de Venezuela"
              maxLength={100}
            />
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-xs font-inter text-on-surface-variant mb-1">
            Comprobante de pago
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface font-inter text-sm focus:outline-none focus:border-primary file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:text-sm file:font-inter"
              required
            />
          </div>
          {image && (
            <p className="text-xs text-on-surface-variant mt-1 font-inter">{image.name}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg glass-panel text-on-surface font-inter text-sm hover:bg-white/10 transition-colors"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-inter text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Icon name="payments" className="w-4 h-4" />
                Enviar comprobante
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
