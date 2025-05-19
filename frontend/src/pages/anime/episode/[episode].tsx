import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Episode {
  id: number;
  anime_id: number;
  number: number;
  title: string | null;
  description: string | null;
  duration: number | null;
  thumbnail: string | null;
  release_date: string | null;
}

interface Anime {
  id: number;
  title: string;
  slug: string;
}

interface VideoSource {
  id: number;
  episode_id: number;
  quality: string;
  type: 'sub' | 'dub';
  language: string;
  source_url: string;
  source_type: 'video' | 'iframe' | 'm3u8';
}

interface Comment {
  id: number;
  user_id: number;
  episode_id: number;
  text: string;
  created_at: string;
  username: string;
  avatar: string | null;
}

interface Navigation {
  previous: {
    id: number;
    number: number;
    title: string | null;
  } | null;
  next: {
    id: number;
    number: number;
    title: string | null;
  } | null;
}

interface EpisodeData {
  anime: Anime;
  episode: Episode;
  video_sources: VideoSource[];
  comments: Comment[];
  navigation: Navigation;
  user_data: {
    watch_progress: number | null;
  };
}

const EpisodePage: NextPage = () => {
  const router = useRouter();
  const { id, episode } = router.query;
  
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [comment, setComment] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const fetchEpisodeData = async () => {
      if (!id || !episode) return;
      
      try {
        setLoading(true);
        // В реальном приложении замените URL на фактический API бэкенда
        const res = await fetch(`/api/anime/${id}/episode/${episode}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch episode data');
        }
        
        const data = await res.json();
        setEpisodeData(data);
        
        // Устанавливаем начальные значения для качества и языка
        if (data.video_sources.length > 0) {
          setSelectedQuality(data.video_sources[0].quality);
          setSelectedLanguage(data.video_sources[0].language);
        }
      } catch (err) {
        console.error('Error fetching episode data:', err);
        setError('Failed to load episode data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodeData();
  }, [id, episode]);
  
  // Функция для отправки комментария
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || !episodeData) return;
    
    try {
      // В реальном приложении замените URL на фактический API бэкенда
      const res = await fetch('/api/anime/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // В реальном приложении добавьте заголовок авторизации
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          episodeId: episodeData.episode.id,
          text: comment
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to post comment');
      }
      
      // Очищаем поле комментария
      setComment('');
      
      // В реальном приложении обновите список комментариев
      // Например, перезагрузив данные или добавив новый комментарий в состояние
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post comment. Please try again later.');
    }
  };
  
  // Функция для обновления прогресса просмотра
  const handleTimeUpdate = () => {
    if (!videoRef.current || !episodeData) return;
    
    const currentTime = Math.floor(videoRef.current.currentTime);
    
    // Отправляем прогресс просмотра на сервер каждые 10 секунд
    if (currentTime % 10 === 0) {
      saveWatchProgress(currentTime);
    }
  };
  
  const saveWatchProgress = async (progress: number) => {
    try {
      // В реальном приложении замените URL на фактический API бэкенда
      await fetch('/api/anime/watch-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // В реальном приложении добавьте заголовок авторизации
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          episodeId: episodeData?.episode.id,
          progress
        })
      });
    } catch (err) {
      console.error('Error saving watch progress:', err);
    }
  };
  
  // Получаем текущий источник видео на основе выбранного качества и языка
  const getCurrentVideoSource = () => {
    if (!episodeData) return null;
    
    return episodeData.video_sources.find(
      source => source.quality === selectedQuality && source.language === selectedLanguage
    ) || episodeData.video_sources[0];
  };
  
  // Получаем уникальные качества и языки для селекторов
  const getUniqueQualities = () => {
    if (!episodeData) return [];
    
    const qualities = new Set(episodeData.video_sources.map(source => source.quality));
    return Array.from(qualities);
  };
  
  const getUniqueLanguages = () => {
    if (!episodeData) return [];
    
    const languages = new Set(episodeData.video_sources.map(source => source.language));
    return Array.from(languages);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p>{error}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!episodeData) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Episode not found</div>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const videoSource = getCurrentVideoSource();
  const { anime, episode: episodeInfo, navigation, comments } = episodeData;

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{`Episode ${episodeInfo.number} - ${anime.title} | Anime Streaming Site`}</title>
        <meta name="description" content={episodeInfo.description || `Watch episode ${episodeInfo.number} of ${anime.title} online`} />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 flex items-center text-sm text-gray-500">
          <Link href="/catalog">
            <span className="hover:text-primary-600 cursor-pointer">Catalog</span>
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/anime/${anime.slug}`}>
            <span className="hover:text-primary-600 cursor-pointer">{anime.title}</span>
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Episode {episodeInfo.number}</span>
        </div>
        
        {/* Episode Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Episode {episodeInfo.number}
          {episodeInfo.title && `: ${episodeInfo.title}`}
        </h1>
        
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-6">
          {videoSource ? (
            videoSource.source_type === 'video' ? (
              <video
                ref={videoRef}
                className="w-full aspect-video"
                controls
                poster={episodeInfo.thumbnail || undefined}
                src={videoSource.source_url}
                onTimeUpdate={handleTimeUpdate}
              >
                Your browser does not support the video tag.
              </video>
            ) : videoSource.source_type === 'iframe' ? (
              <div className="relative w-full pb-[56.25%]">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={videoSource.source_url}
                  allowFullScreen
                  title={`${anime.title} - Episode ${episodeInfo.number}`}
                ></iframe>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 text-white">
                HLS streaming not supported in this demo
              </div>
            )
          ) : (
            <div className="flex justify-center items-center h-64 text-white">
              No video source available
            </div>
          )}
        </div>
        
        {/* Video Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex space-x-4">
              {/* Episode Navigation */}
              <div className="flex space-x-2">
                {navigation.previous ? (
                  <Link href={`/anime/${anime.slug}/episode/${navigation.previous.number}`}>
                    <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded">
                      ← Previous
                    </button>
                  </Link>
                ) : (
                  <button disabled className="px-3 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">
                    ← Previous
                  </button>
                )}
                
                {navigation.next ? (
                  <Link href={`/anime/${anime.slug}/episode/${navigation.next.number}`}>
                    <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded">
                      Next →
                    </button>
                  </Link>
                ) : (
                  <button disabled className="px-3 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">
                    Next →
                  </button>
                )}
              </div>
              
              {/* Back to Anime */}
              <Link href={`/anime/${anime.slug}`}>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  All Episodes
                </button>
              </Link>
            </div>
            
            <div className="flex space-x-4">
              {/* Quality Selector */}
              {getUniqueQualities().length > 0 && (
                <div>
                  <select
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {getUniqueQualities().map(quality => (
                      <option key={quality} value={quality}>{quality}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Language Selector */}
              {getUniqueLanguages().length > 0 && (
                <div>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {getUniqueLanguages().map(language => (
                      <option key={language} value={language}>
                        {language === 'jp' ? 'Japanese' : 
                         language === 'en' ? 'English' : 
                         language === 'ru' ? 'Russian' : 
                         language.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Episode Information */}
        {(episodeInfo.description || episodeInfo.release_date || episodeInfo.duration) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Episode Information</h2>
            
            {episodeInfo.description && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{episodeInfo.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {episodeInfo.release_date && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Release Date</h3>
                  <p>{new Date(episodeInfo.release_date).toLocaleDateString()}</p>
                </div>
              )}
              
              {episodeInfo.duration && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <p>{episodeInfo.duration} minutes</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Comments</h2>
          
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="mb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Post Comment
            </button>
          </form>
          
          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {comment.avatar ? (
                        <img 
                          src={comment.avatar} 
                          alt={comment.username} 
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                          {comment.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="font-medium text-gray-800 mr-2">{comment.username}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EpisodePage;