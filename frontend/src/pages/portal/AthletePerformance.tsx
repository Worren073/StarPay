import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../components/ui/Icon';
import StatusBadge from '../../components/ui/StatusBadge';
import Skeleton from '../../components/ui/Skeleton';
import { getMyProfile, getMyProgress, getMyResults } from '../../services/athleteService';
import { showErrorToast } from '../../services/api';
import type { AthleteProfile, AthleteProgress, Result } from '../../types';

export default function AthletePerformance() {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [progressData, setProgressData] = useState<AthleteProgress[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyProfile(), getMyProgress(), getMyResults()])
      .then(([prof, prog, res]) => {
        setProfile(prof);
        setProgressData(prog);
        setResults(res);
      })
      .catch((err) => showErrorToast(err, 'Error al cargar rendimiento'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = [...progressData].reverse().map((p) => ({
    recorded_at: p.recorded_at,
    Velocidad: p.speed_score,
    Técnica: p.technique_score,
    Forma: p.form_score,
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-96 h-4" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-on-surface mb-2">Mi Rendimiento ⛸️📈</h2>
        <p className="font-inter text-base text-on-surface-variant">
          Evolución de tus estadísticas de rendimiento
        </p>
      </div>

      {profile && (
        <div className="glass-panel rounded-xl p-5">
          <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="person" className="w-5 h-5 text-primary" />
            Mi Perfil ⛸️
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-on-surface-variant font-inter uppercase tracking-wider">Nivel</p>
              <p className="font-montserrat font-semibold text-on-surface mt-1">
                {profile.level === 'elite' ? 'Élite' : profile.level === 'pro' ? 'Profesional' : 'Principiante'}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-inter uppercase tracking-wider">Categoría</p>
              <p className="font-montserrat font-semibold text-on-surface mt-1">{profile.category || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-inter uppercase tracking-wider">Edad</p>
              <p className="font-montserrat font-semibold text-on-surface mt-1">{profile.age} años</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-inter uppercase tracking-wider">Estado</p>
              <div className="mt-1">
                <StatusBadge
                  label={profile.status === 'active' ? 'Activo' : 'Inactivo'}
                  variant={profile.status as any}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coach Info */}
      {profile?.coaches && profile.coaches.length > 0 && (
        <div className="glass-panel rounded-xl p-5">
          <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="badge" className="w-5 h-5 text-primary" />
            Mis Entrenadores 👟
          </h3>
          <div className="space-y-3">
            {profile.coach_names.map((name, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-montserrat font-bold text-primary">
                    {name?.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-inter font-semibold text-on-surface text-lg">{name}</p>
                  <p className="text-sm text-on-surface-variant font-inter">
                    Especialidad: {profile.coach_specialties?.[i] === 'speed' ? 'Velocidad' : profile.coach_specialties?.[i] === 'power' ? 'Potencia' : profile.coach_specialties?.[i]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!profile?.coaches || profile.coaches.length === 0) && (
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Icon name="info" className="w-5 h-5 text-on-surface-variant" />
            <p className="font-inter text-sm text-on-surface-variant">Sin entrenador asignado</p>
          </div>
        </div>
      )}

      {/* Current Stats */}
      {profile && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel rounded-xl p-4 text-center">
            <p className="text-xs text-on-surface-variant font-inter uppercase tracking-wider mb-2">⚡ Velocidad</p>
            <p className="font-montserrat text-3xl font-bold text-secondary-container">{profile.speed_score}</p>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <p className="text-xs text-on-surface-variant font-inter uppercase tracking-wider mb-2">🎯 Técnica</p>
            <p className="font-montserrat text-3xl font-bold text-primary">{profile.technique_score}</p>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <p className="text-xs text-on-surface-variant font-inter uppercase tracking-wider mb-2">💃 Forma</p>
            <p className="font-montserrat text-3xl font-bold text-on-surface">{profile.form_score}</p>
          </div>
        </div>
      )}

      {/* Progress Chart */}
      {chartData.length > 0 && (
        <div className="glass-panel rounded-xl p-5">
          <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-4">Evolución 📊</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="recorded_at" tickFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(18,33,49,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#d4e4fa',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Velocidad" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Técnica" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Forma" stroke="#d4e4fa" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-32 h-32 mb-6 opacity-50">
            <img src="/images/skating-empty.svg" alt="Sin datos" className="w-full h-full" />
          </div>
          <h3 className="font-montserrat text-xl font-semibold text-on-surface mb-2">Sin historial de progreso</h3>
          <p className="font-inter text-sm text-on-surface-variant text-center max-w-md">
            Aún no hay registros de progreso. Tu entrenador los agregará después de las sesiones.
          </p>
        </div>
      )}

      {/* Recent Results */}
      {results.length > 0 && (
        <div className="glass-panel rounded-xl p-5">
          <h3 className="font-montserrat text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="emoji_events" className="w-5 h-5 text-amber-500" />
            Últimos Resultados 🏆
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-inter">
              <thead>
                <tr className="text-left text-on-surface-variant border-b border-border-subtle">
                  <th className="pb-2 font-medium">Competencia</th>
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Categoría</th>
                  <th className="pb-2 font-medium">Puntaje</th>
                  <th className="pb-2 font-medium">Posición</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-border-subtle/50">
                    <td className="py-2.5 text-on-surface">{r.competition_name}</td>
                    <td className="py-2.5 text-on-surface-variant">{new Date(r.competition_date).toLocaleDateString('es-ES')}</td>
                    <td className="py-2.5 text-on-surface-variant">{r.category}</td>
                    <td className="py-2.5 text-on-surface font-semibold">{r.score}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.position === 1 ? 'bg-amber-500/20 text-amber-500' :
                        r.position === 2 ? 'bg-gray-400/20 text-gray-400' :
                        r.position === 3 ? 'bg-orange-500/20 text-orange-500' :
                        'bg-surface-variant/50 text-on-surface-variant'
                      }`}>
                        {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : r.position === 3 ? '🥉' : `#${r.position}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
