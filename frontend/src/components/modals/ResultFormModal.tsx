import { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from '../ui/Icon';
import { getCompetitions, addResult } from '../../services/competitionService';
import { getAthletes } from '../../services/athleteService';
import type { Competition, Athlete } from '../../types';
import { toast } from 'sonner';

interface ResultFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResultFormModal({ isOpen, onClose, onSuccess }: ResultFormModalProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [competitionId, setCompetitionId] = useState<number | ''>('');
  const [athleteId, setAthleteId] = useState<number | ''>('');
  const [score, setScore] = useState('');
  const [position, setPosition] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        getCompetitions({ status: 'ongoing' }),
        getAthletes({ status: 'active' }),
      ])
        .then(([comps, ats]) => {
          setCompetitions(comps);
          setAthletes(ats);
        })
        .catch(() => toast.error('Error al cargar datos'))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitionId || !athleteId || !score || !position) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    setSubmitting(true);
    try {
      await addResult(competitionId, {
        athlete: athleteId,
        score,
        position: parseInt(position),
        category,
      });
      toast.success('Resultado registrado correctamente');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail?: string; error?: string } } }).response?.data?.detail ||
            (err as { response: { data: { detail?: string; error?: string } } }).response?.data?.error ||
            'Error al registrar el resultado'
          : 'Error de red';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCompetitionId('');
    setAthleteId('');
    setScore('');
    setPosition('');
    setCategory('');
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar resultado" size="md">
      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-surface-variant rounded-lg animate-pulse"></div>
          <div className="h-24 bg-surface-variant rounded-lg animate-pulse"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Competición</label>
            <select
              value={competitionId}
              onChange={(e) => setCompetitionId(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              required
            >
              <option value="">Seleccionar competición</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>{c.name} - {new Date(c.date).toLocaleDateString('es-ES')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Atleta</label>
            <select
              value={athleteId}
              onChange={(e) => setAthleteId(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              required
            >
              <option value="">Seleccionar atleta</option>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>{a.name} - {a.level}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter text-on-surface-variant mb-1">Puntaje</label>
              <input
                type="number"
                step="0.01"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-inter text-on-surface-variant mb-1">Posición</label>
              <input
                type="number"
                min="1"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
                placeholder="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Categoría (opcional)</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej: Senior Freeskate"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg glass-panel text-on-surface font-inter text-sm hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-inter text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              <Icon name="save" className="w-4 h-4" />
              {submitting ? 'Registrando...' : 'Registrar resultado'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
