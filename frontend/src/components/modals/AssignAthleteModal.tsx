import { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from '../ui/Icon';
import { getAthletes } from '../../services/athleteService';
import { addCompetitionAthlete } from '../../services/competitionService';
import type { Athlete } from '../../types';
import { toast } from 'sonner';

interface AssignAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitionId: number;
  onSuccess: () => void;
}

export default function AssignAthleteModal({ isOpen, onClose, competitionId, onSuccess }: AssignAthleteModalProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedAthleteId(null);
      getAthletes().then(setAthletes).catch(() => setAthletes([]));
    }
  }, [isOpen]);

  const uniqueAthletes = athletes.filter(
    (a, i, arr) => arr.findIndex((x) => x.id === a.id) === i
  );

  const handleAssign = async () => {
    if (!selectedAthleteId) return;
    setLoading(true);
    try {
      await addCompetitionAthlete(competitionId, selectedAthleteId, 'invited');
      toast.success('Atleta registrado en la competencia');
      onSuccess();
      onClose();
    } catch {
      toast.error('Error al registrar el atleta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar atleta en competencia" size="md">
      <div className="space-y-4">
        <p className="text-sm text-on-surface-variant font-inter">
          Selecciona el atleta que deseas registrar en esta competencia.
        </p>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {uniqueAthletes.length === 0 && (
            <p className="text-sm text-on-surface-variant font-inter text-center py-8">
              No hay atletas disponibles
            </p>
          )}
          {uniqueAthletes.map((athlete) => (
            <button
              key={athlete.id}
              type="button"
              onClick={() => setSelectedAthleteId(athlete.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                selectedAthleteId === athlete.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'glass-panel hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-sm font-bold text-on-surface-variant">
                {athlete.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface font-inter">{athlete.name}</p>
                <p className="text-xs text-on-surface-variant font-inter">
                  {athlete.level === 'elite' ? 'Élite' : athlete.level === 'pro' ? 'Profesional' : 'Principiante'}
                  {' — '}
                  {athlete.coach_names?.[0] || 'Sin coach'}
                </p>
              </div>
              {selectedAthleteId === athlete.id && (
                <Icon name="check_circle" className="w-5 h-5 text-primary" />
              )}
            </button>
          ))}
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
            type="button"
            onClick={handleAssign}
            disabled={!selectedAthleteId || loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-inter text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            <Icon name="group_add" className="w-4 h-4" />
            {loading ? 'Registrando...' : 'Registrar atleta'}
          </button>
        </div>
      </div>
    </Modal>
  );
}