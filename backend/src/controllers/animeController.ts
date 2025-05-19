import { Request, Response } from 'express';
import { AnimeModel } from '../models/Anime';
import { EpisodeModel } from '../models/Episode';
import { UserModel } from '../models/User';

// Контроллер для работы с аниме
export default class AnimeController {
  // Получить список аниме с пагинацией и фильтрацией
  static async getAnimeList(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const sort = (req.query.sort as string) || 'title';
      const order = ((req.query.order as string) || 'ASC').toUpperCase() as 'ASC' | 'DESC';
      const genre = req.query.genre ? parseInt(req.query.genre as string) : undefined;
      const search = req.query.search as string;
      
      const { animes, total } = await AnimeModel.getAll(page, limit, sort, order, genre, search);
      
      res.json({
        animes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting anime list:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Получить популярные аниме
  static async getPopularAnime(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const animes = await AnimeModel.getPopular(limit);
      res.json({ animes });
    } catch (error) {
      console.error('Error getting popular anime:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Получить последние добавленные аниме
  static async getLatestAnime(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const animes = await AnimeModel.getLatest(limit);
      res.json({ animes });
    } catch (error) {
      console.error('Error getting latest anime:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Получить детальную информацию об аниме по slug
  static async getAnimeDetails(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const anime = await AnimeModel.getBySlug(slug);
      
      if (!anime) {
        return res.status(404).json({ message: 'Anime not found' });
      }
      
      // Инкрементируем счетчик просмотров
      await AnimeModel.incrementViews(anime.id);
      
      // Получаем жанры, студии и эпизоды
      const genres = await AnimeModel.getGenres(anime.id);
      const studios = await AnimeModel.getStudios(anime.id);
      const episodes = await EpisodeModel.getByAnimeId(anime.id);
      
      // Получаем данные о избранном, если пользователь авторизован
      let isFavorite = false;
      let userRating = null;
      
      if (req.userId) {
        isFavorite = await UserModel.isFavorite(req.userId, anime.id);
        userRating = await UserModel.getUserRating(req.userId, anime.id);
      }
      
      res.json({
        anime,
        genres,
        studios,
        episodes,
        user_data: {
          is_favorite: isFavorite,
          rating: userRating
        }
      });
    } catch (error) {
      console.error('Error getting anime details:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Получить эпизод аниме
  static async getEpisode(req: Request, res: Response) {
    try {
      const { slug, number } = req.params;
      const episodeNumber = parseInt(number);
      
      // Находим аниме по slug
      const anime = await AnimeModel.getBySlug(slug);
      
      if (!anime) {
        return res.status(404).json({ message: 'Anime not found' });
      }
      
      // Находим эпизод по ID аниме и номеру
      const episode = await EpisodeModel.getByAnimeIdAndNumber(anime.id, episodeNumber);
      
      if (!episode) {
        return res.status(404).json({ message: 'Episode not found' });
      }
      
      // Получаем источники видео
      const videoSources = await EpisodeModel.getVideoSources(episode.id);
      
      // Получаем прогресс просмотра пользователя, если он авторизован
      let watchProgress = null;
      
      if (req.userId) {
        watchProgress = await EpisodeModel.getWatchProgress(req.userId, episode.id);
      }
      
      // Получаем комментарии к эпизоду
      const comments = await EpisodeModel.getComments(episode.id);
      
      // Находим предыдущий и следующий эпизоды
      const previousEpisode = episodeNumber > 1 
        ? await EpisodeModel.getByAnimeIdAndNumber(anime.id, episodeNumber - 1) 
        : null;
        
      const nextEpisode = episodeNumber < anime.episodes_count 
        ? await EpisodeModel.getByAnimeIdAndNumber(anime.id, episodeNumber + 1) 
        : null;
      
      res.json({
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
        user_data: {
          watch_progress: watchProgress
        }
      });
    } catch (error) {
      console.error('Error getting episode:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Записать прогресс просмотра (требуется аутентификация)
  static async saveWatchProgress(req: Request, res: Response) {
    try {
      const { episodeId, progress } = req.body;
      
      if (!req.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!episodeId || progress === undefined) {
        return res.status(400).json({ message: 'Episode ID and progress are required' });
      }
      
      await EpisodeModel.recordWatchProgress(req.userId, episodeId, progress);
      
      res.json({ message: 'Progress saved successfully' });
    } catch (error) {
      console.error('Error saving watch progress:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Добавить аниме в избранное (требуется аутентификация)
  static async toggleFavorite(req: Request, res: Response) {
    try {
      const { animeId, action } = req.body;
      
      if (!req.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!animeId || !action) {
        return res.status(400).json({ message: 'Anime ID and action are required' });
      }
      
      let result;
      
      if (action === 'add') {
        result = await UserModel.addToFavorites(req.userId, animeId);
        res.json({ message: 'Added to favorites', success: result });
      } else if (action === 'remove') {
        result = await UserModel.removeFromFavorites(req.userId, animeId);
        res.json({ message: 'Removed from favorites', success: result });
      } else {
        return res.status(400).json({ message: 'Invalid action. Use "add" or "remove"' });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Оценить аниме (требуется аутентификация)
  static async rateAnime(req: Request, res: Response) {
    try {
      const { animeId, score } = req.body;
      
      if (!req.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!animeId || score === undefined) {
        return res.status(400).json({ message: 'Anime ID and score are required' });
      }
      
      // Проверяем, что оценка в диапазоне от 1 до 10
      if (score < 1 || score > 10) {
        return res.status(400).json({ message: 'Score must be between 1 and 10' });
      }
      
      await UserModel.rateAnime(req.userId, animeId, score);
      
      // Получаем обновленный рейтинг аниме
      const anime = await AnimeModel.getById(animeId);
      
      res.json({ 
        message: 'Rating saved successfully', 
        new_rating: anime?.rating
      });
    } catch (error) {
      console.error('Error rating anime:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Добавить комментарий к аниме (требуется аутентификация)
  static async addComment(req: Request, res: Response) {
    try {
      const { animeId, episodeId, text, parentId } = req.body;
      
      if (!req.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!text) {
        return res.status(400).json({ message: 'Comment text is required' });
      }
      
      if (!animeId && !episodeId) {
        return res.status(400).json({ message: 'Either anime ID or episode ID is required' });
      }
      
      const comment = await UserModel.addComment(
        req.userId, 
        text, 
        animeId, 
        episodeId, 
        parentId
      );
      
      res.status(201).json({ 
        message: 'Comment added successfully',
        comment 
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}