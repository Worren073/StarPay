import { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from '../ui/Icon';
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
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedCoaches, setSelectedCoaches] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getStaff().then(setStaffMembers).catch(console.error);
      if (athlete) {
        setName(athlete.name);
        setAge(athlete.age.toString());
        setLevel(athlete.level);
        setCategory(athlete.category);
        setSpeedScore(athlete.speed_score.toString());
        setTechniqueScore(athlete.technique_score.toString());
        setFormScore(athlete.form_score.toString());
        setSelectedCoaches(athlete.coaches || []);
      } else {
        setName('');
        setAge('');
        setLevel('elite');
        setCategory('');
        setSpeedScore('0');
        setTechniqueScore('0');
        setFormScore('0');
        setSelectedCoaches([]);
      }
    }
  }, [isOpen, athlete]);

  const toggleCoach = (id: number) => {
    setSelectedCoaches((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

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
        coaches: selectedCoaches,
      };
      if (athlete) {
        await updateAthlete(athlete.id, data);
        toast.success('Atleta actualizado correctamente');
      } else {
        await createAthlete({ ...data, user: null });
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
    <Modal isOpen={isOpen} onClose={onClose} title={athlete ? 'Editar atleta ⛸️' : 'Nuevo atleta ⛸️'} size="lg">
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
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-gray-300 font-inter focus:outline-none focus:border-primary transition-colors"
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

        {/* Coach Assignment */}
        {staffMembers.length > 0 && (
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-2">
              <Icon name="badge" className="w-4 h-4 inline-block mr-1 text-primary" />
              Entrenadores asignados
            </label>
            <div className="glass-panel rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {staffMembers.map((sm) => (
                <label
                  key={sm.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedCoaches.includes(sm.id)
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCoaches.includes(sm.id)}
                    onChange={() => toggleCoach(sm.id)}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-7 h-7 rounded-full bg-surface-variant flex items-center justify-center text-xs font-semibold text-on-surface-variant">
                      {sm.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="text-sm font-inter text-on-surface">{sm.name}</span>
                    <span className="text-xs text-on-surface-variant ml-auto font-inter">
                      {sm.specialty === 'speed' ? 'Velocidad' : 'Potencia'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

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
