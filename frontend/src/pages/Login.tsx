import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Correo o contraseña inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl"></div>
      </div>

      <div className="glass-panel rounded-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/20 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-10 h-10">
              <defs>
                <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <path d="M50 15 L58 35 L80 35 L62 48 L70 70 L50 56 L30 70 L38 48 L20 35 L42 35 Z" fill="url(#starGrad)" />
              <path d="M20 85 Q50 75 80 85" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-montserrat text-2xl font-bold text-primary">StarPay</h1>
          <p className="text-on-surface-variant mt-1 font-inter">Gestión de Rendimiento Élite</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error-container/20 border border-error-container/30 rounded-lg p-3 text-error text-sm font-inter">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-2">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-4 py-3 text-on-surface font-inter focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
              placeholder="Ingresa tu correo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-inter text-on-surface-variant mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-4 py-3 text-on-surface font-inter focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-inter font-semibold py-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-xs text-on-surface-variant mt-6 font-inter">
          Demo: admin@starpay.com / admin123
        </p>
      </div>
    </div>
  );
}
