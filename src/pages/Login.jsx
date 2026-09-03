import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Mail, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isResetting) {
        await resetPassword(email);
        setSuccess('Se ha enviado un correo para restablecer tu contraseña.');
      } else if (isRegistering) {
        await register(email, password, displayName);
        navigate('/');
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('El correo electrónico ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError(err.message || 'Ocurrió un error al procesar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-3xl -top-40 -left-40 pointer-events-none" />

      <div className="w-full max-w-md bg-brand-card rounded-3xl p-8 border border-brand-border/60 shadow-2xl relative z-10 backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center text-white shadow-lg shadow-brand-red/30">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">
              Stream<span className="text-brand-red">Fusion</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400">
            {isResetting
              ? 'Ingresa tu correo para recuperar el acceso'
              : isRegistering
              ? 'Crea tu cuenta para disfrutar de todo el catálogo'
              : 'Inicia sesión en tu cuenta'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 flex-none" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 flex-none" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Tu nombre o apodo"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-red"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-red"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {!isResetting && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-red"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          {!isRegistering && !isResetting && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setIsResetting(true);
                  setError('');
                }}
                className="text-xs text-slate-400 hover:text-brand-red font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-red hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-brand-red/30 disabled:opacity-50 mt-2"
          >
            {loading
              ? 'Cargando...'
              : isResetting
              ? 'Enviar Correo de Recuperación'
              : isRegistering
              ? 'Crear Cuenta'
              : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Toggle View Footer */}
        <div className="mt-8 pt-6 border-t border-brand-border/40 text-center text-xs text-slate-400">
          {isResetting ? (
            <button
              onClick={() => {
                setIsResetting(false);
                setError('');
              }}
              className="text-white hover:underline flex items-center justify-center gap-1 mx-auto font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a Iniciar Sesión
            </button>
          ) : isRegistering ? (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                }}
                className="text-brand-red font-bold hover:underline"
              >
                Inicia Sesión
              </button>
            </p>
          ) : (
            <p>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                }}
                className="text-brand-red font-bold hover:underline"
              >
                Regístrate gratis
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
