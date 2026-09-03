import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  Search,
  Heart,
  User,
  LogOut,
  Shield,
  Clock,
  Tv,
  Menu,
  X,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { currentUser, userData, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Películas', path: '/movies' },
    { name: 'Series', path: '/series' },
    { name: 'Animes', path: '/animes' },
    { name: 'TV en Vivo', path: '/live-tv' },
    { name: 'Continuar Viendo', path: '/continue-watching' },
    { name: 'Favoritos', path: '/favorites' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-brand-dark/95 backdrop-blur-md border-b border-brand-border/40 shadow-xl' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-red to-rose-500 flex items-center justify-center text-white shadow-lg shadow-brand-red/30 group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                Stream<span className="text-brand-red">Fusion</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-brand-red font-semibold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Toggle / Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Buscar película, serie, anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`transition-all duration-300 bg-black/50 border border-white/20 text-white text-xs sm:text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-brand-red ${
                  searchOpen ? 'w-48 sm:w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none sm:w-48 sm:opacity-100 sm:pointer-events-auto'
                }`}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="absolute left-2.5 text-slate-400 hover:text-white sm:pointer-events-none"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* User Profile / Admin / Login */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="p-2 text-slate-300 hover:text-brand-red transition-colors bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
                    title="Panel Admin"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                >
                  <User className="w-4 h-4 text-brand-red" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {userData?.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-brand-red hover:bg-red-700 text-white transition-all shadow-md shadow-brand-red/20"
                >
                  Iniciar Sesión
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-brand-dark/98 border-b border-brand-border px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 text-base font-medium transition-colors ${
                location.pathname === link.path ? 'text-brand-red font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
