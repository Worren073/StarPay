import { useState, useEffect } from 'react';
import Modal from './Modal';
import { createCompetition, updateCompetition } from '../../services/competitionService';
import type { Competition } from '../../types';
import { toast } from 'sonner';

interface CompetitionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  competition?: Competition | null;
  onSuccess: () => void;
}

export default function CompetitionFormModal({ isOpen, onClose, competition, onSuccess }: CompetitionFormModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('qualifier');
  const [status, setStatus] = useState('upcoming');
  const [maxAthletes, setMaxAthletes] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (competition) {
        setName(competition.name);
        setDate(competition.date);
        setLocation(competition.location);
        setType(competition.type);
        setStatus(competition.status);
        setMaxAthletes(competition.max_athletes.toString());
        setDescription(competition.description);
      } else {
        setName('');
        setDate('');
        setLocation('');
        setType('qualifier');
        setStatus('upcoming');
        setMaxAthletes('');
        setDescription('');
      }
    }
  }, [isOpen, competition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name,
        date,
        location,
        type: type as 'qualifier' | 'championship' | 'exhibition',
        status: status as 'upcoming' | 'ongoing' | 'completed',
        max_athletes: parseInt(maxAthletes),
        description,
      };
      if (competition) {
        await updateCompetition(competition.id, data);
        toast.success('Competencia actualizada correctamente');
      } else {
        await createCompetition(data);
        toast.success('Competencia creada correctamente');
      }
      onSuccess();
      onClose();
    } catch {
      toast.error('Error al guardar la competencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={competition ? 'Editar competencia' : 'Nueva competencia'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-inter text-on-surface-variant mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Ubicación</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
            >
              <option value="qualifier">Clasificatoria</option>
              <option value="championship">Campeonato</option>
              <option value="exhibition">Exhibición</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
            >
              <option value="upcoming">Próxima</option>
              <option value="ongoing">En curso</option>
              <option value="completed">Completada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Máx. atletas</label>
            <input
              type="number"
              value={maxAthletes}
              onChange={(e) => setMaxAthletes(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              min="1"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-inter text-on-surface-variant mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors resize-none"
            rows={3}
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
            {loading ? 'Guardando...' : competition ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
