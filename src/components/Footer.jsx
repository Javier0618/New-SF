import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, Shield, Film, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#070709] border-t border-brand-border/60 text-slate-400 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center text-white">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <span className="font-extrabold text-xl text-white">
              Stream<span className="text-brand-red">Fusion</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            Plataforma cinematográfica para películas, series, animes y canales de TV en vivo. Disfruta de la mejor experiencia de entretenimiento en cualquier dispositivo.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 border-l-2 border-brand-red pl-2">Navegación</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li><Link to="/movies" className="hover:text-white transition-colors">Películas</Link></li>
            <li><Link to="/series" className="hover:text-white transition-colors">Series</Link></li>
            <li><Link to="/animes" className="hover:text-white transition-colors">Animes</Link></li>
            <li><Link to="/live-tv" className="hover:text-white transition-colors">TV en Vivo</Link></li>
          </ul>
        </div>

        {/* User Space */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 border-l-2 border-brand-red pl-2">Mi Espacio</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/profile" className="hover:text-white transition-colors">Mi Perfil</Link></li>
            <li><Link to="/favorites" className="hover:text-white transition-colors">Mis Favoritos</Link></li>
            <li><Link to="/continue-watching" className="hover:text-white transition-colors">Continuar Viendo</Link></li>
            <li><Link to="/admin" className="hover:text-white transition-colors">Panel de Administración</Link></li>
          </ul>
        </div>

        {/* Legal / Info */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 border-l-2 border-brand-red pl-2">Información</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            Esta plataforma es un proyecto demostrativo impulsado por Firebase y TMDb. No almacena directamente archivos con derechos de autor en sus servidores.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 border-t border-brand-border/40 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} StreamFusion. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <span className="hover:text-slate-300 cursor-pointer">Términos de servicio</span>
          <span className="hover:text-slate-300 cursor-pointer">Privacidad</span>
        </div>
      </div>
    </footer>
  );
};
