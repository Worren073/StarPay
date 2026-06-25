import { useEffect, useState, useMemo } from 'react';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Skeleton from '../components/ui/Skeleton';
import CompetitionFormModal from '../components/modals/CompetitionFormModal';
import CompetitionDetailModal from '../components/modals/CompetitionDetailModal';
import ResultFormModal from '../components/modals/ResultFormModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { getCompetitions, getCompetitionResults, deleteCompetition } from '../services/competitionService';
import type { Competition, Result } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function Competitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const isCoach = user?.role === 'coach';

  const yearProgress = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  }, []);

  const loadCompetitions = async () => {
    try {
      const params = isCoach ? { coach_assigned: 'true' } : undefined;
      const comps = await getCompetitions(params);
      setCompetitions(comps);
      const completed = comps.find((c) => c.status === 'completed');
      if (completed) {
        try {
          const res = await getCompetitionResults(completed.id);
          setResults(res);
        } catch {
          // Results endpoint may not work in all setups, this is non-critical
          setResults([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitions();
  }, []);

  const handleEdit = (comp: Competition) => {
    setSelectedCompetition(comp);
    setDetailModalOpen(false);
    setFormModalOpen(true);
  };

  const handleDelete = (comp: Competition) => {
    setSelectedCompetition(comp);
    setDetailModalOpen(false);
    setDeleteModalOpen(true);
  };

  const handleDetail = (comp: Competition) => {
    setSelectedCompetition(comp);
    setDetailModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCompetition) return;
    setDeleteLoading(true);
    try {
      await deleteCompetition(selectedCompetition.id);
      toast.success('Competencia eliminada correctamente');
      loadCompetitions();
    } catch {
      toast.error('Error al eliminar la competencia');
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelectedCompetition(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'qualifier': return 'bg-primary-container shadow-[0_0_10px_#06b6d4]';
      case 'championship': return 'bg-secondary-container';
      default: return 'bg-tertiary';
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8" />
            <Skeleton className="w-80 h-4" />
          </div>
          <Skeleton className="w-32 h-12" />
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-40" />)}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="font-montserrat text-2xl md:text-3xl font-semibold text-on-surface">Competencias 🏆⛸️</h2>
          <p className="font-inter text-base text-on-surface-variant mt-1">Gestiona eventos, registra resultados y monitorea la preparación de los atletas.</p>
        </div>
        <div className="flex gap-3">
          {(user?.role === 'admin' || user?.role === 'coach') && (
            <Button
              variant="ghost"
              icon="emoji_events"
              className='mb-4'
              onClick={() => setResultModalOpen(true)}
            >
              Registrar resultado
            </Button>
          )}
          {isAdmin && (
            <Button variant="primary" className='mb-4' icon="add" onClick={() => { setSelectedCompetition(null); setFormModalOpen(true); }}>Nuevo evento</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between glass-panel px-6 py-4 rounded-xl">
              <h3 className="font-montserrat text-xl font-semibold text-on-surface flex items-center gap-2">
                <Icon name="calendar_month" className="w-6 h-6 text-primary" />
                Próximos eventos 
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors border font-inter text-sm ${
                  viewMode === 'list'
                    ? 'bg-bg-active text-primary border-primary/30'
                    : 'bg-transparent text-on-surface-variant hover:text-primary border-transparent'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors border font-inter text-sm ${
                  viewMode === 'grid'
                    ? 'bg-bg-active text-primary border-primary/30'
                    : 'bg-transparent text-on-surface-variant hover:text-primary border-transparent'
                }`}
              >
                Cuadrícula
              </button>
            </div>
          </div>

          {/* List View */}
          {viewMode === 'list' && (
            <div className="flex flex-col gap-4">
              {competitions.map((comp) => (
                <GlassCard key={comp.id} className="flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1 h-full ${getTypeColor(comp.type)}`}></div>
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-lg bg-surface-container/50 border border-border-subtle">
                    <span className="font-montserrat text-xl font-bold text-primary">{new Date(comp.date).getDate()}</span>
                    <span className="text-xs text-on-surface-variant uppercase tracking-widest font-inter">
                      {new Date(comp.date).toLocaleString('es', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusBadge
                        label={comp.type === 'qualifier' ? 'Clasificatoria' : comp.type === 'championship' ? 'Campeonato' : 'Exhibición'}
                        variant={comp.type as 'qualifier' | 'championship' | 'exhibition'}
                      />
                      <span className="text-xs text-on-surface-variant flex items-center gap-1 font-inter">
                        <Icon name="location_on" className="w-4 h-4" />
                        {comp.location}
                      </span>
                    </div>
                    <h4 className="font-montserrat text-xl font-semibold text-on-surface mb-1">{comp.name}</h4>
                    <p className="font-inter text-base text-on-surface-variant line-clamp-1">{comp.description}</p>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-border-subtle pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0 min-w-[120px]">
                    <div className="text-center md:text-right">
                      <div className="font-montserrat text-2xl font-bold text-primary">{comp.results_count}</div>
                      <div className="text-xs text-on-surface-variant font-inter">Resultados</div>
                    </div>
                    <div className="flex items-center gap-2 mt-0 md:mt-4">
                      {isAdmin && (
                        <>
                          <button onClick={() => handleEdit(comp)} className="text-on-surface-variant hover:text-primary transition-colors">
                            <Icon name="settings" className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(comp)} className="text-on-surface-variant hover:text-error transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDetail(comp)}
                        className="text-primary hover:text-primary-fixed-dim font-inter text-sm flex items-center gap-1 transition-colors"
                      >
                        Gestionar <Icon name="arrow_forward" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitions.map((comp) => (
                <GlassCard
                  key={comp.id}
                  className="relative overflow-hidden cursor-pointer hover:border-primary/40 transition-all duration-300"
                  onClick={() => handleDetail(comp)}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${getTypeColor(comp.type)}`}></div>
                  <div className="p-4 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <StatusBadge
                            label={comp.type === 'qualifier' ? 'Clasificatoria' : comp.type === 'championship' ? 'Campeonato' : 'Exhibición'}
                            variant={comp.type as 'qualifier' | 'championship' | 'exhibition'}
                          />
                        </div>
                        <h4 className="font-montserrat text-lg font-semibold text-on-surface mb-1">{comp.name}</h4>
                        <p className="font-inter text-sm text-on-surface-variant line-clamp-1">{comp.location}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-surface-container/50 border border-border-subtle">
                        <span className="font-montserrat text-lg font-bold text-primary">{new Date(comp.date).getDate()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                      <div className="flex items-center gap-2">
                        <Icon name="emoji_events" className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-on-surface-variant font-inter">{comp.results_count} resultados</span>
                      </div>
                      <span className="text-primary text-sm font-inter flex items-center gap-1">
                        Ver detalle <Icon name="arrow_forward" className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-montserrat text-xl font-semibold text-on-surface flex items-center gap-2">
                <Icon name="star" className="w-6 h-6 text-secondary-container" />
                Resultados recientes 🏅
              </h3>
            </div>
            {results.length > 0 && (
              <>
                <h4 className="text-sm text-on-surface-variant uppercase tracking-wider mb-3 font-inter">
                  {competitions.find((c) => c.status === 'completed')?.name}
                </h4>
                <div className="flex flex-col gap-3">
                  {results.slice(0, 3).map((result, i) => (
                    <div key={result.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                      i === 0 ? 'bg-bg-active border border-border-subtle' : 'hover:bg-bg-hover transition-colors'
                    }`}>
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-inter font-bold text-sm ${
                         i === 0 ? 'bg-secondary-container/20 border border-secondary text-secondary' :
                         'bg-surface-variant text-on-surface-variant'
                       }`}>
                         {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : result.position}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-xs font-inter">
                        {result.athlete_name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="font-inter text-sm text-on-surface">{result.athlete_name}</div>
                        <div className="text-xs text-on-surface-variant font-inter">{result.category}</div>
                      </div>
                      <div className="font-inter text-sm text-primary font-mono">{result.score}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {results.length === 0 && (
              <p className="text-on-surface-variant text-sm font-inter">Sin resultados aún</p>
            )}
          </GlassCard>

          <GlassCard className="relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none"></div>
            <h3 className="font-montserrat text-xl font-semibold text-on-surface mb-4">Resumen de temporada 🏆</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-inter text-base text-on-surface-variant">Total de eventos</span>
                <span className="font-montserrat text-xl font-semibold text-on-surface">{competitions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs text-on-surface-variant">Progreso del año</span>
                <span className="font-inter text-xs text-on-surface-variant">{yearProgress}%</span>
              </div>
              <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${yearProgress}%` }}></div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <CompetitionFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setSelectedCompetition(null); }}
        competition={selectedCompetition}
        onSuccess={loadCompetitions}
      />

      <CompetitionDetailModal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedCompetition(null); }}
        competitionId={selectedCompetition?.id || null}
        onEdit={() => selectedCompetition && handleEdit(selectedCompetition)}
        onDelete={() => selectedCompetition && handleDelete(selectedCompetition)}
      />

      <ResultFormModal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        onSuccess={loadCompetitions}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedCompetition(null); }}
        onConfirm={confirmDelete}
        title="Eliminar competencia"
        message={`¿Estás seguro de que deseas eliminar "${selectedCompetition?.name}"? Esta acción no se puede deshacer.`}
        loading={deleteLoading}
      />
    </>
  );
}
