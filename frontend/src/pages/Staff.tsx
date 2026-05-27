import { useEffect, useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Skeleton from '../components/ui/Skeleton';
import SearchInput from '../components/ui/SearchInput';
import StaffFormModal from '../components/modals/StaffFormModal';
import StaffAccessModal from '../components/modals/StaffAccessModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { getStaff, deleteStaffMember } from '../services/staffService';
import { showErrorToast } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import type { StaffMember } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const specialtyLabels: Record<string, string> = {
  speed: 'Velocidad',
  power: 'Potencia',
};

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const debouncedSearch = useDebounce(searchQuery, 300);

  const loadStaff = async () => {
    const isSearch = debouncedSearch.trim().length > 0;
    if (isSearch) setSearching(true);
    else setLoading(true);

    try {
      const params: {
        specialty?: string;
        search?: string;
      } = {};

      if (filter !== 'all') {
        params.specialty = filter;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const data = await getStaff(Object.keys(params).length > 0 ? params : undefined);
      setStaff(data);
    } catch (error) {
      showErrorToast(error, 'Error al cargar el personal');
      setStaff([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [filter, debouncedSearch]);

  const handleEdit = (member: StaffMember) => {
    setSelectedStaff(member);
    setFormModalOpen(true);
  };

  const handleAccess = (member: StaffMember) => {
    setSelectedStaff(member);
    setAccessModalOpen(true);
  };

  const handleDelete = (member: StaffMember) => {
    setSelectedStaff(member);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedStaff) return;
    setDeleteLoading(true);
    try {
      await deleteStaffMember(selectedStaff.id);
      toast.success('Miembro del personal eliminado correctamente');
      loadStaff();
    } catch (error) {
      showErrorToast(error, 'Error al eliminar el miembro del personal');
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelectedStaff(null);
    }
  };

  const hasActiveFilters = filter !== 'all' || searchQuery.trim().length > 0;

  if (loading) {
    return (
      <>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <Skeleton className="w-64 h-8" />
            <Skeleton className="w-80 h-4" />
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-24 h-8" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-64" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-semibold text-on-surface mb-2">
            Personal y entrenadores
          </h1>
          <p className="font-inter text-base text-on-surface-variant">
            {hasActiveFilters
              ? `${staff.length} miembro${staff.length !== 1 ? 's' : ''} encontrado${staff.length !== 1 ? 's' : ''}`
              : 'Gestiona especialistas técnicos, instructores y personal administrativo.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nombre..."
            isLoading={searching}
            className="w-full sm:w-64"
          />
          <div className="glass-panel rounded-lg p-1 flex items-center">
            {['all', 'speed', 'power'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md font-inter text-sm transition-colors ${
                  filter === f
                    ? 'bg-white/10 text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {f === 'all' ? 'Todos' : specialtyLabels[f] || f}
              </button>
            ))}
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              icon="add"
              onClick={() => {
                setSelectedStaff(null);
                setFormModalOpen(true);
              }}
            >
              Agregar personal
            </Button>
          )}
        </div>
      </div>

      {staff.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-surface-variant/30 flex items-center justify-center mb-6">
            <Icon name="group" className="w-12 h-12 text-on-surface-variant" />
          </div>
          <h3 className="font-montserrat text-xl font-semibold text-on-surface mb-2">
            {hasActiveFilters ? 'No se encontraron miembros del personal' : 'No hay personal registrado'}
          </h3>
          <p className="font-inter text-sm text-on-surface-variant mb-6 text-center max-w-md">
            {hasActiveFilters
              ? 'Intenta con otros términos de búsqueda o cambia los filtros.'
              : 'Agrega tu primer miembro del personal para empezar.'}
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
                setSelectedStaff(null);
                setFormModalOpen(true);
              }}
            >
              Agregar primer miembro
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map((member) => (
            <GlassCard
              key={member.id}
              className="relative overflow-hidden group transition-all duration-300 hover:border-primary/50"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center">
                      <span className="text-xl font-montserrat font-bold text-on-surface-variant">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                     <div
                       className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-surface rounded-full ${
                         member.status === 'in_facility'
                           ? 'bg-amber-500'
                           : 'bg-surface-variant'
                       }`}
                     ></div>
                  </div>
                  <div>
                    <h3 className="font-montserrat text-lg font-semibold text-on-surface leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-xs text-primary uppercase tracking-wider font-inter">
                      {specialtyLabels[member.specialty] || member.specialty}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(member)}
                      className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <Icon name="settings" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member)}
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

              <div className="grid grid-cols-2 gap-4 mb-6 mt-2">
                <div className="bg-surface-variant/30 rounded-lg p-3 border border-white/5">
                  <div className="text-on-surface-variant text-xs mb-1 flex items-center gap-1 font-inter">
                    <Icon name="group" className="w-3.5 h-3.5" /> Atletas
                  </div>
                  <div className="font-montserrat text-2xl font-bold text-secondary-container leading-none">
                    {member.athletes_count}
                  </div>
                </div>
                <div className="bg-surface-variant/30 rounded-lg p-3 border border-white/5">
                  <div className="text-on-surface-variant text-xs mb-1 flex items-center gap-1 font-inter">
                    <Icon name="schedule" className="w-3.5 h-3.5" /> Próxima sesión
                  </div>
                  <div className="font-montserrat text-base font-semibold text-on-surface leading-none mt-1">
                    {member.next_session_time || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
                <StatusBadge
                  label={
                    member.status === 'in_facility'
                      ? 'En instalaciones'
                      : 'Fuera de servicio'
                  }
                  variant={member.status as 'in_facility' | 'off_duty'}
                />
                {isAdmin && (
                  <button
                    onClick={() => handleAccess(member)}
                    className="text-sm text-primary hover:text-primary-fixed transition-colors flex items-center gap-1 font-inter"
                  >
                    Gestionar acceso <Icon name="chevron_right" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <StaffFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedStaff(null);
        }}
        staffMember={selectedStaff}
        onSuccess={loadStaff}
      />

      <StaffAccessModal
        isOpen={accessModalOpen}
        onClose={() => {
          setAccessModalOpen(false);
          setSelectedStaff(null);
        }}
        staffId={selectedStaff?.id || null}
        onSuccess={loadStaff}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedStaff(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar miembro del personal"
        message={`¿Estás seguro de que deseas eliminar a ${selectedStaff?.name}? Esta acción no se puede deshacer.`}
        loading={deleteLoading}
      />
    </>
  );
}
