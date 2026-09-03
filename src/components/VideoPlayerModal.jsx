import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VideoPlayerModal = ({ item, initialTime = 0, episode = null, onClose }) => {
  const { updateContinueWatching, addToHistory } = useAuth();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Determine stream URL or HTML5 fallback demo video
  const videoUrl = episode?.video_url || item?.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const title = episode ? `${item.title || item.name} - E${episode.episode_number}: ${episode.name}` : (item.title || item.name);

  useEffect(() => {
    if (item) {
      addToHistory(item);
    }
  }, [item?.id]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(cur);
      setDuration(dur);
      if (dur > 0) {
        const progRatio = cur / dur;
        setProgress(progRatio);

        // Save progress periodically
        if (Math.floor(cur) % 5 === 0) {
          updateContinueWatching(item.id, {
            item,
            currentTime: cur,
            duration: dur,
            progress: progRatio,
            episodeNumber: episode?.episode_number || null,
            seasonNumber: episode?.season_number || null
          });
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-6 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-brand-border/60 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-b from-black/90 to-transparent absolute top-0 left-0 right-0 z-20">
          <h3 className="text-white font-bold text-sm sm:text-base truncate pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Cerrar reproductor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {videoUrl.includes('youtube.com') || videoUrl.includes('embed') ? (
            <iframe
              src={videoUrl}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={title}
            ></iframe>
          ) : (
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-contain"
              onClick={togglePlay}
            />
          )}
        </div>

        {/* Player Controls Bar */}
        {!videoUrl.includes('youtube.com') && !videoUrl.includes('embed') && (
          <div className="p-4 bg-brand-card border-t border-brand-border/40 space-y-2">
            {/* Seek bar */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-red"
            />

            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="p-1.5 hover:text-white text-slate-200">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <button onClick={toggleMute} className="p-1.5 hover:text-white text-slate-200">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button onClick={toggleFullScreen} className="p-1.5 hover:text-white text-slate-200">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
