import { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';
import { getStaffMember, updateStaffMember } from '../../services/staffService';
import { register } from '../../services/authService';
import type { StaffMember } from '../../types';
import { toast } from 'sonner';

const specialtyLabels: Record<string, string> = {
  speed: 'Velocidad',
  power: 'Potencia',
};

interface StaffAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: number | null;
  onSuccess?: () => void;
}

export default function StaffAccessModal({
  isOpen,
  onClose,
  staffId,
  onSuccess,
}: StaffAccessModalProps) {
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form fields for creating user
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('coach');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen && staffId) {
      setLoading(true);
      getStaffMember(staffId)
        .then((data) => {
          setStaff(data);
          // Pre-fill form with staff info if no user linked
          if (!data.user) {
            const nameParts = data.name.toLowerCase().split(' ');
            setUsername(nameParts.join('.'));
            setEmail(`${nameParts.join('.')}@starpay.com`);
          }
        })
        .catch(() => {
          toast.error('Error al cargar los datos del personal');
        })
        .finally(() => {
          setLoading(false);
        });
    }
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, staffId]);

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setRole('coach');
    setPhone('');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!staff) return;

    setActionLoading(true);
    try {
      // Create user
      const result = await register({
        email,
        username,
        password,
        role,
        phone: phone || undefined,
      });

      // Link user to staff
      await updateStaffMember(staff.id, {
        user: result.user.id,
      });

      toast.success(`Usuario creado correctamente para ${staff.name}`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const responseData = err?.response?.data;
      let errorMsg = 'Error al crear el usuario';
      
      if (responseData) {
        if (typeof responseData === 'string') {
          errorMsg = responseData;
        } else if (responseData.detail) {
          errorMsg = responseData.detail;
        } else {
          const fieldErrors: string[] = [];
          for (const [key, value] of Object.entries(responseData)) {
            if (Array.isArray(value) && value.length > 0) {
              fieldErrors.push(`${key}: ${value[0]}`);
            } else if (typeof value === 'string') {
              fieldErrors.push(`${key}: ${value}`);
            }
          }
          if (fieldErrors.length > 0) {
            errorMsg = fieldErrors.join(', ');
          }
        }
      }
      
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkUser = async () => {
    if (!staff || !staff.user) return;

    setActionLoading(true);
    try {
      await updateStaffMember(staff.id, {
        user: null,
      });

      toast.success(`Acceso desvinculado correctamente de ${staff.name}`);
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Error al desvincular el acceso');
    } finally {
      setActionLoading(false);
    }
  };

  if (!staffId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestión de acceso" size="lg">
      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-surface-variant rounded-lg animate-pulse"></div>
          <div className="h-32 bg-surface-variant rounded-lg animate-pulse"></div>
        </div>
      ) : staff ? (
        <div className="space-y-6">
          {/* Staff Info Header */}
          <div className="glass-panel rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center">
                  <span className="text-lg font-montserrat font-bold text-on-surface-variant">
                    {staff.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-surface rounded-full ${
                  staff.status === 'in_facility' ? 'bg-amber-500' :
                  'bg-surface-variant'
                }`}></div>
              </div>
              <div>
                <h3 className="text-lg font-montserrat font-semibold text-on-surface">{staff.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge
                    label={specialtyLabels[staff.specialty] || staff.specialty}
                    variant={staff.specialty as any}
                  />
                  <StatusBadge
                    label={staff.status === 'in_facility' ? 'En instalaciones' : 'Fuera de servicio'}
                    variant={staff.status as any}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Access Status */}
          <div className="glass-panel rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  staff.user ? 'bg-primary/20' : 'bg-surface-variant'
                }`}>
                  <Icon
                    name={staff.user ? 'verified_user' : 'person_off'}
                    className={`w-5 h-5 ${staff.user ? 'text-primary' : 'text-on-surface-variant'}`}
                  />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-on-surface font-inter">
                    {staff.user ? 'Acceso habilitado' : 'Sin acceso al sistema'}
                  </h4>
                  <p className="text-sm text-on-surface-variant font-inter">
                    {staff.user
                      ? `Usuario vinculado (ID: ${staff.user})`
                      : 'Este miembro del personal no tiene credenciales para acceder al sistema'}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold font-inter ${
                staff.user
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-surface-variant text-on-surface-variant'
              }`}>
                {staff.user ? 'ACTIVO' : 'INACTIVO'}
              </div>
            </div>
          </div>

          {/* If no user linked - show create form */}
          {!staff.user && (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="person_add" className="w-5 h-5 text-primary" />
                <h4 className="text-base font-semibold text-on-surface font-montserrat">Crear usuario de acceso</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-inter text-on-surface-variant mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
                    placeholder="email@starpay.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-inter text-on-surface-variant mb-1">Usuario</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
                    placeholder="nombre.usuario"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-inter text-on-surface-variant mb-1">Rol</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-gray-300 font-inter focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="admin">Administrador</option>
                    <option value="coach">Entrenador</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-inter text-on-surface-variant mb-1">Teléfono (opcional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
                    placeholder="+54 9 11 ..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-inter text-on-surface-variant mb-1">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 pr-10 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-inter text-on-surface-variant mb-1">Confirmar contraseña</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-3 py-2 text-on-surface font-inter focus:outline-none focus:border-primary transition-colors"
                    placeholder="Repetir contraseña"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg glass-panel text-on-surface font-inter text-sm hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-inter text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  <Icon name="person_add" className="w-4 h-4" />
                  {actionLoading ? 'Creando...' : 'Crear y vincular usuario'}
                </button>
              </div>
            </form>
          )}

          {/* If user linked - show unlink option */}
          {staff.user && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="warning" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-amber-400 font-inter">Desvincular acceso</h5>
                    <p className="text-xs text-amber-300/80 font-inter mt-1">
                      Al desvincular el acceso, el usuario ya no podrá iniciar sesión en el sistema. Esta acción no elimina al usuario, solo remueve la vinculación con este miembro del personal.
                    </p>
                  </div>
                </div>
              </div>

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
                  onClick={handleUnlinkUser}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-error/10 text-error font-inter text-sm hover:bg-error/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Icon name="link_off" className="w-4 h-4" />
                  {actionLoading ? 'Desvinculando...' : 'Desvincular acceso'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
