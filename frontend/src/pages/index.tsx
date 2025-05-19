import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import AnimeCard from '../components/anime/AnimeCard';
import { animeApi, Anime } from '../services/api';

const Home: NextPage = () => {
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [latestAnime, setLatestAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем популярные и последние аниме одновременно
        const [popularData, latestData] = await Promise.all([
          animeApi.getPopularAnime(6),
          animeApi.getLatestAnime(6)
        ]);
        
        setPopularAnime(popularData.animes);
        setLatestAnime(latestData.animes);
      } catch (err) {
        console.error('Error fetching anime data:', err);
        setError('Failed to load anime data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout title="Home | Anime Streaming Site">
      {/* Hero секция */}
      <section className="bg-gradient-to-r from-primary-900 to-secondary-900 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Watch Anime Online</h1>
            <p className="text-xl mb-8">
              Stream your favorite anime in HD quality with multiple subtitles and dubbing options.
              Join our community today!
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/catalog" className="btn">
                Browse Catalog
              </Link>
              <Link href="/auth/register" className="btn-secondary">
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          ) : (
            <>
              {/* Популярные аниме */}
              <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Popular Anime</h2>
                  <Link href="/catalog?sort=rating&order=DESC" className="text-primary-600 hover:text-primary-700 font-medium">
                    View All
                  </Link>
                </div>
                
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="h-48 bg-gray-300 animate-pulse"></div>
                        <div className="p-4">
                          <div className="h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
                          <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {popularAnime.map(anime => (
                      <AnimeCard
                        key={anime.id}
                        id={anime.id}
                        title={anime.title}
                        slug={anime.slug}
                        poster={anime.poster}
                        rating={anime.rating}
                        type={anime.type}
                        releaseYear={anime.release_year}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Последние добавленные */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Latest Updates</h2>
                  <Link href="/catalog?sort=created_at&order=DESC" className="text-primary-600 hover:text-primary-700 font-medium">
                    View All
                  </Link>
                </div>
                
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="h-48 bg-gray-300 animate-pulse"></div>
                        <div className="p-4">
                          <div className="h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
                          <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {latestAnime.map(anime => (
                      <AnimeCard
                        key={anime.id}
                        id={anime.id}
                        title={anime.title}
                        slug={anime.slug}
                        poster={anime.poster}
                        rating={anime.rating}
                        type={anime.type}
                        releaseYear={anime.release_year}
                        episodes={anime.episodes_count}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
      
      {/* Информация о сайте */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">HD Quality</h3>
              <p className="text-gray-600">
                Enjoy your favorite anime in high definition quality.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Multiple Languages</h3>
              <p className="text-gray-600">
                Watch with subtitles or dubs in different languages.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">New Releases</h3>
              <p className="text-gray-600">
                Stay updated with the latest anime releases.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Watch Anywhere</h3>
              <p className="text-gray-600">
                Enjoy on your computer, tablet, or smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;