import { useEffect, useState } from 'react';
import Icon from '../../components/ui/Icon';
import StatusBadge from '../../components/ui/StatusBadge';
import Skeleton from '../../components/ui/Skeleton';
import CompetitionDetailModal from '../../components/modals/CompetitionDetailModal';
import { getMyCompetitions } from '../../services/athleteService';
import { showErrorToast } from '../../services/api';
import type { CompetitionAthlete, Competition } from '../../types';
import { getCompetition } from '../../services/competitionService';

const statusLabels: Record<string, string> = {
  invited: 'Invitado',
  confirmed: 'Confirmado',
  participated: 'Participó',
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-96 h-4" />
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-on-surface mb-2">Mis Competencias</h2>
        <p className="font-inter text-base text-on-surface-variant">
          {assignments.length > 0
            ? `Has sido convocado a ${assignments.length} competencia${assignments.length !== 1 ? 's' : ''}`
            : 'No tienes competencias asignadas'}
        </p>
      </div>

      {assignments.length > 0 && (
        <div className="space-y-3">
          {assignments.map((a) => {
            const comp = competitions[a.competition];
            return (
              <div
                key={a.id}
                className="glass-panel rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all"
                onClick={() => {
                  setDetailId(a.competition);
                  setDetailOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-inter font-semibold text-on-surface">
                      {comp?.name || `Competencia #${a.competition}`}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
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
                      <StatusBadge label={statusLabels[a.status] || a.status} variant={a.status as any} />
                    </div>
                  </div>
                  {comp && (
                    <StatusBadge label={typeLabels[comp.type] || comp.type} variant={comp.type as any} />
                  )}
                </div>
              </div>
            );
          })}
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
    </div>
  );
}
