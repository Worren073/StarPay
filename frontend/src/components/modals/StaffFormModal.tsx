import { useState, useEffect } from 'react';
import Modal from './Modal';
import { createStaffMember, updateStaffMember } from '../../services/staffService';
import type { StaffMember } from '../../types';
import { toast } from 'sonner';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMember?: StaffMember | null;
  onSuccess: () => void;
}

export default function StaffFormModal({ isOpen, onClose, staffMember, onSuccess }: StaffFormModalProps) {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('speed');
  const [status, setStatus] = useState('off_duty');
  const [athletesCount, setAthletesCount] = useState('0');
  const [nextSessionTime, setNextSessionTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (staffMember) {
        setName(staffMember.name);
        setSpecialty(staffMember.specialty);
        setStatus(staffMember.status);
        setAthletesCount(staffMember.athletes_count.toString());
        setNextSessionTime(staffMember.next_session_time || '');
      } else {
        setName('');
        setSpecialty('speed');
        setStatus('off_duty');
        setAthletesCount('0');
        setNextSessionTime('');
      }
    }
  }, [isOpen, staffMember]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name,
        specialty: specialty as 'speed' | 'power',
        status: status as 'in_facility' | 'off_duty',
        athletes_count: parseInt(athletesCount),
        next_session_time: nextSessionTime || null,
        user: null,
      };
      if (staffMember) {
        await updateStaffMember(staffMember.id, data);
        toast.success('Miembro del personal actualizado correctamente');
      } else {
        await createStaffMember(data);
        toast.success('Miembro del personal creado correctamente');
      }
      onSuccess();
      onClose();
    } catch {
      toast.error('Error al guardar el miembro del personal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={staffMember ? 'Editar miembro' : 'Nuevo miembro'}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
         <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-inter text-on-surface-variant mb-1">Especialidad</label>
             <select
               value={specialty}
               onChange={(e) => setSpecialty(e.target.value)}
               className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-gray-300 font-inter focus:outline-none focus:border-primary transition-colors"
             >
               <option value="speed">Velocidad</option>
               <option value="power">Potencia</option>
             </select>
           </div>
           <div>
             <label className="block text-sm font-inter text-on-surface-variant mb-1">Estado</label>
             <select
               value={status}
               onChange={(e) => setStatus(e.target.value)}
               className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-gray-300 font-inter focus:outline-none focus:border-primary transition-colors"
             >
               <option value="in_facility">En instalaciones</option>
               <option value="off_duty">Fuera de servicio</option>
             </select>
           </div>
         </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Atletas asignados</label>
            <input
              type="number"
              value={athletesCount}
              onChange={(e) => setAthletesCount(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-1">Próxima sesión</label>
            <input
              type="time"
              value={nextSessionTime}
              onChange={(e) => setNextSessionTime(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
            />
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
            {loading ? 'Guardando...' : staffMember ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
