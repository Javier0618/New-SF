import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ContentCard } from '../components/ContentCard';
import { ContentCardSkeleton } from '../components/Skeletons';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { matchesSearch } from '../utils/normalize';
import { Search, Film, Filter } from 'lucide-react';

export const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [activePlayerItem, setActivePlayerItem] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'content'));
        const items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.media_type === 'movie') {
            items.push({ firestoreId: doc.id, ...data });
          }
        });
        setMovies(items);
        setFilteredMovies(items);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = movies;

    if (searchTerm) {
      result = result.filter(
        (m) => matchesSearch(m.title, searchTerm) || matchesSearch(m.original_title, searchTerm)
      );
    }

    if (selectedGenre) {
      result = result.filter((m) =>
        m.genres?.some((g) => (typeof g === 'object' ? g.name : g) === selectedGenre)
      );
    }

    setFilteredMovies(result);
  }, [searchTerm, selectedGenre, movies]);

  // Extract all genres
  const allGenres = Array.from(
    new Set(
      movies.flatMap((m) =>
        (m.genres || []).map((g) => (typeof g === 'object' ? g.name : g))
      )
    )
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-brand-border/60 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
            <Film className="w-8 h-8 text-brand-red" /> Películas
          </h1>
          <p className="text-slate-400 text-sm mt-1">Explora nuestro catálogo completo de películas</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Buscar películas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-card border border-brand-border text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-brand-red"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-2 bg-brand-card border border-brand-border px-3 py-2 rounded-xl text-sm text-slate-300">
            <Filter className="w-4 h-4 text-brand-red" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-brand-card">Todos los géneros</option>
              {allGenres.map((genre) => (
                <option key={genre} value={genre} className="bg-brand-card">
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-brand-card/40 rounded-2xl border border-brand-border/40">
          <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-lg font-medium text-slate-300">No se encontraron películas</p>
          <p className="text-xs text-slate-500 mt-1">Intenta cambiar los filtros o el término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredMovies.map((movie) => (
            <ContentCard key={movie.id} item={movie} onPlay={(item) => setActivePlayerItem(item)} />
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {activePlayerItem && (
        <VideoPlayerModal item={activePlayerItem} onClose={() => setActivePlayerItem(null)} />
      )}
    </div>
  );
};
