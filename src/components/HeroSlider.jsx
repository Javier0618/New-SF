import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Info, Star, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { getImageUrl, getYear, formatRuntime } from '../utils/normalize';

export const HeroSlider = ({ items = [], onPlay }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];
  const title = current.title || current.name || 'Contenido Destacado';
  const year = getYear(current.release_date || current.first_air_date || current.year);
  const rating = current.vote_average ? Number(current.vote_average).toFixed(1) : 'N/A';
  const mediaType = current.media_type || (current.seasons ? 'tv' : 'movie');

  return (
    <div className="relative w-full h-[75vh] min-h-[500px] max-h-[800px] overflow-hidden bg-brand-dark">
      {/* Background Image with Gradients */}
      <div className="absolute inset-0">
        <img
          src={getImageUrl(current.backdrop_path || current.poster_path, 'original')}
          alt={title}
          className="w-full h-full object-cover object-center transition-all duration-1000 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Content Layer */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col justify-end pb-12 sm:pb-16 z-10">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="bg-brand-red text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
              {mediaType === 'anime' ? 'Anime' : mediaType === 'tv' || mediaType === 'serie' ? 'Serie' : 'Película'}
            </span>
            <span className="text-amber-400 font-bold text-sm flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-amber-400/20">
              <Star className="w-4 h-4 fill-current" /> {rating}
            </span>
            {year && <span className="text-slate-300 text-sm font-medium">{year}</span>}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md leading-tight">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 sm:line-clamp-4 leading-relaxed font-normal drop-shadow">
            {current.overview || 'Sin descripción disponible para este contenido.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3">
            <button
              onClick={() => onPlay && onPlay(current)}
              className="bg-brand-red hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-brand-red/30"
            >
              <Play className="w-5 h-5 fill-current" /> Ver Contenido
            </button>
            <button
              onClick={() => navigate(`/details/${mediaType}/${current.id}`)}
              className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all border border-white/20"
            >
              <Info className="w-5 h-5" /> Más Información
            </button>
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      {items.length > 1 && (
        <div className="absolute right-4 sm:right-8 bottom-8 flex items-center gap-2 z-20">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5 px-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-brand-red' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
