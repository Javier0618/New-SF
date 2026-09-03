import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Heart, Film, Info } from 'lucide-react';
import { getImageUrl, getYear } from '../utils/normalize';
import { useAuth } from '../context/AuthContext';

export const ContentCard = ({ item, onPlay }) => {
  const { isFavorite, toggleFavorite, currentUser } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!item) return null;

  const title = item.title || item.name || 'Sin título';
  const year = getYear(item.release_date || item.first_air_date || item.year);
  const rating = item.vote_average ? Number(item.vote_average).toFixed(1) : 'N/A';
  const mediaType = item.media_type || (item.seasons ? 'tv' : 'movie');
  const favorite = isFavorite(item.id);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert('Debes iniciar sesión para añadir a favoritos');
      return;
    }
    try {
      await toggleFavorite(item);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPlay) {
      onPlay(item);
    }
  };

  const badgeColor = mediaType === 'anime'
    ? 'bg-purple-600/80 text-purple-200 border-purple-500/30'
    : mediaType === 'tv' || mediaType === 'serie'
    ? 'bg-blue-600/80 text-blue-200 border-blue-500/30'
    : 'bg-rose-600/80 text-rose-200 border-rose-500/30';

  const mediaLabel = mediaType === 'anime' ? 'Anime' : mediaType === 'tv' || mediaType === 'serie' ? 'Serie' : 'Película';

  return (
    <div className="group relative flex-none w-36 sm:w-48 md:w-56 rounded-xl bg-brand-card overflow-hidden border border-brand-border/60 hover:border-slate-500 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-red/10 hover:-translate-y-1">
      <Link to={`/details/${mediaType}/${item.id}`} className="block relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
            <Film className="w-8 h-8 text-slate-600" />
          </div>
        )}
        <img
          src={getImageUrl(item.poster_path, 'w500')}
          alt={title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageError(true);
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop';
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Media Badge */}
        <span className={`absolute top-2 left-2 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md backdrop-blur-md border ${badgeColor}`}>
          {mediaLabel}
        </span>

        {/* Top Right Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all duration-200 ${
            favorite ? 'bg-brand-red text-white scale-110' : 'bg-black/50 text-white/80 hover:bg-black/80 hover:text-white'
          }`}
          title={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${favorite ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Overlay Desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 text-white">
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{rating}</span>
            <span className="text-slate-400 font-normal ml-auto text-[11px]">{year}</span>
          </div>

          <h4 className="font-bold text-xs sm:text-sm line-clamp-2 leading-tight mb-2">{title}</h4>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handlePlayClick}
              className="flex-1 bg-brand-red hover:bg-red-700 text-white text-xs py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Ver
            </button>
            <div className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
              <Info className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </Link>

      {/* Footer Title Always Visible */}
      <div className="p-2.5 sm:p-3 bg-brand-card">
        <h3 className="font-semibold text-xs sm:text-sm text-slate-200 truncate group-hover:text-white transition-colors">
          {title}
        </h3>
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
          <span>{year}</span>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3 h-3 fill-current" />
            <span>{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
