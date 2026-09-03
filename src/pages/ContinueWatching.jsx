import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/normalize';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { Play, Trash2, Clock, Film } from 'lucide-react';

export const ContinueWatching = () => {
  const { userData, currentUser, removeFromContinueWatching } = useAuth();
  const [activePlayer, setActivePlayer] = useState(null);

  const continueWatchingData = userData?.continueWatching || {};
  const items = Object.entries(continueWatchingData).map(([id, data]) => ({
    id,
    ...data
  }));

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-brand-dark pt-28 pb-16 px-4 text-center max-w-xl mx-auto flex flex-col items-center justify-center">
        <div className="p-4 bg-brand-card rounded-full border border-brand-border mb-4 text-brand-red">
          <Clock className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Inicia sesión para ver tu progreso</h2>
        <p className="text-slate-400 text-sm mb-6">Retoma tus películas y series exactamente en el minuto donde las dejaste.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="mb-8 border-b border-brand-border/60 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
          <Clock className="w-8 h-8 text-brand-red" /> Continuar Viendo
        </h1>
        <p className="text-slate-400 text-sm mt-1">Reanuda la reproducción desde donde te quedaste</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-brand-card/40 rounded-2xl border border-brand-border/40">
          <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-lg font-medium text-slate-300">No tienes contenido en progreso</p>
          <p className="text-xs text-slate-500 mt-1">Empieza a reproducir una película o episodio para guardar tu avance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(({ id, item, currentTime, duration, progress, episodeNumber, seasonNumber }) => {
            const title = item?.title || item?.name || 'Contenido';
            const subtitle = seasonNumber && episodeNumber ? `T${seasonNumber}:E${episodeNumber}` : '';
            const percent = Math.round((progress || 0) * 100);

            return (
              <div
                key={id}
                className="group relative bg-brand-card rounded-2xl overflow-hidden border border-brand-border/60 hover:border-slate-500 transition-all shadow-lg flex flex-col"
              >
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <img
                    src={getImageUrl(item?.backdrop_path || item?.poster_path, 'w500')}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setActivePlayer({ item, initialTime: currentTime })}
                      className="p-3 bg-brand-red hover:bg-red-700 text-white rounded-full shadow-lg transform hover:scale-110 transition-transform"
                    >
                      <Play className="w-6 h-6 fill-current" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                    <div className="h-full bg-brand-red" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white truncate">{title}</h3>
                    {subtitle && <p className="text-xs text-brand-red font-medium mt-0.5">{subtitle}</p>}
                    <p className="text-[11px] text-slate-400 mt-1">{percent}% completado</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-brand-border/40 flex justify-between items-center">
                    <button
                      onClick={() => setActivePlayer({ item, initialTime: currentTime })}
                      className="text-xs font-semibold text-brand-red hover:underline flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Reanudar
                    </button>
                    <button
                      onClick={() => removeFromContinueWatching(id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
                      title="Eliminar de la lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activePlayer && (
        <VideoPlayerModal
          item={activePlayer.item}
          initialTime={activePlayer.initialTime}
          onClose={() => setActivePlayer(null)}
        />
      )}
    </div>
  );
};
