import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

interface Anime {
  id: number;
  title: string;
  original_title: string | null;
  slug: string;
  description: string | null;
  release_year: number | null;
  status: string;
  type: string;
  episodes_count: number | null;
  poster: string | null;
  rating: number;
  views: number;
}

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

interface Genre {
  id: number;
  name: string;
  description: string | null;
}

interface Studio {
  id: number;
  name: string;
  description: string | null;
}

interface AnimeDetails {
  anime: Anime;
  genres: Genre[];
  studios: Studio[];
  episodes: Episode[];
  user_data: {
    is_favorite: boolean;
    rating: number | null;
  };
}

const AnimeDetailsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [animeDetails, setAnimeDetails] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // В реальном приложении замените URL на фактический API бэкенда
        const res = await fetch(`/api/anime/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch anime details');
        }
        
        const data = await res.json();
        setAnimeDetails(data);
      } catch (err) {
        console.error('Error fetching anime details:', err);
        setError('Failed to load anime details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [id]);

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
            onClick={() => router.push('/catalog')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  if (!animeDetails) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Anime not found</div>
          <button 
            onClick={() => router.push('/catalog')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const { anime, genres, studios, episodes } = animeDetails;

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{anime.title} | Anime Streaming Site</title>
        <meta name="description" content={anime.description || `Watch ${anime.title} online`} />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Anime Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3 lg:w-1/4">
              <div className="h-64 md:h-full bg-gray-300 relative">
                {anime.poster ? (
                  <img 
                    src={anime.poster} 
                    alt={anime.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    No poster available
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 md:w-2/3 lg:w-3/4">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{anime.title}</h1>
              {anime.original_title && (
                <h2 className="text-xl text-gray-600 mb-4">{anime.original_title}</h2>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map(genre => (
                  <span key={genre.id} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-medium capitalize">{anime.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium capitalize">{anime.status}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Year</div>
                  <div className="font-medium">{anime.release_year || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Episodes</div>
                  <div className="font-medium">{anime.episodes_count || '?'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Rating</div>
                  <div className="font-medium flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    {anime.rating.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Studio</div>
                  <div className="font-medium">
                    {studios.length > 0 
                      ? studios.map(studio => studio.name).join(', ')
                      : 'Unknown'
                    }
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
                <p className="text-gray-700">{anime.description || 'No description available.'}</p>
              </div>
              
              <div className="flex space-x-4">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                  Add to Favorites
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                  Rate Anime
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Episodes List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Episodes</h2>
            
            {episodes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No episodes available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {episodes.map(episode => (
                  <div 
                    key={episode.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/anime/${anime.slug}/episode/${episode.number}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mr-4">
                          {episode.number}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            Episode {episode.number}
                            {episode.title && `: ${episode.title}`}
                          </h3>
                          {episode.duration && (
                            <p className="text-sm text-gray-500">{episode.duration} min</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Watch
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnimeDetailsPage;