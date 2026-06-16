import { useEffect, useState } from 'react';
import Icon from '../../components/ui/Icon';
import StatusBadge from '../../components/ui/StatusBadge';
import Skeleton from '../../components/ui/Skeleton';
import ConfirmModal from '../../components/ui/ConfirmModal';
import CompetitionDetailModal from '../../components/modals/CompetitionDetailModal';
import { getMyCompetitions } from '../../services/athleteService';
import { getCompetition, respondToCompetition } from '../../services/competitionService';
import { showErrorToast } from '../../services/api';
import type { CompetitionAthlete, Competition } from '../../types';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; variant: string; icon: string; section: string }> = {
  invited: { label: 'Invitado', variant: 'pending', icon: 'mail', section: 'Invitaciones' },
  confirmed: { label: 'Confirmado', variant: 'active', icon: 'check_circle', section: 'Aceptadas' },
  participated: { label: 'Participó', variant: 'paid', icon: 'emoji_events', section: 'Aceptadas' },
  declined: { label: 'Declinado', variant: 'overdue', icon: 'block', section: 'Declinadas' },
};

const typeLabels: Record<string, string> = {
  qualifier: 'Clasificatoria',
  championship: 'Campeonato',
  exhibition: 'Exhibición',
};

export default function AthleteCompetitions() {
  const [assignments, setAssignments] = useState<CompetitionAthlete[]>([]);
  const [competitions, setCompetitions] = useState<Record<number, Competition>>({});
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [declineTarget, setDeclineTarget] = useState<CompetitionAthlete | null>(null);
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    getMyCompetitions()
      .then(async (data) => {
        setAssignments(data);
        const compMap: Record<number, Competition> = {};
        await Promise.all(
          data.map(async (a) => {
            try {
              const c = await getCompetition(a.competition);
              compMap[a.competition] = c;
            } catch { /* ignore */ }
          })
        );
        setCompetitions(compMap);
      })
      .catch((err) => showErrorToast(err, 'Error al cargar competencias'))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (a: CompetitionAthlete) => {
    setAccepting(a.id);
    try {
      await respondToCompetition(a.competition, 'accept');
      toast.success('Invitación aceptada');
      setAssignments((prev) =>
        prev.map((item) => (item.id === a.id ? { ...item, status: 'confirmed' as const } : item))
      );
    } catch (err) {
      showErrorToast(err, 'Error al aceptar invitación');
    } finally {
      setAccepting(null);
    }
  };

  const handleDecline = async () => {
    if (!declineTarget) return;
    setDeclining(true);
    try {
      await respondToCompetition(declineTarget.competition, 'decline');
      toast.success('Invitación rechazada');
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === declineTarget.id ? { ...item, status: 'declined' as const } : item
        )
      );
    } catch (err) {
      showErrorToast(err, 'Error al rechazar invitación');
    } finally {
      setDeclining(false);
      setDeclineTarget(null);
    }
  };

  const invited = assignments.filter((a) => a.status === 'invited');
  const accepted = assignments.filter((a) => a.status === 'confirmed' || a.status === 'participated');
  const declined = assignments.filter((a) => a.status === 'declined');

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-96 h-4" />
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
      </div>
    );
  }

  const renderCard = (a: CompetitionAthlete, showActions: boolean) => {
    const comp = competitions[a.competition];
    const cfg = statusConfig[a.status] || { label: a.status, variant: 'default', icon: 'help', section: '' };
    return (
      <div
        key={a.id}
        className={`glass-panel rounded-xl p-4 transition-all ${comp ? 'cursor-pointer hover:border-primary/40' : ''}`}
        onClick={() => {
          if (comp) {
            setDetailId(a.competition);
            setDetailOpen(true);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-inter font-semibold text-on-surface">
              {comp?.name || `Competencia #${a.competition}`}
            </h3>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {comp && (
                <>
                  <div className="flex items-center gap-1 text-sm text-on-surface-variant font-inter">
                    <Icon name="calendar_month" className="w-4 h-4" />
                    {new Date(comp.date).toLocaleDateString('es-ES')}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-on-surface-variant font-inter">
                    <Icon name="location_on" className="w-4 h-4" />
                    {comp.location}
                  </div>
                </>
              )}
              <StatusBadge label={cfg.label} variant={cfg.variant as any} />
              {comp && (
                <StatusBadge label={typeLabels[comp.type] || comp.type} variant={comp.type as any} />
              )}
            </div>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-3 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAccept(a);
              }}
              disabled={accepting === a.id}
              className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-inter text-sm font-semibold hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {accepting === a.id ? (
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="check" className="w-4 h-4" />
              )}
              Aceptar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeclineTarget(a);
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 font-inter text-sm font-semibold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <Icon name="close" className="w-4 h-4" />
              Rechazar
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-on-surface mb-2">Mis Competencias</h2>
        <p className="font-inter text-base text-on-surface-variant">
          {assignments.length > 0
            ? `${assignments.length} competencia${assignments.length !== 1 ? 's' : ''}`
            : 'No tienes competencias asignadas'}
        </p>
      </div>

      {invited.length > 0 && (
        <div>
          <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
            <Icon name="mail" className="w-5 h-5 text-amber-500" />
            Invitaciones pendientes
          </h3>
          <div className="space-y-3">
            {invited.map((a) => renderCard(a, true))}
          </div>
        </div>
      )}

      {accepted.length > 0 && (
        <div>
          <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
            <Icon name="check_circle" className="w-5 h-5 text-emerald-500" />
            Competencias aceptadas
          </h3>
          <div className="space-y-3">
            {accepted.map((a) => renderCard(a, false))}
          </div>
        </div>
      )}

      {declined.length > 0 && (
        <div>
          <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
            <Icon name="block" className="w-5 h-5 text-red-500" />
            Competencias declinadas
          </h3>
          <div className="space-y-3">
            {declined.map((a) => renderCard(a, false))}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-32 h-32 mb-6 opacity-50">
            <img src="/images/skating-empty.svg" alt="Sin datos" className="w-full h-full" />
          </div>
          <h3 className="font-montserrat text-xl font-semibold text-on-surface mb-2">Sin competencias asignadas</h3>
          <p className="font-inter text-sm text-on-surface-variant text-center max-w-md">
            Aún no has sido convocado a ninguna competencia.
          </p>
        </div>
      )}

      <CompetitionDetailModal
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailId(null);
        }}
        competitionId={detailId}
        onEdit={() => {}}
        onDelete={() => {}}
      />

      <ConfirmModal
        isOpen={!!declineTarget}
        onClose={() => setDeclineTarget(null)}
        onConfirm={handleDecline}
        title="Rechazar invitación"
        message={`¿Estás seguro de que deseas rechazar la invitación a "${declineTarget ? competitions[declineTarget.competition]?.name || 'esta competencia' : ''}"?`}
        confirmLabel="Rechazar"
        variant="danger"
        icon="warning"
        loading={declining}
      />
    </div>
  );
}