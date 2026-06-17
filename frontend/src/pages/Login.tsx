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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <style>{`
        @keyframes snowfall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .snowflake { position: absolute; color: rgba(255,255,255,0.4); font-size: 14px; animation: snowfall linear infinite; pointer-events: none; z-index: 9; }
        .snowflake:nth-child(1) { left: 10%; font-size: 12px; animation-duration: 18s; animation-delay: 0s; }
        .snowflake:nth-child(2) { left: 25%; font-size: 18px; animation-duration: 22s; animation-delay: 2s; }
        .snowflake:nth-child(3) { left: 45%; font-size: 10px; animation-duration: 15s; animation-delay: 4s; }
        .snowflake:nth-child(4) { left: 60%; font-size: 16px; animation-duration: 20s; animation-delay: 1s; }
        .snowflake:nth-child(5) { left: 75%; font-size: 14px; animation-duration: 17s; animation-delay: 3s; }
        .snowflake:nth-child(6) { left: 90%; font-size: 11px; animation-duration: 19s; animation-delay: 5s; }
        .login-bg {
          background-image: url('https://i.pinimg.com/736x/f4/8e/95/f48e95d695decd6b0a1c6403cdf357b3.jpg');
          filter: blur(4px);
          transform: scale(1);
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center login-bg"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl"></div>
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
              <path d="M20 85 Q35 90 50 82 Q65 74 80 85" fill="none" stroke="#4cd7f6" strokeWidth="3" strokeLinecap="round" />
              <path d="M25 82 Q40 70 55 78" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            </svg>
          </div>
          <h1 className="font-montserrat text-3xl md:text-5xl font-bold text-primary">StarPay</h1>
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
