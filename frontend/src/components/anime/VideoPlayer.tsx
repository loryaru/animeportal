import React, { useRef, useEffect, useState } from 'react';

interface VideoSource {
  id: number;
  quality: string;
  type: 'sub' | 'dub';
  language: string;
  source_url: string;
  source_type: 'video' | 'iframe' | 'm3u8';
}

interface VideoPlayerProps {
  sources: VideoSource[];
  thumbnail?: string | null;
  onTimeUpdate?: (currentTime: number) => void;
  initialProgress?: number | null;
  onQualityChange?: (quality: string) => void;
  onLanguageChange?: (language: string) => void;
  selectedQuality: string;
  selectedLanguage: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  sources,
  thumbnail,
  onTimeUpdate,
  initialProgress,
  onQualityChange,
  onLanguageChange,
  selectedQuality,
  selectedLanguage
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Получаем текущий источник видео
  const currentSource = sources.find(
    source => source.quality === selectedQuality && source.language === selectedLanguage
  ) || sources[0];
  
  // Инициализация видеоплеера
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Обработчики событий
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(Math.floor(video.currentTime));
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      
      // Если есть сохраненный прогресс просмотра, перемотаем видео
      if (initialProgress && initialProgress > 0) {
        video.currentTime = initialProgress;
      }
    };
    const handleVolumeChange = () => setVolume(video.volume);
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };
    
    // Добавление обработчиков
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('volumechange', handleVolumeChange);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    
    // Очистка обработчиков
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('volumechange', handleVolumeChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [initialProgress, onTimeUpdate]);
  
  // Форматирование времени (секунды -> MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Обработчики для управления плеером
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setVolume(videoRef.current.muted ? 0 : videoRef.current.volume);
  };
  
  const toggleFullScreen = () => {
    if (!videoRef.current) return;
    
    if (!isFullScreen) {
      videoRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Если источник недоступен или с iframe
  if (!currentSource) {
    return (
      <div className="flex justify-center items-center h-64 bg-black text-white">
        No video source available
      </div>
    );
  }
  
  if (currentSource.source_type === 'iframe') {
    return (
      <div className="relative w-full pb-[56.25%]">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={currentSource.source_url}
          allowFullScreen
          title="Video Player"
        ></iframe>
      </div>
    );
  }
  
  // Обычный видеоплеер
  return (
    <div 
      className="relative w-full bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-auto"
        src={currentSource.source_url}
        poster={thumbnail || undefined}
        preload="metadata"
        onClick={handlePlayPause}
      ></video>
      
      {/* Контролы плеера */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Прогресс-бар */}
        <div className="mb-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-500 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / (duration || 1)) * 100}%, #4b5563 ${(currentTime / (duration || 1)) * 100}%, #4b5563 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Кнопки управления */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Плей/пауза */}
            <button
              onClick={handlePlayPause}
              className="text-white focus:outline-none"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            
            {/* Громкость */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white focus:outline-none"
              >
                {volume === 0 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-500 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Селектор качества */}
            <select
              value={selectedQuality}
              onChange={(e) => onQualityChange && onQualityChange(e.target.value)}
              className="bg-transparent text-white text-sm border border-gray-500 rounded px-2 py-1"
            >
              {Array.from(new Set(sources.map(source => source.quality))).map(quality => (
                <option key={quality} value={quality} className="bg-gray-800">
                  {quality}
                </option>
              ))}
            </select>
            
            {/* Селектор языка */}
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
              className="bg-transparent text-white text-sm border border-gray-500 rounded px-2 py-1"
            >
              {Array.from(new Set(sources.map(source => source.language))).map(language => (
                <option key={language} value={language} className="bg-gray-800">
                  {language === 'jp' ? 'Japanese' : 
                  language === 'en' ? 'English' : 
                  language === 'ru' ? 'Russian' : 
                  language.toUpperCase()}
                </option>
              ))}
            </select>
            
            {/* Полноэкранный режим */}
            <button
              onClick={toggleFullScreen}
              className="text-white focus:outline-none"
            >
              {isFullScreen ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;