import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { HeroSlider } from '../components/HeroSlider';
import { ContentRow } from '../components/ContentRow';
import { HeroSkeleton } from '../components/Skeletons';
import { VideoPlayerModal } from '../components/VideoPlayerModal';

export const Home = () => {
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlayerItem, setActivePlayerItem] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'content'));
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ firestoreId: doc.id, ...doc.data() });
        });
        setContentList(items);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Filtered rows
  const heroItems = contentList.slice(0, 5);
  const trendingItems = contentList.filter((i) => i.popularity > 50 || i.vote_average >= 7);
  const movies = contentList.filter((i) => i.media_type === 'movie');
  const series = contentList.filter((i) => i.media_type === 'tv' || i.media_type === 'serie');
  const animes = contentList.filter((i) => i.media_type === 'anime');
  const topRated = [...contentList].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

  return (
    <div className="min-h-screen bg-brand-dark pb-16">
      {/* Hero Section */}
      {loading ? (
        <HeroSkeleton />
      ) : contentList.length > 0 ? (
        <HeroSlider items={heroItems} onPlay={(item) => setActivePlayerItem(item)} />
      ) : (
        <div className="relative h-[60vh] flex items-center justify-center bg-gradient-to-b from-slate-900 to-brand-dark text-center px-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Bienvenido a <span className="text-brand-red">StreamFusion</span>
            </h1>
            <p className="text-slate-300 text-lg mb-6">
              Plataforma de streaming completa para películas, series y animes. Conéctate con el panel de administración para importar contenido directamente desde TMDb.
            </p>
          </div>
        </div>
      )}

      {/* Main Rows */}
      <div className="-mt-10 sm:-mt-20 relative z-20 space-y-4">
        {contentList.length > 0 ? (
          <>
            <ContentRow title="Tendencias Destacadas" items={trendingItems} loading={loading} onPlay={(item) => setActivePlayerItem(item)} />
            <ContentRow title="Mejor Valoradas" items={topRated} loading={loading} onPlay={(item) => setActivePlayerItem(item)} />
            <ContentRow title="Películas Populares" items={movies} loading={loading} onPlay={(item) => setActivePlayerItem(item)} />
            <ContentRow title="Series Populares" items={series} loading={loading} onPlay={(item) => setActivePlayerItem(item)} />
            <ContentRow title="Animes Populares" items={animes} loading={loading} onPlay={(item) => setActivePlayerItem(item)} />
          </>
        ) : !loading && (
          <div className="px-4 sm:px-12 py-12 text-center text-slate-400">
            <p>No hay contenido disponible en la base de datos de Firebase aún.</p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {activePlayerItem && (
        <VideoPlayerModal
          item={activePlayerItem}
          onClose={() => setActivePlayerItem(null)}
        />
      )}
    </div>
  );
};
