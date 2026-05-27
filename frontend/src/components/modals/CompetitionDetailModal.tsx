import { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';
import { getCompetition, getCompetitionResults } from '../../services/competitionService';
import type { CompetitionDetail } from '../../types';
import { toast } from 'sonner';

interface CompetitionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitionId: number | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CompetitionDetailModal({
  isOpen,
  onClose,
  competitionId,
  onEdit,
  onDelete,
}: CompetitionDetailModalProps) {
  const [competition, setCompetition] = useState<CompetitionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && competitionId) {
      setLoading(true);
      Promise.all([
        getCompetition(competitionId),
        getCompetitionResults(competitionId).catch(() => [] as any[]),
      ])
        .then(([compData, resultsData]) => {
          setCompetition({ ...compData, results: resultsData || [] });
        })
        .catch(() => {
          toast.error('Error al cargar los datos de la competencia');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, competitionId]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'qualifier': return 'Clasificatoria';
      case 'championship': return 'Campeonato';
      default: return 'Exhibición';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Próxima';
      case 'ongoing': return 'En curso';
      default: return 'Finalizada';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#4cd7f6';
      case 'ongoing': return '#ffe083';
      default: return '#10b981';
    }
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return '#ffe083';
    if (position === 2) return '#bec6e0';
    if (position === 3) return '#cd7f32';
    return undefined;
  };

  if (!competitionId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de la competencia" size="lg">
      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-surface-variant rounded-lg animate-pulse"></div>
          <div className="h-24 bg-surface-variant rounded-lg animate-pulse"></div>
          <div className="h-32 bg-surface-variant rounded-lg animate-pulse"></div>
        </div>
      ) : competition ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge
                  label={getTypeLabel(competition.type)}
                  variant={competition.type as 'qualifier' | 'championship' | 'exhibition'}
                />
                <span
                  className="text-xs font-inter font-semibold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: getStatusColor(competition.status) + '20',
                    color: getStatusColor(competition.status),
                  }}
                >
                  {getStatusLabel(competition.status)}
                </span>
              </div>
              <h3 className="text-xl font-montserrat font-semibold text-on-surface">{competition.name}</h3>
              <p className="text-sm text-on-surface-variant font-inter mt-1">{competition.description}</p>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="calendar_month" className="w-4 h-4 text-primary" />
                <span className="text-xs text-on-surface-variant font-inter">Fecha</span>
              </div>
              <div className="text-base font-semibold text-on-surface font-inter">
                {new Date(competition.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div className="glass-panel rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="location_on" className="w-4 h-4 text-primary" />
                <span className="text-xs text-on-surface-variant font-inter">Ubicación</span>
              </div>
              <div className="text-base font-semibold text-on-surface font-inter">{competition.location}</div>
            </div>
            <div className="glass-panel rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="group" className="w-4 h-4 text-primary" />
                <span className="text-xs text-on-surface-variant font-inter">Máximo de atletas</span>
              </div>
              <div className="text-base font-semibold text-on-surface font-inter">{competition.max_athletes}</div>
            </div>
            <div className="glass-panel rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="emoji_events" className="w-4 h-4 text-secondary" />
                <span className="text-xs text-on-surface-variant font-inter">Resultados registrados</span>
              </div>
              <div className="text-base font-semibold text-on-surface font-inter">{competition.results_count}</div>
            </div>
          </div>

          {/* Results */}
          {competition.results && competition.results.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-on-surface font-montserrat mb-3">Resultados</h4>
              <div className="glass-panel rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-xs text-on-surface-variant font-inter">Pos.</th>
                      <th className="text-left py-3 px-4 text-xs text-on-surface-variant font-inter">Atleta</th>
                      <th className="text-left py-3 px-4 text-xs text-on-surface-variant font-inter">Categoría</th>
                      <th className="text-right py-3 px-4 text-xs text-on-surface-variant font-inter">Puntaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competition.results.map((result) => (
                      <tr key={result.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold font-inter"
                            style={{
                              backgroundColor: getPositionColor(result.position)
                                ? getPositionColor(result.position) + '20'
                                : undefined,
                              color: getPositionColor(result.position),
                            }}
                          >
                            {result.position}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-on-surface font-inter">{result.athlete_name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-on-surface-variant font-inter">{result.category}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-semibold text-primary font-mono">{result.score}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(!competition.results || competition.results.length === 0) && (
            <div className="glass-panel rounded-lg p-6 text-center">
              <Icon name="bar_chart" className="w-12 h-12 mx-auto text-on-surface-variant mb-3 opacity-50" />
              <p className="text-sm text-on-surface-variant font-inter">Sin resultados registrados aún</p>
            </div>
          )}

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
