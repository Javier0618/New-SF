import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, CheckCircle, AlertCircle, Key, History } from 'lucide-react';

export const Profile = () => {
  const { currentUser, userData, updateUserProfileData, resetPassword, isAdmin } = useAuth();
  const [displayName, setDisplayName] = useState(userData?.displayName || currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState(userData?.photoURL || currentUser?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-brand-dark pt-28 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Acceso restringido</h2>
        <p className="text-slate-400 text-sm">Debes iniciar sesión para ver tu perfil.</p>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await updateUserProfileData({
        displayName,
        photoURL
      });
      setMsg({ type: 'success', text: 'Perfil actualizado con éxito.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Error al actualizar el perfil: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await resetPassword(currentUser.email);
      setMsg({ type: 'success', text: 'Se ha enviado un correo para restablecer tu contraseña.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Error: ' + err.message });
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-16 px-4 sm:px-8 max-w-4xl mx-auto">
      <div className="mb-8 border-b border-brand-border/60 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <User className="w-8 h-8 text-brand-red" /> Mi Perfil
        </h1>
        <p className="text-slate-400 text-sm mt-1">Gestiona tu información personal e historial</p>
      </div>

      {msg.text && (
        <div
          className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-medium ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-none" /> : <AlertCircle className="w-5 h-5 flex-none" />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="bg-brand-card rounded-2xl p-6 border border-brand-border/60 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-brand-red p-1 mb-4 relative overflow-hidden flex items-center justify-center">
            {photoURL ? (
              <img src={photoURL} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <User className="w-12 h-12 text-slate-500" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white">{displayName || 'Usuario'}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>

          {isAdmin && (
            <span className="mt-3 inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" /> Administrador
            </span>
          )}
        </div>

        {/* Profile Edit Form */}
        <div className="md:col-span-2 bg-brand-card rounded-2xl p-6 border border-brand-border/60 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-brand-border/40 pb-3">Editar Información</h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre de usuario</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL Foto de Perfil</label>
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://..."
                className="w-full bg-brand-dark border border-brand-border text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full bg-brand-dark/50 border border-brand-border/40 text-slate-500 text-sm rounded-xl px-4 py-2.5 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-brand-red hover:bg-red-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-brand-red/20 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>

          {/* Security */}
          <div className="pt-4 border-t border-brand-border/40">
            <h4 className="text-sm font-bold text-white mb-2">Seguridad</h4>
            <button
              onClick={handlePasswordReset}
              className="text-xs font-semibold text-brand-red hover:underline flex items-center gap-2"
            >
              <Key className="w-4 h-4" /> Enviar enlace para cambiar contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
