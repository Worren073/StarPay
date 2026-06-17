import { useState } from 'react';
import Modal from './Modal';
import Icon from '../ui/Icon';
import { createAthleteProgress } from '../../services/athleteService';
import { toast } from 'sonner';

interface ProgressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: number;
  athleteName: string;
  currentScores: { speed: number; technique: number; form: number };
  onSuccess: () => void;
}

export default function ProgressFormModal({
  isOpen,
  onClose,
  athleteId,
  athleteName,
  currentScores,
  onSuccess,
}: ProgressFormModalProps) {
  const [speed, setSpeed] = useState(currentScores.speed);
  const [technique, setTechnique] = useState(currentScores.technique);
  const [form, setForm] = useState(currentScores.form);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAthleteProgress(athleteId, {
        speed_score: speed,
        technique_score: technique,
        form_score: form,
      });
      toast.success('Progreso registrado correctamente');
      onSuccess();
      onClose();
    } catch {
      toast.error('Error al registrar el progreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar progreso 📈" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="font-inter text-sm text-on-surface-variant">
          Registrando progreso para: <span className="font-semibold text-on-surface">{athleteName}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between text-sm font-inter text-on-surface-variant mb-2">
              <span>Velocidad</span>
              <span className="font-montserrat font-bold text-lg text-secondary-container">{speed}</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-surface-variant accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-xs text-on-surface-variant font-inter mt-1">
              <span>0</span>
              <span>100</span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-inter text-on-surface-variant mb-2">
              <span>Técnica</span>
              <span className="font-montserrat font-bold text-lg text-primary">{technique}</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={technique}
              onChange={(e) => setTechnique(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-surface-variant accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-xs text-on-surface-variant font-inter mt-1">
              <span>0</span>
              <span>100</span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-inter text-on-surface-variant mb-2">
              <span>Forma</span>
              <span className="font-montserrat font-bold text-lg text-on-surface">{form}</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={form}
              onChange={(e) => setForm(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-surface-variant accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-xs text-on-surface-variant font-inter mt-1">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-lg p-3 flex items-center gap-2">
          <Icon name="info" className="w-4 h-4 text-primary" />
          <span className="text-xs text-on-surface-variant font-inter">
            Esto actualizará las estadísticas del atleta y guardará el historial.
          </span>
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
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-inter text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            <Icon name="save" className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar progreso'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
