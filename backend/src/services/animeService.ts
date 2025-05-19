import { AnimeModel } from '../models/Anime';
import { EpisodeModel } from '../models/Episode';
import { UserModel } from '../models/User';

// Интерфейс для сервиса аниме
interface AnimeService {
  getAnimeList(page?: number, limit?: number, sort?: string, order?: 'ASC' | 'DESC', genre?: number, search?: string): Promise<any>;
  getAnimeDetails(slug: string, userId?: number): Promise<any>;
  getEpisode(slug: string, number: number, userId?: number): Promise<any>;
  getPopularAnime(limit?: number): Promise<any>;
  getLatestAnime(limit?: number): Promise<any>;
}

// Реализация сервиса аниме
export default class AnimeServiceImpl implements AnimeService {
  // Получить список аниме с пагинацией и фильтрацией
  async getAnimeList(
    page: number = 1, 
    limit: number = 20, 
    sort: string = 'title',
    order: 'ASC' | 'DESC' = 'ASC',
    genre?: number,
    search?: string
  ): Promise<any> {
    try {
      const { animes, total } = await AnimeModel.getAll(page, limit, sort, order, genre, search);
      
      return {
        animes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('AnimeService - Error getting anime list:', error);
      throw error;
    }
  }

  // Получить детальную информацию об аниме по slug
  async getAnimeDetails(slug: string, userId?: number): Promise<any> {
    try {
      const anime = await AnimeModel.getBySlug(slug);
      
      if (!anime) {
        throw new Error('Anime not found');
      }
      
      // Инкрементируем счетчик просмотров
      await AnimeModel.incrementViews(anime.id);
      
      // Получаем жанры, студии и эпизоды
      const genres = await AnimeModel.getGenres(anime.id);
      const studios = await AnimeModel.getStudios(anime.id);
      const episodes = await EpisodeModel.getByAnimeId(anime.id);
      
      // Получаем данные о избранном, если пользователь авторизован
      let userData = {};
      
      if (userId) {
        const isFavorite = await UserModel.isFavorite(userId, anime.id);
        const userRating = await UserModel.getUserRating(userId, anime.id);
        
        userData = {
          is_favorite: isFavorite,
          rating: userRating
        };
      }
      
      return {
        anime,
        genres,
        studios,
        episodes,
        user_data: userData
      };
    } catch (error) {
      console.error('AnimeService - Error getting anime details:', error);
      throw error;
    }
  }

  // Получить эпизод аниме
  async getEpisode(slug: string, number: number, userId?: number): Promise<any> {
    try {
      // Находим аниме по slug
      const anime = await AnimeModel.getBySlug(slug);
      
      if (!anime) {
        throw new Error('Anime not found');
      }
      
      // Находим эпизод по ID аниме и номеру
      const episode = await EpisodeModel.getByAnimeIdAndNumber(anime.id, number);
      
      if (!episode) {
        throw new Error('Episode not found');
      }
      
      // Получаем источники видео
      const videoSources = await EpisodeModel.getVideoSources(episode.id);
      
      // Получаем прогресс просмотра пользователя, если он авторизован
      let userData = {};
      
      if (userId) {
        const watchProgress = await EpisodeModel.getWatchProgress(userId, episode.id);
        userData = {
          watch_progress: watchProgress
        };
      }
      
      // Получаем комментарии к эпизоду
      const comments = await EpisodeModel.getComments(episode.id);
      
      // Находим предыдущий и следующий эпизоды
      const previousEpisode = number > 1 
        ? await EpisodeModel.getByAnimeIdAndNumber(anime.id, number - 1) 
        : null;
        
      const nextEpisode = number < anime.episodes_count 
        ? await EpisodeModel.getByAnimeIdAndNumber(anime.id, number + 1) 
        : null;
      
      return {
        anime,
        episode,
        video_sources: videoSources,
        comments,
        navigation: {
          previous: previousEpisode ? { 
            id: previousEpisode.id, 
            number: previousEpisode.number,
            title: previousEpisode.title
          } : null,
          next: nextEpisode ? { 
            id: nextEpisode.id, 
            number: nextEpisode.number,
            title: nextEpisode.title
          } : null,
        },
        user_data: userData
      };
    } catch (error) {
      console.error('AnimeService - Error getting episode:', error);
      throw error;
    }
  }

  // Получить популярные аниме
  async getPopularAnime(limit: number = 10): Promise<any> {
    try {
      const animes = await AnimeModel.getPopular(limit);
      return { animes };
    } catch (error) {
      console.error('AnimeService - Error getting popular anime:', error);
      throw error;
    }
  }

  // Получить последние добавленные аниме
  async getLatestAnime(limit: number = 10): Promise<any> {
    try {
      const animes = await AnimeModel.getLatest(limit);
      return { animes };
    } catch (error) {
      console.error('AnimeService - Error getting latest anime:', error);
      throw error;
    }
  }
}

// Создаем экземпляр сервиса
const animeService = new AnimeServiceImpl();
export { animeService };