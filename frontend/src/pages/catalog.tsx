import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Anime {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  poster: string | null;
  rating: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const Catalog: NextPage = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        setLoading(true);
        // В реальном приложении замените URL на фактический API бэкенда
        const res = await fetch(`/api/anime/list?page=${pagination.page}&limit=${pagination.limit}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch anime list');
        }
        
        const data = await res.json();
        setAnimes(data.animes || []);
        setPagination(data.pagination || pagination);
      } catch (err) {
        console.error('Error fetching anime list:', err);
        setError('Failed to load anime list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, [pagination.page, pagination.limit]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Anime Catalog | Anime Streaming Site</title>
        <meta name="description" content="Browse our anime catalog" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary-600 mb-6">Anime Catalog</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, index) => (
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
          <>
            {animes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No anime found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {animes.map((anime) => (
                  <Link href={`/anime/${anime.slug}`} key={anime.id}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="h-48 bg-gray-300 relative">
                        {anime.poster && (
                          <img 
                            src={anime.poster} 
                            alt={anime.title} 
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-sm">
                          ★ {anime.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-800 truncate">{anime.title}</h3>
                        {anime.description && (
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{anime.description}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                    disabled={pagination.page === 1}
                    className={`px-4 py-2 border border-gray-300 rounded-l-md ${
                      pagination.page === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPagination({ ...pagination, page: i + 1 })}
                      className={`px-4 py-2 border-t border-b border-gray-300 ${
                        pagination.page === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                    disabled={pagination.page === pagination.pages}
                    className={`px-4 py-2 border border-gray-300 rounded-r-md ${
                      pagination.page === pagination.pages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Catalog;