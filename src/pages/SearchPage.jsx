import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { matchesSearch } from '../utils/normalize';
import { ContentCard } from '../components/ContentCard';
import { ContentCardSkeleton } from '../components/Skeletons';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { Search, Film, Tv, Sparkles } from 'lucide-react';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlayerItem, setActivePlayerItem] = useState(null);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'content'));
        const matched = [];
        querySnapshot.forEach((doc) => {
          const data = { firestoreId: doc.id, ...doc.data() };
          const title = data.title || data.name || '';
          const origTitle = data.original_title || data.original_name || '';
          const genresStr = (data.genres || []).map((g) => (typeof g === 'object' ? g.name : g)).join(' ');

          if (
            matchesSearch(title, query) ||
            matchesSearch(origTitle, query) ||
            matchesSearch(genresStr, query)
          ) {
            matched.push(data);
          }
        });
        setResults(matched);
      } catch (err) {
        console.error('Error during search:', err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      performSearch();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  const movies = results.filter((r) => r.media_type === 'movie');
  const series = results.filter((r) => r.media_type === 'tv' || r.media_type === 'serie');
  const animes = results.filter((r) => r.media_type === 'anime');

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="mb-8 border-b border-brand-border/60 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <Search className="w-7 h-7 text-brand-red" />
          Resultados de búsqueda para: <span className="text-brand-red font-extrabold">"{query}"</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Se encontraron {results.length} coincidencias</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-brand-card/40 rounded-2xl border border-brand-border/40">
          <Search className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-lg font-medium text-slate-300">No se encontraron resultados</p>
          <p className="text-xs text-slate-500 mt-1">Prueba buscando con otras palabras clave o géneros.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {movies.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-brand-red" /> Películas ({movies.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {movies.map((item) => (
                  <ContentCard key={item.id} item={item} onPlay={(i) => setActivePlayerItem(i)} />
                ))}
              </div>
            </div>
          )}

          {series.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Tv className="w-5 h-5 text-blue-500" /> Series ({series.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {series.map((item) => (
                  <ContentCard key={item.id} item={item} onPlay={(i) => setActivePlayerItem(i)} />
                ))}
              </div>
            </div>
          )}

          {animes.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> Animes ({animes.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {animes.map((item) => (
                  <ContentCard key={item.id} item={item} onPlay={(i) => setActivePlayerItem(i)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activePlayerItem && (
        <VideoPlayerModal item={activePlayerItem} onClose={() => setActivePlayerItem(null)} />
      )}
    </div>
  );
};
