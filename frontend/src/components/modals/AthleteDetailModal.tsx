import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Modal from './Modal';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';
import PlanProgressBar from '../ui/PlanProgressBar';
import ProgressFormModal from './ProgressFormModal';
import { getAthlete, getAthleteProgress, getAthletePlan } from '../../services/athleteService';
import { getInvoices } from '../../services/paymentService';
import type { Athlete, AthleteProgress, AthletePlan, Invoice } from '../../types';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

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
  const [progress, setProgress] = useState<AthleteProgress[]>([]);
  const [athletePlan, setAthletePlan] = useState<AthletePlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { user } = useAuth();
  const isCoachOrAdmin = user?.role === 'admin' || user?.role === 'coach';

  const hasPendingRenewal = invoices.some(
    (inv) => inv.invoice_type === 'plan_renewal' && inv.status === 'pending'
  );

  useEffect(() => {
    if (isOpen && athleteId) {
      setLoading(true);
      setPlanLoading(true);
      Promise.all([
        getAthlete(athleteId),
        getAthleteProgress(athleteId).catch(() => [] as AthleteProgress[]),
        getAthletePlan(athleteId).catch(() => null),
        getInvoices().catch(() => [] as Invoice[]),
      ])
        .then(([data, prog, plan, invs]) => {
          setAthlete(data);
          setProgress(prog);
          setAthletePlan(plan && Object.keys(plan).length > 0 ? plan : null);
          setInvoices(invs.filter((i) => i.athlete === data.id));
        })
        .catch(() => {
          toast.error('Error al cargar los datos del atleta');
        })
        .finally(() => {
          setLoading(false);
          setPlanLoading(false);
        });
    }
  }, [isOpen, athleteId]);

  useEffect(() => {
    if (!loading && athlete && progress.length > 0) {
      const t = setTimeout(() => setChartReady(true), 100);
      return () => clearTimeout(t);
    } else {
      setChartReady(false);
    }
  }, [loading, athlete, progress]);

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

  const handleProgressSuccess = async () => {
    if (athleteId) {
      try {
        const [athleteData, progressData] = await Promise.all([
          getAthlete(athleteId),
          getAthleteProgress(athleteId).catch(() => [] as AthleteProgress[]),
        ]);
        setAthlete(athleteData);
        setProgress(progressData);
      } catch { /* ignore */ }
    }
  };

  if (!athleteId) return null;

  return (
    <>
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
                  {athlete.coach_names?.[0] || athlete.coach_names?.join(', ') || 'Sin asignar'}
                </div>
              </div>
            </div>

            {/* Plan Progress */}
            <PlanProgressBar
              plan={athletePlan}
              loading={planLoading}
              athleteId={athleteId}
              hasPendingRenewal={hasPendingRenewal}
              onRenew={() => {
                getAthletePlan(athleteId!).then((p) => setAthletePlan(p)).catch(() => {});
                getInvoices().then((invs) => setInvoices(invs.filter((i) => i.athlete === athleteId!))).catch(() => {});
              }}
            />

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

            {/* Progress Mountain Chart */}
            {progress.length > 0 && (
              <div>
                <h4 className="text-base font-semibold text-on-surface font-montserrat mb-3">
                  <Icon name="trending_up" className="w-4 h-4 inline-block mr-1 text-primary" />
                  Evolución del progreso
                </h4>
                <div className="glass-panel rounded-lg p-4">
                  <div className="h-52">
                    {chartReady ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                        data={[...progress].reverse().map((p) => ({
                          recorded_at: p.recorded_at,
                          Velocidad: p.speed_score,
                          Técnica: p.technique_score,
                          Forma: p.form_score,
                        }))}
                        margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="tecGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="forGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d4e4fa" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#d4e4fa" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="recorded_at" stroke="rgba(255,255,255,0.25)" fontSize={11} tick={{ fill: 'rgba(255,255,255,0.5)' }} tickFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} />
                        <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.25)" fontSize={11} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(18,33,49,0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#d4e4fa',
                            fontSize: '12px',
                          }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#bec6e0' }} />
                        <Area type="monotone" dataKey="Velocidad" stroke="#06b6d4" strokeWidth={2} fill="url(#velGrad)" dot={{ r: 3, fill: '#06b6d4' }} />
                        <Area type="monotone" dataKey="Técnica" stroke="#3b82f6" strokeWidth={2} fill="url(#tecGrad)" dot={{ r: 3, fill: '#3b82f6' }} />
                        <Area type="monotone" dataKey="Forma" stroke="#d4e4fa" strokeWidth={2} fill="url(#forGrad)" dot={{ r: 3, fill: '#d4e4fa' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {progress.length === 0 && (
              <div className="glass-panel rounded-lg p-4 text-center">
                <Icon name="trending_up" className="w-8 h-8 mx-auto text-on-surface-variant mb-2 opacity-50" />
                <p className="text-sm text-on-surface-variant font-inter">Sin historial de progreso aún</p>
              </div>
            )}

            {/* Register Progress Button (coach/admin only) */}
            {isCoachOrAdmin && (
              <button
                type="button"
                onClick={() => setProgressModalOpen(true)}
                className="w-full px-4 py-3 rounded-lg bg-primary/10 text-primary font-inter text-sm font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="trending_up" className="w-5 h-5" />
                Registrar progreso
              </button>
            )}

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

      {/* Progress Form Modal */}
      {athlete && (
        <ProgressFormModal
          isOpen={progressModalOpen}
          onClose={() => setProgressModalOpen(false)}
          athleteId={athlete.id}
          athleteName={athlete.name}
          currentScores={{
            speed: athlete.speed_score,
            technique: athlete.technique_score,
            form: athlete.form_score,
          }}
          onSuccess={handleProgressSuccess}
        />
      )}
    </>
  );
}
