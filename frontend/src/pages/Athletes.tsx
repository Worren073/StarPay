import { useEffect, useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Skeleton from '../components/ui/Skeleton';
import SearchInput from '../components/ui/SearchInput';
import AthleteFormModal from '../components/modals/AthleteFormModal';
import AthleteDetailModal from '../components/modals/AthleteDetailModal';
import AthleteAccessModal from '../components/modals/AthleteAccessModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { getAthletes, deleteAthlete, generateRenewalInvoice } from '../services/athleteService';
import { showErrorToast } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import type { Athlete } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function Athletes() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const debouncedSearch = useDebounce(searchQuery, 300);

  const loadAthletes = async () => {
    const isSearch = debouncedSearch.trim().length > 0;
    if (isSearch) setSearching(true);
    else setLoading(true);

    try {
      const params: {
        level?: string;
        search?: string;
      } = {};

      if (filter !== 'all') {
        params.level = filter;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const data = await getAthletes(Object.keys(params).length > 0 ? params : undefined);
      setAthletes(data);
    } catch (error) {
      showErrorToast(error, 'Error al cargar los atletas');
      setAthletes([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    loadAthletes();
  }, [filter, debouncedSearch]);

  const handleEdit = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setDetailModalOpen(false);
    setFormModalOpen(true);
  };

  const handleDelete = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setDetailModalOpen(false);
    setDeleteModalOpen(true);
  };

  const handleCardClick = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setDetailModalOpen(true);
  };

  const handleAccess = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setAccessModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAthlete) return;
    setDeleteLoading(true);
    try {
      await deleteAthlete(selectedAthlete.id);
      toast.success('Atleta eliminado correctamente');
      loadAthletes();
    } catch (error) {
      showErrorToast(error, 'Error al eliminar el atleta');
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelectedAthlete(null);
    }
  };

  const hasActiveFilters = filter !== 'all' || searchQuery.trim().length > 0;

  if (loading) {
    return (
      <>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <Skeleton className="w-72 h-10" />
            <Skeleton className="w-56 h-4" />
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="w-28 h-9" />)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" className="h-64" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="font-montserrat text-3xl md:text-5xl font-bold text-on-surface mb-2">Gestión de plantilla</h2>
          <p className="font-inter text-base text-on-surface-variant">
            {hasActiveFilters
              ? `${athletes.length} atleta${athletes.length !== 1 ? 's' : ''} encontrado${athletes.length !== 1 ? 's' : ''}`
              : `Monitoreo activo de ${athletes.length} atletas de élite`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nombre, categoría..."
            isLoading={searching}
            className="w-full sm:w-64"
          />
          <div className="glass-panel mb-2 rounded-lg p-1 flex items-center flex-wrap gap-1">
            {['all', 'elite', 'pro', 'beginner'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md font-inter text-sm transition-colors ${
                  filter === f
                    ? 'bg-white/10 text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {f === 'all'
                  ? 'Todas'
                  : f === 'elite'
                  ? 'Élite'
                  : f === 'pro'
                  ? 'Profesional'
                  : 'Principiante'}
              </button>
            ))}
          </div>
          {isAdmin && (
            <Button
              variant="primary"
              icon="add"
              className='mb-2'
              onClick={() => {
                setSelectedAthlete(null);
                setFormModalOpen(true);
              }}
            >
              Nuevo atleta
            </Button>
          )}
        </div>
      </div>

      {athletes.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-surface-variant/30 flex items-center justify-center mb-6">
            <Icon name="group" className="w-12 h-12 text-on-surface-variant" />
          </div>
          <h3 className="font-montserrat text-xl font-semibold text-on-surface mb-2">
            {hasActiveFilters ? 'No se encontraron atletas' : 'No hay atletas registrados'}
          </h3>
          <p className="font-inter text-sm text-on-surface-variant mb-6 text-center max-w-md">
            {hasActiveFilters
              ? 'Intenta con otros términos de búsqueda o cambia los filtros.'
              : 'Agrega tu primer atleta para empezar a gestionar la plantilla.'}
          </p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
            >
              Limpiar filtros
            </Button>
          )}
          {!hasActiveFilters && isAdmin && (
            <Button
              variant="primary"
              icon="add"
              onClick={() => {
                setSelectedAthlete(null);
                setFormModalOpen(true);
              }}
            >
              Agregar primer atleta
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {athletes.map((athlete) => (
            <GlassCard
              key={athlete.id}
              className="relative overflow-hidden group cursor-pointer hover:border-primary/40 transition-all duration-300"
              onClick={() => handleCardClick(athlete)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div
                      className={`h-12 w-12 rounded-full p-[1px] ${
                        athlete.level === 'elite'
                          ? 'border border-secondary-container/50'
                          : athlete.level === 'pro'
                          ? 'border border-primary/50'
                          : 'border border-white/20'
                      }`}
                    >
                      <div className="h-full w-full rounded-full bg-surface-container overflow-hidden flex items-center justify-center">
                        <span className="text-lg font-montserrat font-bold text-on-surface-variant">
                          {athlete.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-inter text-sm font-bold text-on-surface">{athlete.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <StatusBadge
                          label={
                            athlete.level === 'elite'
                              ? 'Élite'
                              : athlete.level === 'pro'
                              ? 'Profesional'
                              : 'Principiante'
                          }
                          variant={athlete.level as 'elite' | 'pro' | 'beginner'}
                        />
                        {athlete.plan_status && (
                          <StatusBadge
                            label={
                              athlete.plan_status === 'active' && (athlete.days_remaining ?? 0) > 7
                                ? 'Al día'
                                : athlete.plan_status === 'expiring'
                                ? 'Por vencer'
                                : 'Moroso'
                            }
                            variant={
                              athlete.plan_status === 'active' && (athlete.days_remaining ?? 0) > 7
                                ? 'active'
                                : athlete.plan_status === 'expiring'
                                ? 'pending'
                                : 'overdue'
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(athlete);
                        }}
                        className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <Icon name="settings" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(athlete);
                        }}
                        className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs text-on-surface-variant font-inter">Puntuación general</span>
                    <span className="font-inter text-base text-primary font-semibold">
                      {Math.round((athlete.speed_score + athlete.technique_score + athlete.form_score) / 3)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${Math.round((athlete.speed_score + athlete.technique_score + athlete.form_score) / 3)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/30 rounded-lg p-2 border border-white/5 text-center overflow-hidden">
                      <p className="text-xs text-on-surface-variant uppercase mb-1 truncate">Velocidad</p>
                      <p className="font-montserrat text-sm font-bold text-secondary-container">
                        {athlete.speed_score}
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 border border-white/5 text-center overflow-hidden">
                      <p className="text-xs text-on-surface-variant uppercase mb-1 truncate">Técnica</p>
                      <p className="font-montserrat text-sm font-bold text-primary">{athlete.technique_score}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 border border-white/5 text-center overflow-hidden">
                      <p className="text-xs text-on-surface-variant uppercase mb-1 truncate">Forma</p>
                      <p className="font-montserrat text-sm font-bold text-on-surface">{athlete.form_score}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-4">
                    {isAdmin && (
                      <>
                        {athlete.plan_status === 'expired' || athlete.plan_status === 'expiring' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateRenewalInvoice(athlete.id)
                                .then(() => {
                                  toast.success('Factura de renovación generada');
                                })
                                .catch((err) => showErrorToast(err, 'Error al generar factura'));
                            }}
                            className="text-sm text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-inter"
                          >
                            <Icon name="receipt_long" className="w-4 h-4" />
                            Generar renovación
                          </button>
                        ) : null}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccess(athlete);
                          }}
                          className="text-sm text-primary hover:text-primary-fixed transition-colors flex items-center gap-1 font-inter"
                        >
                          Gestionar acceso <Icon name="chevron_right" className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}

          {isAdmin && (
            <div
              className="glass-panel rounded-xl p-6 flex items-center justify-center border-dashed border-white/20 hover:border-primary/50 cursor-pointer transition-colors min-h-[160px]"
              onClick={() => {
                setSelectedAthlete(null);
                setFormModalOpen(true);
              }}
            >
              <div className="text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 text-primary">
                  <Icon name="add" className="w-6 h-6" />
                </div>
                <p className="font-inter text-sm text-on-surface-variant">Agregar atleta</p>
              </div>
            </div>
          )}
        </div>
      )}

      <AthleteFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedAthlete(null);
        }}
        athlete={selectedAthlete}
        onSuccess={loadAthletes}
      />

      <AthleteDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedAthlete(null);
        }}
        athleteId={selectedAthlete?.id || null}
        onEdit={() => selectedAthlete && handleEdit(selectedAthlete)}
        onDelete={() => selectedAthlete && handleDelete(selectedAthlete)}
      />

      <AthleteAccessModal
        isOpen={accessModalOpen}
        onClose={() => {
          setAccessModalOpen(false);
          setSelectedAthlete(null);
        }}
        athleteId={selectedAthlete?.id || null}
        onSuccess={loadAthletes}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedAthlete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar atleta"
        message={`¿Estás seguro de que deseas eliminar a ${selectedAthlete?.name}? Esta acción no se puede deshacer.`}
        loading={deleteLoading}
      />
    </>
  );
}
