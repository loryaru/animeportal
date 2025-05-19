import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import { animeApi, Anime, Episode, Genre, Studio } from '../../services/api';

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
  const [rating, setRating] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await animeApi.getAnimeDetails(id as string);
        setAnimeDetails(data);
        setRating(data.user_data.rating);
        setIsFavorite(data.user_data.is_favorite);
      } catch (err) {
        console.error('Error fetching anime details:', err);
        setError('Failed to load anime details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [id]);

  // Обработчик добавления/удаления из избранного
  const handleFavorite = async () => {
    if (!animeDetails) return;
    
    try {
      const action = isFavorite ? 'remove' : 'add';
      await animeApi.toggleFavorite(animeDetails.anime.id, action);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorites. Please try again.');
    }
  };

  // Обработчик изменения рейтинга
  const handleRating = async (newRating: number) => {
    if (!animeDetails) return;
    
    try {
      const response = await animeApi.rateAnime(animeDetails.anime.id, newRating);
      setRating(newRating);
      // Обновляем локальный рейтинг аниме
      setAnimeDetails(prev => {
        if (!prev) return null;
        return {
          ...prev,
          anime: {
            ...prev.anime,
            rating: response.new_rating
          }
        };
      });
    } catch (err) {
      console.error('Error rating anime:', err);
      alert('Failed to update rating. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout title="Loading... | Anime Streaming Site">
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-lg text-gray-600">Loading anime details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error | Anime Streaming Site">
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => router.push('/catalog')}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!animeDetails) {
    return (
      <Layout title="Not Found | Anime Streaming Site">
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-gray-600 text-4xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Anime Not Found</h2>
            <p className="text-gray-600 mb-6">The anime you are looking for could not be found.</p>
            <Link 
              href="/catalog" 
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const { anime, genres, studios, episodes } = animeDetails;

  return (
    <Layout 
      title={`${anime.title} | Anime Streaming Site`}
      description={anime.description || `Watch ${anime.title} online`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Аниме Заголовок и Постер */}
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
                <button 
                  onClick={handleFavorite}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    isFavorite 
                      ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  {isFavorite ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Added to Favorites
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Add to Favorites
                    </>
                  )}
                </button>
                
                <div className="relative group">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {rating ? `Your Rating: ${rating}` : 'Rate Anime'}
                  </button>
                  <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 text-sm text-gray-700">Rate this anime:</div>
                    <div className="flex justify-center items-center gap-1 px-4 py-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className={`w-6 h-6 flex items-center justify-center rounded ${
                            rating && star <= rating 
                              ? 'text-yellow-500' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          {star}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Список эпизодов */}
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
      </div>
    </Layout>
  );
};

export default AnimeDetailsPage;