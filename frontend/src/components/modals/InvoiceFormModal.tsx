import { useState, useEffect } from 'react';
import Modal from './Modal';
import { createInvoice, updateInvoice } from '../../services/paymentService';
import { getAthletes } from '../../services/athleteService';
import type { Invoice, Athlete } from '../../types';
import { toast } from 'sonner';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
  onSuccess: () => void;
}

export default function InvoiceFormModal({ isOpen, onClose, invoice, onSuccess }: InvoiceFormModalProps) {
  const [athlete, setAthlete] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getAthletes().then(setAthletes).catch(console.error);
      if (invoice) {
        setAthlete(invoice.athlete.toString());
        setAmount(invoice.amount);
        setStatus(invoice.status);
        setDueDate(invoice.due_date);
        setDescription(invoice.description);
      } else {
        setAthlete('');
        setAmount('');
        setStatus('pending');
        setDueDate('');
        setDescription('');
      }
    }
  }, [isOpen, invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        athlete: parseInt(athlete),
        amount: amount,
        status: status as 'paid' | 'pending' | 'overdue',
        due_date: dueDate,
        description,
      };
      if (invoice) {
        await updateInvoice(invoice.id, data);
        toast.success('Factura actualizada correctamente');
      } else {
        await createInvoice(data);
        toast.success('Factura creada correctamente');
      }
      onSuccess();
      onClose();
    } catch {
      toast.error('Error al guardar la factura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={invoice ? 'Editar factura 📄' : 'Nueva factura 📄'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-inter text-on-surface-variant mb-1">Atleta</label>
          <select
            value={athlete}
            onChange={(e) => setAthlete(e.target.value)}
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-gray-300 font-inter focus:outline-none focus:border-primary transition-colors"
            required
          >
            <option value="">Seleccionar atleta</option>
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.level})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Monto ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Fecha de vencimiento</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-inter text-on-surface-variant mb-1">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-gray-300 font-inter focus:outline-none focus:border-primary transition-colors"
          >
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="overdue">Vencido</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-inter text-on-surface-variant mb-1">Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
            placeholder="Ej: Cuota mensual - Noviembre"
          />
        </div>
        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg glass-panel text-on-surface font-inter text-sm hover:bg-white/10 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-inter text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Guardando...' : invoice ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
