import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Tv, Play, Radio, Signal } from 'lucide-react';
import { VideoPlayerModal } from '../components/VideoPlayerModal';

export const LiveTv = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'live_channels'));
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setChannels(items);
      } catch (error) {
        console.error('Error fetching live channels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="mb-8 border-b border-brand-border/60 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
          <Radio className="w-8 h-8 text-rose-500 animate-pulse" /> Canales de TV en Vivo
        </h1>
        <p className="text-slate-400 text-sm mt-1">Transmisión de canales de televisión en directo sin costo adicional</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-brand-card rounded-2xl animate-pulse border border-brand-border" />
          ))}
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-brand-card/40 rounded-2xl border border-brand-border/40">
          <Tv className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-lg font-medium text-slate-300">No hay canales en vivo disponibles en este momento</p>
          <p className="text-xs text-slate-500 mt-1">Los administradores pueden agregar canales desde el panel de control.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className="group relative bg-brand-card rounded-2xl p-5 border border-brand-border/60 hover:border-rose-500/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                  <Tv className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                  <Signal className="w-3 h-3 animate-pulse" /> En Vivo
                </span>
              </div>

              <h3 className="font-bold text-lg text-white group-hover:text-rose-400 transition-colors truncate">
                {channel.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {channel.category || 'Entretenimiento'}
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-rose-500 group-hover:translate-x-1 transition-transform">
                <Play className="w-4 h-4 fill-current" /> Ver Transmisión
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Modal */}
      {activeChannel && (
        <VideoPlayerModal
          item={{ title: activeChannel.name, video_url: activeChannel.url }}
          onClose={() => setActiveChannel(null)}
        />
      )}
    </div>
  );
};
