import { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';
import { getAthlete } from '../../services/athleteService';
import type { Athlete } from '../../types';
import { toast } from 'sonner';

interface AthleteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: number | null;
  onEdit: () => void;
  onDelete: () => void;
  onSuccess?: () => void;
}

export default function AthleteDetailModal({
  isOpen,
  onClose,
  athleteId,
  onEdit,
  onDelete,
}: AthleteDetailModalProps) {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && athleteId) {
      setLoading(true);
      getAthlete(athleteId)
        .then((data) => {
          setAthlete(data);
        })
        .catch(() => {
          toast.error('Error al cargar los datos del atleta');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, athleteId]);

  const overallScore = athlete
    ? Math.round((athlete.speed_score + athlete.technique_score + athlete.form_score) / 3)
    : 0;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'elite': return '#ffe083';
      case 'pro': return '#4cd7f6';
      default: return '#bec6e0';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#eec200';
    return '#ff6b6b';
  };

  if (!athleteId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle del atleta" size="lg">
      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-surface-variant rounded-lg animate-pulse"></div>
          <div className="h-24 bg-surface-variant rounded-lg animate-pulse"></div>
          <div className="h-32 bg-surface-variant rounded-lg animate-pulse"></div>
        </div>
      ) : athlete ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: getLevelColor(athlete.level) }}
              >
                <span className="text-2xl font-montserrat font-bold text-on-surface">
                  {athlete.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-montserrat font-semibold text-on-surface">{athlete.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <StatusBadge
                    label={athlete.level === 'elite' ? 'Élite' : athlete.level === 'pro' ? 'Profesional' : 'Principiante'}
                    variant={athlete.level as 'elite' | 'pro' | 'beginner'}
                  />
                  <StatusBadge
                    label={athlete.status === 'active' ? 'Activo' : 'Inactivo'}
                    variant={athlete.status === 'active' ? 'active' : 'inactive'}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-on-surface-variant font-inter">Edad</div>
              <div className="text-2xl font-montserrat font-bold text-primary">{athlete.age}</div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-lg p-4">
              <div className="text-xs text-on-surface-variant font-inter mb-1">Categoría</div>
              <div className="text-base font-semibold text-on-surface font-inter">
                {athlete.category || 'Sin asignar'}
              </div>
            </div>
            <div className="glass-panel rounded-lg p-4">
              <div className="text-xs text-on-surface-variant font-inter mb-1">Entrenador</div>
              <div className="text-base font-semibold text-on-surface font-inter">
                {athlete.coach_name || 'Sin asignar'}
              </div>
            </div>
          </div>

          {/* Scores */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-on-surface font-montserrat">Puntuación general</h4>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-montserrat font-bold" style={{ color: getScoreColor(overallScore) }}>
                  {overallScore}
                </span>
                <span className="text-sm text-on-surface-variant font-inter">/ 100</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Velocidad', score: athlete.speed_score, icon: 'speed' },
                { label: 'Técnica', score: athlete.technique_score, icon: 'construction' },
                { label: 'Forma', score: athlete.form_score, icon: 'fitness_center' },
              ].map((item) => (
                <div key={item.label} className="glass-panel rounded-lg p-4 text-center">
                  <Icon name={item.icon as any} className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-montserrat font-bold mb-1" style={{ color: getScoreColor(item.score) }}>
                    {item.score}
                  </div>
                  <div className="text-xs text-on-surface-variant font-inter">{item.label}</div>
                  <div className="h-1.5 w-full bg-surface-variant rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.score}%`, backgroundColor: getScoreColor(item.score) }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta Info */}
          <div className="text-xs text-on-surface-variant font-inter flex gap-4 pt-2 border-t border-white/10">
            <span>Creado: {new Date(athlete.created_at).toLocaleDateString('es-ES')}</span>
            <span>Actualizado: {new Date(athlete.updated_at).toLocaleDateString('es-ES')}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg glass-panel text-on-surface font-inter text-sm hover:bg-white/10 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 rounded-lg bg-error/10 text-error font-inter text-sm hover:bg-error/20 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-inter text-sm font-semibold flex items-center gap-2"
            >
              <Icon name="settings" className="w-4 h-4" />
              Editar
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
