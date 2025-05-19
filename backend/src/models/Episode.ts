import pool from '../config/database';

// Интерфейс для эпизода
export interface Episode {
  id: number;
  anime_id: number;
  number: number;
  title: string | null;
  description: string | null;
  duration: number | null;
  thumbnail: string | null;
  release_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Интерфейс для источника видео
export interface VideoSource {
  id: number;
  episode_id: number;
  quality: '240p' | '360p' | '480p' | '720p' | '1080p' | '4k';
  type: 'sub' | 'dub';
  language: string;
  source_url: string;
  source_type: 'video' | 'iframe' | 'm3u8';
  created_at: Date;
  updated_at: Date;
}

// Интерфейс для создания нового эпизода
export interface CreateEpisodeDTO {
  anime_id: number;
  number: number;
  title?: string;
  description?: string;
  duration?: number;
  thumbnail?: string;
  release_date?: Date;
}

// Интерфейс для создания нового источника видео
export interface CreateVideoSourceDTO {
  episode_id: number;
  quality: '240p' | '360p' | '480p' | '720p' | '1080p' | '4k';
  type: 'sub' | 'dub';
  language: string;
  source_url: string;
  source_type: 'video' | 'iframe' | 'm3u8';
}

// Класс для работы с эпизодами в базе данных
export class EpisodeModel {
  // Получить все эпизоды аниме
  static async getByAnimeId(animeId: number): Promise<Episode[]> {
    try {
      const query = `
        SELECT * FROM episodes 
        WHERE anime_id = $1
        ORDER BY number ASC
      `;
      const { rows } = await pool.query(query, [animeId]);
      return rows;
    } catch (error) {
      console.error('Error fetching episodes by anime ID:', error);
      throw error;
    }
  }

  // Получить эпизод по ID
  static async getById(id: number): Promise<Episode | null> {
    try {
      const query = 'SELECT * FROM episodes WHERE id = $1';
      const { rows } = await pool.query(query, [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error fetching episode by ID:', error);
      throw error;
    }
  }

  // Получить эпизод по номеру и ID аниме
  static async getByAnimeIdAndNumber(animeId: number, number: number): Promise<Episode | null> {
    try {
      const query = 'SELECT * FROM episodes WHERE anime_id = $1 AND number = $2';
      const { rows } = await pool.query(query, [animeId, number]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error fetching episode by anime ID and number:', error);
      throw error;
    }
  }

  // Создать новый эпизод
  static async create(episodeData: CreateEpisodeDTO): Promise<Episode> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO episodes(
          anime_id, number, title, description, duration, 
          thumbnail, release_date
        )
        VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const values = [
        episodeData.anime_id,
        episodeData.number,
        episodeData.title || null,
        episodeData.description || null,
        episodeData.duration || null,
        episodeData.thumbnail || null,
        episodeData.release_date || null
      ];
      
      const { rows } = await client.query(query, values);
      
      // Обновляем количество эпизодов в таблице аниме
      await client.query(`
        UPDATE animes
        SET episodes_count = (
          SELECT COUNT(*) FROM episodes WHERE anime_id = $1
        )
        WHERE id = $1
      `, [episodeData.anime_id]);
      
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating episode:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Обновить эпизод
  static async update(id: number, episodeData: Partial<CreateEpisodeDTO>): Promise<Episode | null> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Проверка существования
      const checkResult = await client.query('SELECT id FROM episodes WHERE id = $1', [id]);
      if (!checkResult.rows.length) return null;
      
      // Построение запроса на обновление
      const updateFields: string[] = [];
      const values: any[] = [];
      
      Object.keys(episodeData).forEach((key, index) => {
        const value = (episodeData as any)[key];
        if (value !== undefined) {
          values.push(value);
          updateFields.push(`${key} = $${values.length}`);
        }
      });
      
      if (!updateFields.length) return await this.getById(id);
      
      values.push(id);
      const query = `
        UPDATE episodes 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length}
        RETURNING *
      `;
      
      const { rows } = await client.query(query, values);
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating episode:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Удалить эпизод
  static async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Получаем anime_id перед удалением
      const { rows } = await client.query('SELECT anime_id FROM episodes WHERE id = $1', [id]);
      if (!rows.length) return false;
      
      const animeId = rows[0].anime_id;
      
      // Удаляем эпизод
      const deleteResult = await client.query('DELETE FROM episodes WHERE id = $1', [id]);
      
      // Обновляем количество эпизодов в таблице аниме
      await client.query(`
        UPDATE animes
        SET episodes_count = (
          SELECT COUNT(*) FROM episodes WHERE anime_id = $1
        )
        WHERE id = $1
      `, [animeId]);
      
      await client.query('COMMIT');
      return deleteResult.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting episode:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Получить источники видео для эпизода
  static async getVideoSources(episodeId: number): Promise<VideoSource[]> {
    try {
      const query = `
        SELECT * FROM video_sources
        WHERE episode_id = $1
        ORDER BY quality DESC, language
      `;
      const { rows } = await pool.query(query, [episodeId]);
      return rows;
    } catch (error) {
      console.error('Error fetching video sources:', error);
      throw error;
    }
  }

  // Добавить источник видео
  static async addVideoSource(sourceData: CreateVideoSourceDTO): Promise<VideoSource> {
    try {
      const query = `
        INSERT INTO video_sources(
          episode_id, quality, type, language, source_url, source_type
        )
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const values = [
        sourceData.episode_id,
        sourceData.quality,
        sourceData.type,
        sourceData.language,
        sourceData.source_url,
        sourceData.source_type
      ];
      
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error adding video source:', error);
      throw error;
    }
  }

  // Удалить источник видео
  static async deleteVideoSource(id: number): Promise<boolean> {
    try {
      const { rowCount } = await pool.query('DELETE FROM video_sources WHERE id = $1', [id]);
      return rowCount > 0;
    } catch (error) {
      console.error('Error deleting video source:', error);
      throw error;
    }
  }
  
  // Получить комментарии к эпизоду
  static async getComments(episodeId: number): Promise<any[]> {
    try {
      const query = `
        SELECT c.*, u.username, u.avatar
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.episode_id = $1 AND c.parent_id IS NULL
        ORDER BY c.created_at DESC
      `;
      const { rows } = await pool.query(query, [episodeId]);
      return rows;
    } catch (error) {
      console.error('Error fetching episode comments:', error);
      throw error;
    }
  }
  
  // Записать прогресс просмотра
  static async recordWatchProgress(userId: number, episodeId: number, progress: number): Promise<void> {
    try {
      const query = `
        INSERT INTO watched_episodes(user_id, episode_id, watch_progress)
        VALUES($1, $2, $3)
        ON CONFLICT (user_id, episode_id) 
        DO UPDATE SET watch_progress = $3, watched_at = CURRENT_TIMESTAMP
      `;
      await pool.query(query, [userId, episodeId, progress]);
    } catch (error) {
      console.error('Error recording watch progress:', error);
      throw error;
    }
  }
  
  // Получить прогресс просмотра
  static async getWatchProgress(userId: number, episodeId: number): Promise<number | null> {
    try {
      const query = `
        SELECT watch_progress
        FROM watched_episodes
        WHERE user_id = $1 AND episode_id = $2
      `;
      const { rows } = await pool.query(query, [userId, episodeId]);
      return rows.length ? rows[0].watch_progress : null;
    } catch (error) {
      console.error('Error getting watch progress:', error);
      throw error;
    }
  }
}