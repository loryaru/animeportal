import { Request, Response } from 'express';
import { EpisodeModel } from '../models/Episode';
import { AnimeModel } from '../models/Anime';

// Контроллер для работы с эпизодами
export default class EpisodeController {
  // Получить все эпизоды аниме
  static async getEpisodesByAnimeId(req: Request, res: Response) {
    try {
      const { animeId } = req.params;
      
      // Проверяем существование аниме
      const anime = await AnimeModel.getById(parseInt(animeId));
      
      if (!anime) {
        return res.status(404).json({ message: 'Anime not found' });
      }
      
      const episodes = await EpisodeModel.getByAnimeId(parseInt(animeId));
      
      res.json({ episodes });
    } catch (error) {
      console.error('Error getting episodes:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Получить эпизод по ID
  static async getEpisodeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const episode = await EpisodeModel.getById(parseInt(id));
      
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
      
      // Получаем информацию об аниме
      const anime = await AnimeModel.getById(episode.anime_id);
      
      // Получаем комментарии к эпизоду
      const comments = await EpisodeModel.getComments(episode.id);
      
      // Находим предыдущий и следующий эпизоды
      const previousEpisode = episode.number > 1 
        ? await EpisodeModel.getByAnimeIdAndNumber(episode.anime_id, episode.number - 1) 
        : null;
        
      const nextEpisode = anime && episode.number < anime.episodes_count 
        ? await EpisodeModel.getByAnimeIdAndNumber(episode.anime_id, episode.number + 1) 
        : null;
      
      res.json({
        episode,
        anime,
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
      console.error('Error getting episode by ID:', error);
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
      
      // Проверяем существование эпизода
      const episode = await EpisodeModel.getById(episodeId);
      
      if (!episode) {
        return res.status(404).json({ message: 'Episode not found' });
      }
      
      await EpisodeModel.recordWatchProgress(req.userId, episodeId, progress);
      
      res.json({ message: 'Progress saved successfully' });
    } catch (error) {
      console.error('Error saving watch progress:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Получить источники видео для эпизода
  static async getVideoSources(req: Request, res: Response) {
    try {
      const { episodeId } = req.params;
      const videoSources = await EpisodeModel.getVideoSources(parseInt(episodeId));
      
      res.json({ video_sources: videoSources });
    } catch (error) {
      console.error('Error getting video sources:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Получить комментарии к эпизоду
  static async getComments(req: Request, res: Response) {
    try {
      const { episodeId } = req.params;
      const comments = await EpisodeModel.getComments(parseInt(episodeId));
      
      res.json({ comments });
    } catch (error) {
      console.error('Error getting comments:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // [ADMIN] Создать новый эпизод
  static async createEpisode(req: Request, res: Response) {
    try {
      const {
        anime_id,
        number,
        title,
        description,
        duration,
        thumbnail,
        release_date
      } = req.body;
      
      // Проверка обязательных полей
      if (!anime_id || !number) {
        return res.status(400).json({ message: 'Anime ID and episode number are required' });
      }
      
      // Проверяем существование аниме
      const anime = await AnimeModel.getById(anime_id);
      
      if (!anime) {
        return res.status(404).json({ message: 'Anime not found' });
      }
      
      // Проверяем, не существует ли уже эпизод с таким номером
      const existingEpisode = await EpisodeModel.getByAnimeIdAndNumber(anime_id, number);
      
      if (existingEpisode) {
        return res.status(400).json({ message: 'Episode with this number already exists' });
      }
      
      // Создаем эпизод
      const episode = await EpisodeModel.create({
        anime_id,
        number,
        title,
        description,
        duration,
        thumbnail,
        release_date: release_date ? new Date(release_date) : undefined
      });
      
      res.status(201).json({
        message: 'Episode created successfully',
        episode
      });
    } catch (error) {
      console.error('Error creating episode:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // [ADMIN] Обновить эпизод
  static async updateEpisode(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        duration,
        thumbnail,
        release_date
      } = req.body;
      
      // Проверяем существование эпизода
      const existingEpisode = await EpisodeModel.getById(parseInt(id));
      
      if (!existingEpisode) {
        return res.status(404).json({ message: 'Episode not found' });
      }
      
      // Обновляем эпизод
      const episode = await EpisodeModel.update(parseInt(id), {
        title,
        description,
        duration,
        thumbnail,
        release_date: release_date ? new Date(release_date) : undefined
      });
      
      res.json({
        message: 'Episode updated successfully',
        episode
      });
    } catch (error) {
      console.error('Error updating episode:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // [ADMIN] Удалить эпизод
  static async deleteEpisode(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Проверяем существование эпизода
      const existingEpisode = await EpisodeModel.getById(parseInt(id));
      
      if (!existingEpisode) {
        return res.status(404).json({ message: 'Episode not found' });
      }
      
      // Удаляем эпизод
      const result = await EpisodeModel.delete(parseInt(id));
      
      if (result) {
        res.json({ message: 'Episode deleted successfully' });
      } else {
        res.status(500).json({ message: 'Failed to delete episode' });
      }
    } catch (error) {
      console.error('Error deleting episode:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // [ADMIN] Добавить источник видео
  static async addVideoSource(req: Request, res: Response) {
    try {
      const {
        episode_id,
        quality,
        type,
        language,
        source_url,
        source_type
      } = req.body;
      
      // Проверка обязательных полей
      if (!episode_id || !quality || !type || !language || !source_url || !source_type) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Проверяем существование эпизода
      const episode = await EpisodeModel.getById(episode_id);
      
      if (!episode) {
        return res.status(404).json({ message: 'Episode not found' });
      }
      
      // Добавляем источник видео
      const videoSource = await EpisodeModel.addVideoSource({
        episode_id,
        quality,
        type,
        language,
        source_url,
        source_type
      });
      
      res.status(201).json({
        message: 'Video source added successfully',
        video_source: videoSource
      });
    } catch (error) {
      console.error('Error adding video source:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // [ADMIN] Удалить источник видео
  static async deleteVideoSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Удаляем источник видео
      const result = await EpisodeModel.deleteVideoSource(parseInt(id));
      
      if (result) {
        res.json({ message: 'Video source deleted successfully' });
      } else {
        res.status(404).json({ message: 'Video source not found' });
      }
    } catch (error) {
      console.error('Error deleting video source:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}