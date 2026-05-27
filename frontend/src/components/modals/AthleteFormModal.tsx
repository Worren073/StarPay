import { useState, useEffect } from 'react';
import Modal from './Modal';
import { createAthlete, updateAthlete } from '../../services/athleteService';
import { getStaff } from '../../services/staffService';
import type { Athlete, StaffMember } from '../../types';
import { toast } from 'sonner';

interface AthleteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete?: Athlete | null;
  onSuccess: () => void;
}

export default function AthleteFormModal({ isOpen, onClose, athlete, onSuccess }: AthleteFormModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [level, setLevel] = useState('elite');
  const [category, setCategory] = useState('');
  const [speedScore, setSpeedScore] = useState('0');
  const [techniqueScore, setTechniqueScore] = useState('0');
  const [formScore, setFormScore] = useState('0');
  const [coach, setCoach] = useState('');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getStaff().then(setStaff).catch(console.error);
      if (athlete) {
        setName(athlete.name);
        setAge(athlete.age.toString());
        setLevel(athlete.level);
        setCategory(athlete.category);
        setSpeedScore(athlete.speed_score.toString());
        setTechniqueScore(athlete.technique_score.toString());
        setFormScore(athlete.form_score.toString());
        setCoach(athlete.coach?.toString() || '');
      } else {
        setName('');
        setAge('');
        setLevel('elite');
        setCategory('');
        setSpeedScore('0');
        setTechniqueScore('0');
        setFormScore('0');
        setCoach('');
      }
    }
  }, [isOpen, athlete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name,
        age: parseInt(age),
        level: level as 'elite' | 'pro' | 'beginner',
        category,
        status: 'active' as const,
        speed_score: parseInt(speedScore),
        technique_score: parseInt(techniqueScore),
        form_score: parseInt(formScore),
        coach: coach ? parseInt(coach) : null,
        user: null,
      };
      if (athlete) {
        await updateAthlete(athlete.id, data);
        toast.success('Atleta actualizado correctamente');
      } else {
        await createAthlete(data);
        toast.success('Atleta creado correctamente');
      }
      onSuccess();
      onClose();
    } catch {
      toast.error('Error al guardar el atleta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={athlete ? 'Editar atleta' : 'Nuevo atleta'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Edad</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              min="1"
              max="99"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Nivel</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
            >
              <option value="elite">Élite</option>
              <option value="pro">Profesional</option>
              <option value="beginner">Principiante</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Categoría</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej: Senior Freeskate"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-inter text-on-surface-variant mb-1">Entrenador</label>
          <select
            value={coach}
            onChange={(e) => setCoach(e.target.value)}
            className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Sin asignar</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name} - {s.specialty}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-inter text-on-surface-variant mb-2">Puntuaciones (0-100)</label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Velocidad</label>
              <input
                type="number"
                value={speedScore}
                onChange={(e) => setSpeedScore(e.target.value)}
                className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Técnica</label>
              <input
                type="number"
                value={techniqueScore}
                onChange={(e) => setTechniqueScore(e.target.value)}
                className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Forma</label>
              <input
                type="number"
                value={formScore}
                onChange={(e) => setFormScore(e.target.value)}
                className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg glass-panel text-on-surface font-inter text-sm hover:bg-white/10 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-inter text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Guardando...' : athlete ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
