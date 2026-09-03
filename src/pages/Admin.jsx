import React, { useState, useEffect } from 'react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { searchTMDb, getTMDbDetails, getTMDbSeasonDetails } from '../services/tmdb';
import { getImageUrl, matchesSearch } from '../utils/normalize';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Download,
  Tv,
  Film,
  Sparkles,
  Search,
  Check,
  AlertCircle,
  Radio,
  Layers,
  BarChart3
} from 'lucide-react';

export const Admin = () => {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('content'); // 'content', 'import', 'channels', 'stats'

  // Firestore Content State
  const [contentList, setContentList] = useState([]);
  const [contentSearch, setContentSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // TMDb Import State
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbType, setTmdbType] = useState('movie'); // 'movie', 'tv', 'anime'
  const [tmdbResults, setTmdbResults] = useState([]);
  const [importingId, setImportingId] = useState(null);
  const [importStatus, setImportStatus] = useState({ type: '', text: '' });

  // Live Channels State
  const [channels, setChannels] = useState([]);
  const [channelForm, setChannelForm] = useState({ name: '', url: '', category: 'General' });
  const [editingChannel, setEditingChannel] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchContent();
      fetchChannels();
    }
  }, [isAdmin]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'content'));
      const items = [];
      snap.forEach((d) => items.push({ docId: d.id, ...d.data() }));
      setContentList(items);
    } catch (err) {
      console.error('Error fetching admin content:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const snap = await getDocs(collection(db, 'live_channels'));
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setChannels(items);
    } catch (err) {
      console.error('Error fetching live channels:', err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-brand-dark pt-28 px-4 text-center max-w-xl mx-auto">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl mb-4 inline-block">
          <Shield className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
        <p className="text-slate-400 text-sm">
          Esta sección está restringida únicamente al usuario administrador ({ADMIN_EMAIL}).
        </p>
      </div>
    );
  }

  // Delete Content
  const handleDeleteContent = async (docId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este contenido?')) return;
    try {
      await deleteDoc(doc(db, 'content', docId));
      setContentList((prev) => prev.filter((i) => i.docId !== docId));
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  // TMDb Search
  const handleTmdbSearch = async (e) => {
    e.preventDefault();
    if (!tmdbQuery.trim()) return;
    setLoading(true);
    try {
      const res = await searchTMDb(tmdbQuery, tmdbType === 'anime' ? 'tv' : tmdbType);
      setTmdbResults(res.results || []);
    } catch (err) {
      console.error(err);
      alert('Error buscando en TMDb: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Import item from TMDb with exact rules matching
  const handleImportFromTMDb = async (tmdbItem) => {
    setImportingId(tmdbItem.id);
    setImportStatus({ type: '', text: '' });
    try {
      const targetMediaType = tmdbType === 'anime' ? 'anime' : tmdbType === 'tv' ? 'tv' : 'movie';
      const details = await getTMDbDetails(tmdbItem.id, targetMediaType);

      // Fetch seasons details if series or anime
      let seasonsData = {};
      if ((targetMediaType === 'tv' || targetMediaType === 'anime') && details.number_of_seasons) {
        for (let s = 1; s <= Math.min(details.number_of_seasons, 3); s++) {
          try {
            const seasonRes = await getTMDbSeasonDetails(tmdbItem.id, s);
            if (seasonRes && seasonRes.episodes) {
              const episodesObj = {};
              seasonRes.episodes.forEach((ep) => {
                episodesObj[`ep_${ep.episode_number}`] = {
                  episode_number: ep.episode_number,
                  name: ep.name || `Episodio ${ep.episode_number}`,
                  overview: ep.overview || 'Sin descripción.',
                  still_path: ep.still_path || '',
                  video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                };
              });

              seasonsData[`season_${s}`] = {
                season_number: s,
                episodes: episodesObj
              };
            }
          } catch (e) {
            console.error(`Error fetching season ${s}:`, e);
          }
        }
      }

      const contentDoc = {
        id: Number(tmdbItem.id),
        media_type: targetMediaType,
        title: details.title || details.name || tmdbItem.title || tmdbItem.name || 'Sin título',
        original_title: details.original_title || details.original_name || '',
        overview: details.overview || 'Sin descripción disponible.',
        poster_path: details.poster_path || tmdbItem.poster_path || '',
        backdrop_path: details.backdrop_path || tmdbItem.backdrop_path || '',
        genres: (details.genres || []).map((g) => g.name || g),
        release_date: details.release_date || details.first_air_date || '',
        vote_average: Number(details.vote_average || 0),
        popularity: Number(details.popularity || 0),
        runtime: details.runtime || (details.episode_run_time ? details.episode_run_time[0] : 0) || 0,
        imported_by: currentUser.email,
        imported_at: serverTimestamp(),
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        display_options: {
          main_sections: ['destacados', 'populares'],
          home_sections: ['tendencias', 'estrenos'],
          platforms: ['streamfusion']
        }
      };

      if (Object.keys(seasonsData).length > 0) {
        contentDoc.seasons = seasonsData;
      }

      const docRef = doc(db, 'content', `${targetMediaType}_${tmdbItem.id}`);
      await setDoc(docRef, contentDoc);

      setImportStatus({ type: 'success', text: `"${contentDoc.title}" importado con éxito a Firestore.` });
      fetchContent();
    } catch (err) {
      console.error(err);
      setImportStatus({ type: 'error', text: 'Error al importar: ' + err.message });
    } finally {
      setImportingId(null);
    }
  };

  // Live Channel Handlers
  const handleSaveChannel = async (e) => {
    e.preventDefault();
    if (!channelForm.name || !channelForm.url) return;
    try {
      if (editingChannel) {
        await updateDoc(doc(db, 'live_channels', editingChannel.id), channelForm);
      } else {
        await addDoc(collection(db, 'live_channels'), channelForm);
      }
      setChannelForm({ name: '', url: '', category: 'General' });
      setEditingChannel(null);
      fetchChannels();
    } catch (err) {
      alert('Error guardando canal: ' + err.message);
    }
  };

  const handleDeleteChannel = async (id) => {
    if (!window.confirm('¿Eliminar este canal?')) return;
    try {
      await deleteDoc(doc(db, 'live_channels', id));
      setChannels((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert('Error eliminando canal: ' + err.message);
    }
  };

  const filteredContent = contentList.filter(
    (c) => matchesSearch(c.title || c.name, contentSearch) || matchesSearch(c.media_type, contentSearch)
  );

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-brand-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-brand-red" /> Panel de Administración
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gestión completa de contenidos, TMDb import, canales y estadísticas</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-brand-card p-1.5 rounded-xl border border-brand-border">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'content' ? 'bg-brand-red text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Contenidos ({contentList.length})
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'import' ? 'bg-brand-red text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" /> Importar TMDb
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'channels' ? 'bg-brand-red text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" /> TV en Vivo ({channels.length})
          </button>
        </div>
      </div>

      {/* TAB 1: CONTENT MANAGEMENT */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-card p-4 rounded-2xl border border-brand-border/60">
            <div className="relative flex-1 sm:w-80">
              <input
                type="text"
                placeholder="Buscar en Firestore..."
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-brand-red"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-xs text-slate-400">Mostrando {filteredContent.length} elementos</p>
          </div>

          <div className="bg-brand-card rounded-2xl border border-brand-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-brand-dark/80 text-xs text-slate-400 uppercase border-b border-brand-border/60">
                  <tr>
                    <th className="px-4 py-3">Póster</th>
                    <th className="px-4 py-3">Título</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Calificación</th>
                    <th className="px-4 py-3">Importado por</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {filteredContent.map((item) => (
                    <tr key={item.docId} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <img
                          src={getImageUrl(item.poster_path, 'w92')}
                          alt={item.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-white max-w-xs truncate">
                        {item.title || item.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-xs px-2 py-0.5 rounded bg-white/10 border border-white/10">
                          {item.media_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-amber-400 font-bold">{item.vote_average || 'N/A'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{item.imported_by || 'Sistema'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteContent(item.docId)}
                          className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TMDB IMPORTER */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <form onSubmit={handleTmdbSearch} className="bg-brand-card p-6 rounded-2xl border border-brand-border/60 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-brand-red" /> Importar desde The Movie Database (TMDb)
            </h3>

            {importStatus.text && (
              <div
                className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {importStatus.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{importStatus.text}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 bg-brand-dark border border-brand-border px-3 rounded-xl">
                <select
                  value={tmdbType}
                  onChange={(e) => setTmdbType(e.target.value)}
                  className="bg-transparent text-white text-sm py-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="movie" className="bg-brand-card">Película</option>
                  <option value="tv" className="bg-brand-card">Serie</option>
                  <option value="anime" className="bg-brand-card">Anime</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Nombre de la película, serie o anime..."
                value={tmdbQuery}
                onChange={(e) => setTmdbQuery(e.target.value)}
                className="flex-1 bg-brand-dark border border-brand-border text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-red"
              />

              <button
                type="submit"
                className="bg-brand-red hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-brand-red/20"
              >
                Buscar en TMDb
              </button>
            </div>
          </form>

          {/* TMDb Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tmdbResults.map((item) => (
              <div key={item.id} className="bg-brand-card rounded-2xl p-4 border border-brand-border/60 flex gap-4">
                <img
                  src={getImageUrl(item.poster_path, 'w185')}
                  alt={item.title || item.name}
                  className="w-20 h-28 object-cover rounded-xl bg-slate-800"
                />
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h4 className="font-bold text-sm text-white truncate">{item.title || item.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.release_date || item.first_air_date || 'Año N/A'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleImportFromTMDb(item)}
                    disabled={importingId === item.id}
                    className="mt-2 bg-white/10 hover:bg-brand-red hover:text-white text-slate-200 text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {importingId === item.id ? 'Importando...' : 'Importar a Firebase'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE TV CHANNELS */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveChannel} className="bg-brand-card p-6 rounded-2xl border border-brand-border/60 space-y-4 max-w-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500" />
              {editingChannel ? 'Editar Canal' : 'Agregar Nuevo Canal en Vivo'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Canal</label>
              <input
                type="text"
                required
                placeholder="Ej. Deporte TV HD"
                value={channelForm.name}
                onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                className="w-full bg-brand-dark border border-brand-border text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">URL de Transmisión (.m3u8 o mp4)</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={channelForm.url}
                onChange={(e) => setChannelForm({ ...channelForm, url: e.target.value })}
                className="w-full bg-brand-dark border border-brand-border text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-red"
              />
            </div>

            <button
              type="submit"
              className="bg-brand-red hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md"
            >
              {editingChannel ? 'Guardar Cambios' : 'Crear Canal'}
            </button>
          </form>

          {/* Channel List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {channels.map((ch) => (
              <div key={ch.id} className="bg-brand-card rounded-2xl p-4 border border-brand-border/60 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{ch.name}</h4>
                  <p className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">{ch.url}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingChannel(ch);
                      setChannelForm({ name: ch.name, url: ch.url, category: ch.category || 'General' });
                    }}
                    className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteChannel(ch.id)}
                    className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
