import pool from '../config/database';

// Интерфейс для аниме
export interface Anime {
  id: number;
  title: string;
  original_title: string | null;
  slug: string;
  description: string | null;
  release_year: number | null;
  status: 'ongoing' | 'completed' | 'announced';
  type: 'tv' | 'movie' | 'ova' | 'ona' | 'special';
  episodes_count: number | null;
  poster: string | null;
  rating: number;
  views: number;
  created_at: Date;
  updated_at: Date;
}

// Интерфейс для создания нового аниме
export interface CreateAnimeDTO {
  title: string;
  original_title?: string;
  slug: string;
  description?: string;
  release_year?: number;
  status: 'ongoing' | 'completed' | 'announced';
  type: 'tv' | 'movie' | 'ova' | 'ona' | 'special';
  episodes_count?: number;
  poster?: string;
}

// Класс для работы с аниме в базе данных
export class AnimeModel {
  // Получить все аниме с пагинацией
  static async getAll(
    page: number = 1, 
    limit: number = 20, 
    sort: string = 'title',
    order: 'ASC' | 'DESC' = 'ASC',
    genre?: number,
    search?: string
  ): Promise<{ animes: Anime[], total: number }> {
    // Базовый запрос
    let query = `
      SELECT a.*, 
             COALESCE(AVG(r.score), 0) as rating
      FROM animes a
      LEFT JOIN ratings r ON a.id = r.anime_id
    `;
    
    const queryParams: any[] = [];
    let whereClause = '';
    
    // Добавляем условия, если есть фильтры
    if (genre) {
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      queryParams.push(genre);
      whereClause += `a.id IN (SELECT anime_id FROM anime_genres WHERE genre_id = $${queryParams.length})`;
    }
    
    if (search) {
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      queryParams.push(`%${search}%`);
      whereClause += `(a.title ILIKE $${queryParams.length} OR a.original_title ILIKE $${queryParams.length})`;
    }
    
    // Добавляем WHERE часть к запросу
    query += whereClause;
    
    // Группировка для AVG
    query += ' GROUP BY a.id';
    
    // Сортировка
    query += ` ORDER BY ${sort === 'rating' ? 'rating' : `a.${sort}`} ${order}`;
    
    // Пагинация
    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);
    query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
    
    // Запрос на общее количество
    let countQuery = `
      SELECT COUNT(DISTINCT a.id) as total
      FROM animes a
    `;
    
    if (genre) {
      countQuery += ` JOIN anime_genres ag ON a.id = ag.anime_id AND ag.genre_id = $1`;
    }
    
    if (search && !genre) {
      countQuery += ` WHERE (a.title ILIKE $1 OR a.original_title ILIKE $1)`;
    } else if (search && genre) {
      countQuery += ` AND (a.title ILIKE $2 OR a.original_title ILIKE $2)`;
    }
    
    // Выполнение запросов
    const countParams = [];
    if (genre) countParams.push(genre);
    if (search) countParams.push(`%${search}%`);
    
    try {
      const { rows: animes } = await pool.query(query, queryParams);
      const { rows: countResult } = await pool.query(countQuery, countParams);
      const total = parseInt(countResult[0].total);
      
      return { animes, total };
    } catch (error) {
      console.error('Error fetching animes:', error);
      throw error;
    }
  }

  // Получить аниме по ID
  static async getById(id: number): Promise<Anime | null> {
    try {
      const query = `
        SELECT a.*,
               COALESCE(AVG(r.score), 0) as rating
        FROM animes a
        LEFT JOIN ratings r ON a.id = r.anime_id
        WHERE a.id = $1
        GROUP BY a.id
      `;
      const { rows } = await pool.query(query, [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error fetching anime by ID:', error);
      throw error;
    }
  }

  // Получить аниме по slug
  static async getBySlug(slug: string): Promise<Anime | null> {
    try {
      const query = `
        SELECT a.*,
               COALESCE(AVG(r.score), 0) as rating
        FROM animes a
        LEFT JOIN ratings r ON a.id = r.anime_id
        WHERE a.slug = $1
        GROUP BY a.id
      `;
      const { rows } = await pool.query(query, [slug]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error fetching anime by slug:', error);
      throw error;
    }
  }

  // Создать новое аниме
  static async create(animeData: CreateAnimeDTO): Promise<Anime> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO animes(
          title, original_title, slug, description, release_year, 
          status, type, episodes_count, poster
        )
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const values = [
        animeData.title,
        animeData.original_title || null,
        animeData.slug,
        animeData.description || null,
        animeData.release_year || null,
        animeData.status,
        animeData.type,
        animeData.episodes_count || null,
        animeData.poster || null
      ];
      
      const { rows } = await client.query(query, values);
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating anime:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Обновить аниме
  static async update(id: number, animeData: Partial<CreateAnimeDTO>): Promise<Anime | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Проверка существования
      const checkResult = await client.query('SELECT id FROM animes WHERE id = $1', [id]);
      if (!checkResult.rows.length) return null;
      
      // Построение запроса на обновление
      const updateFields: string[] = [];
      const values: any[] = [];
      
      Object.keys(animeData).forEach((key, index) => {
        const value = (animeData as any)[key];
        if (value !== undefined) {
          values.push(value);
          updateFields.push(`${key} = $${values.length}`);
        }
      });
      
      if (!updateFields.length) return await this.getById(id);
      
      values.push(id);
      const query = `
        UPDATE animes 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length}
        RETURNING *
      `;
      
      const { rows } = await client.query(query, values);
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating anime:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Удалить аниме
  static async delete(id: number): Promise<boolean> {
    try {
      const { rowCount } = await pool.query('DELETE FROM animes WHERE id = $1', [id]);
      return rowCount > 0;
    } catch (error) {
      console.error('Error deleting anime:', error);
      throw error;
    }
  }

  // Получить жанры аниме
  static async getGenres(animeId: number): Promise<any[]> {
    try {
      const query = `
        SELECT g.id, g.name, g.description
        FROM genres g
        JOIN anime_genres ag ON g.id = ag.genre_id
        WHERE ag.anime_id = $1
      `;
      const { rows } = await pool.query(query, [animeId]);
      return rows;
    } catch (error) {
      console.error('Error fetching anime genres:', error);
      throw error;
    }
  }

  // Получить студии аниме
  static async getStudios(animeId: number): Promise<any[]> {
    try {
      const query = `
        SELECT s.id, s.name, s.description
        FROM studios s
        JOIN anime_studios as ON s.id = as.studio_id
        WHERE as.anime_id = $1
      `;
      const { rows } = await pool.query(query, [animeId]);
      return rows;
    } catch (error) {
      console.error('Error fetching anime studios:', error);
      throw error;
    }
  }

  // Обновить счетчик просмотров
  static async incrementViews(id: number): Promise<void> {
    try {
      await pool.query(
        'UPDATE animes SET views = views + 1 WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error('Error incrementing anime views:', error);
      throw error;
    }
  }

  // Получить популярные аниме
  static async getPopular(limit: number = 10): Promise<Anime[]> {
    try {
      const query = `
        SELECT a.*, 
               COALESCE(AVG(r.score), 0) as rating
        FROM animes a
        LEFT JOIN ratings r ON a.id = r.anime_id
        GROUP BY a.id
        ORDER BY views DESC, rating DESC
        LIMIT $1
      `;
      const { rows } = await pool.query(query, [limit]);
      return rows;
    } catch (error) {
      console.error('Error fetching popular animes:', error);
      throw error;
    }
  }

  // Получить последние добавленные аниме
  static async getLatest(limit: number = 10): Promise<Anime[]> {
    try {
      const query = `
        SELECT a.*, 
               COALESCE(AVG(r.score), 0) as rating
        FROM animes a
        LEFT JOIN ratings r ON a.id = r.anime_id
        GROUP BY a.id
        ORDER BY a.created_at DESC
        LIMIT $1
      `;
      const { rows } = await pool.query(query, [limit]);
      return rows;
    } catch (error) {
      console.error('Error fetching latest animes:', error);
      throw error;
    }
  }
}