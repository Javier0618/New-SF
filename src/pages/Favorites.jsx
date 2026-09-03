import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ContentCard } from '../components/ContentCard';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { Heart, Film } from 'lucide-react';

export const Favorites = () => {
  const { userData, currentUser } = useAuth();
  const [activePlayerItem, setActivePlayerItem] = useState(null);

  const favorites = userData?.favorites || [];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-brand-dark pt-28 pb-16 px-4 text-center max-w-xl mx-auto flex flex-col items-center justify-center">
        <div className="p-4 bg-brand-card rounded-full border border-brand-border mb-4 text-brand-red">
          <Heart className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Inicia sesión para ver tus favoritos</h2>
        <p className="text-slate-400 text-sm mb-6">Guarda tus películas, series y animes preferidos para acceder a ellos rápidamente en cualquier momento.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="mb-8 border-b border-brand-border/60 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
          <Heart className="w-8 h-8 text-brand-red fill-current" /> Mis Favoritos
        </h1>
        <p className="text-slate-400 text-sm mt-1">Colección de títulos guardados por ti</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-brand-card/40 rounded-2xl border border-brand-border/40">
          <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-lg font-medium text-slate-300">No tienes contenidos en tu lista de favoritos</p>
          <p className="text-xs text-slate-500 mt-1">Haz clic en el icono del corazón en cualquier película, serie o anime para agregarla aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {favorites.map((item) => (
            <ContentCard key={item.id} item={item} onPlay={(i) => setActivePlayerItem(i)} />
          ))}
        </div>
      )}

      {activePlayerItem && (
        <VideoPlayerModal item={activePlayerItem} onClose={() => setActivePlayerItem(null)} />
      )}
    </div>
  );
};
