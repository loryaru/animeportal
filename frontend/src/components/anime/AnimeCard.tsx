import React from 'react';
import Link from 'next/link';

interface AnimeCardProps {
  id: number;
  title: string;
  slug: string;
  poster?: string | null;
  rating?: number;
  type?: string;
  releaseYear?: number | null;
  episodes?: number | null;
}

const AnimeCard: React.FC<AnimeCardProps> = ({
  id,
  title,
  slug,
  poster,
  rating,
  type,
  releaseYear,
  episodes
}) => {
  return (
    <Link href={`/anime/${slug}`} className="block h-full">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* Изображение */}
        <div className="relative h-64 bg-gray-300">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              No poster available
            </div>
          )}
          
          {/* Рейтинг */}
          {rating !== undefined && (
            <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-sm">
              ★ {rating.toFixed(1)}
            </div>
          )}
          
          {/* Тип аниме */}
          {type && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs uppercase">
              {type}
            </div>
          )}
        </div>
        
        {/* Информация */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-bold text-gray-800 line-clamp-2 mb-1">{title}</h3>
          
          <div className="mt-auto flex justify-between pt-2 text-sm text-gray-600">
            {releaseYear && (
              <div>{releaseYear}</div>
            )}
            {episodes && (
              <div>{episodes} ep{episodes > 1 ? 's' : ''}</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;