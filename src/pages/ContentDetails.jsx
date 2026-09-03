import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, getYear, formatRuntime } from '../utils/normalize';
import { ContentRow } from '../components/ContentRow';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import {
  Play,
  Heart,
  Star,
  Clock,
  Calendar,
  Film,
  Tv,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Info
} from 'lucide-react';

export const ContentDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, currentUser } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [activePlayerEpisode, setActivePlayerEpisode] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [similarContent, setSimilarContent] = useState([]);

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'content'));
        let found = null;
        const allItems = [];

        querySnapshot.forEach((d) => {
          const data = { firestoreId: d.id, ...d.data() };
          allItems.push(data);
          if (data.id?.toString() === id?.toString() || d.id === id) {
            found = data;
          }
        });

        if (found) {
          setItem(found);
          const similar = allItems.filter(
            (i) => i.id !== found.id && (i.media_type === found.media_type || i.genres?.some((g) => found.genres?.includes(g)))
          ).slice(0, 10);
          setSimilarContent(similar);
        } else {
          setItem(null);
        }
      } catch (err) {
        console.error('Error loading item details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id, type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark pt-28 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-brand-dark pt-28 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Contenido no encontrado</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-brand-red text-white px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver atrás
        </button>
      </div>
    );
  }

  const title = item.title || item.name || 'Sin título';
  const originalTitle = item.original_title || item.original_name;
  const year = getYear(item.release_date || item.first_air_date || item.year);
  const rating = item.vote_average ? Number(item.vote_average).toFixed(1) : 'N/A';
  const mediaType = item.media_type || (item.seasons ? 'tv' : 'movie');
  const favorite = isFavorite(item.id);

  // Seasons management
  const seasonsMap = item.seasons || {};
  const seasonKeys = Object.keys(seasonsMap).sort((a, b) => Number(a) - Number(b));
  const currentSeasonData = seasonsMap[selectedSeason] || seasonsMap[seasonKeys[0]];
  const episodesMap = currentSeasonData?.episodes || {};
  const episodesList = Object.values(episodesMap).sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));

  const handleFavoriteClick = async () => {
    if (!currentUser) {
      alert('Debes iniciar sesión para añadir a favoritos');
      return;
    }
    await toggleFavorite(item);
  };

  return (
    <div className="min-h-screen bg-brand-dark pb-20">
      {/* Hero Backdrop */}
      <div className="relative w-full h-[60vh] min-h-[420px] max-h-[650px] overflow-hidden">
        <img
          src={getImageUrl(item.backdrop_path || item.poster_path, 'original')}
          alt={title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent w-full md:w-2/3" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-4 sm:left-8 z-30 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      {/* Main Info Section */}
      <div className="-mt-32 sm:-mt-48 relative z-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster Card */}
          <div className="flex-none w-48 sm:w-64 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border border-brand-border bg-brand-card">
            <img src={getImageUrl(item.poster_path, 'w500')} alt={title} className="w-full h-auto object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-brand-red text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                {mediaType === 'anime' ? 'Anime' : mediaType === 'tv' || mediaType === 'serie' ? 'Serie' : 'Película'}
              </span>
              <span className="text-amber-400 font-bold text-sm flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded border border-amber-400/20">
                <Star className="w-4 h-4 fill-current" /> {rating}
              </span>
              {year && (
                <span className="text-slate-300 text-xs font-semibold flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/10">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {year}
                </span>
              )}
              {item.runtime && (
                <span className="text-slate-300 text-xs font-semibold flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {formatRuntime(item.runtime)}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">{title}</h1>
            {originalTitle && originalTitle !== title && (
              <p className="text-sm text-slate-400 italic">Título original: {originalTitle}</p>
            )}

            {/* Genres */}
            {item.genres && item.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {item.genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10"
                  >
                    {typeof genre === 'object' ? genre.name : genre}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl pt-2">
              {item.overview || 'Sin descripción disponible.'}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => {
                  setActivePlayerEpisode(null);
                  setShowPlayer(true);
                }}
                className="bg-brand-red hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2.5 transition-all shadow-lg shadow-brand-red/30 transform hover:scale-105"
              >
                <Play className="w-5 h-5 fill-current" /> Reproducir
              </button>

              <button
                onClick={handleFavoriteClick}
                className={`p-3.5 rounded-xl font-semibold flex items-center gap-2 border transition-all ${
                  favorite
                    ? 'bg-brand-red/20 border-brand-red text-brand-red'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
                <span className="text-sm">{favorite ? 'En Favoritos' : 'Añadir a Favoritos'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Season & Episode Selector for Series / Anime */}
        {(mediaType === 'tv' || mediaType === 'serie' || mediaType === 'anime' || seasonKeys.length > 0) && (
          <div className="mt-16 bg-brand-card rounded-2xl p-6 border border-brand-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-brand-border/60">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-brand-red" /> Temporadas y Episodios
              </h3>

              {seasonKeys.length > 0 && (
                <div className="relative inline-block w-48">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="w-full bg-brand-dark border border-brand-border text-white text-sm rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:border-brand-red cursor-pointer"
                  >
                    {seasonKeys.map((key) => (
                      <option key={key} value={key}>
                        Temporada {key}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Episodes List */}
            {episodesList.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">No hay episodios registrados para esta temporada.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {episodesList.map((ep) => (
                  <div
                    key={ep.episode_number}
                    onClick={() => {
                      setActivePlayerEpisode(ep);
                      setShowPlayer(true);
                    }}
                    className="group bg-brand-dark/60 hover:bg-brand-dark rounded-xl p-3 border border-brand-border/40 hover:border-slate-500 transition-all cursor-pointer flex gap-4 items-center"
                  >
                    <div className="relative w-28 sm:w-36 aspect-video bg-slate-900 rounded-lg overflow-hidden flex-none">
                      <img
                        src={getImageUrl(ep.still_path || item.backdrop_path, 'w500')}
                        alt={ep.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-brand-red mb-0.5">
                        Episodio {ep.episode_number}
                      </p>
                      <h4 className="font-semibold text-sm text-white truncate">{ep.name || `Episodio ${ep.episode_number}`}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{ep.overview || 'Sin descripción del episodio.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Similar Content */}
        {similarContent.length > 0 && (
          <div className="mt-12">
            <ContentRow title="Contenido Similar" items={similarContent} />
          </div>
        )}
      </div>

      {/* Player Modal */}
      {showPlayer && (
        <VideoPlayerModal
          item={item}
          episode={activePlayerEpisode}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </div>
  );
};
