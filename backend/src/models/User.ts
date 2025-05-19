import pool from '../config/database';
import bcrypt from 'bcrypt';

// Интерфейс для пользователя
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  avatar: string | null;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

// Интерфейс без пароля для безопасного возврата
export interface SafeUser {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

// Интерфейс для создания пользователя
export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  is_admin?: boolean;
}

// Метод для удаления пароля из объекта пользователя
export const sanitizeUser = (user: User): SafeUser => {
  const { password, ...safeUser } = user;
  return safeUser;
};

// Класс для работы с пользователями в базе данных
export class UserModel {
  // Найти пользователя по ID
  static async findById(id: number): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const { rows } = await pool.query(query, [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Найти пользователя по имени пользователя
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE username = $1';
      const { rows } = await pool.query(query, [username]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  // Найти пользователя по email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const { rows } = await pool.query(query, [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Создать нового пользователя
  static async create(userData: CreateUserDTO): Promise<User> {
    try {
      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const query = `
        INSERT INTO users(username, email, password, avatar, is_admin)
        VALUES($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [
        userData.username,
        userData.email,
        hashedPassword,
        userData.avatar || null,
        userData.is_admin || false
      ];
      
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Обновить данные пользователя
  static async update(id: number, userData: Partial<CreateUserDTO>): Promise<User | null> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Проверка существования
      const checkResult = await client.query('SELECT id FROM users WHERE id = $1', [id]);
      if (!checkResult.rows.length) return null;
      
      // Построение запроса на обновление
      const updateFields: string[] = [];
      const values: any[] = [];
      
      // Если есть пароль, хешируем его
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      Object.keys(userData).forEach((key) => {
        const value = (userData as any)[key];
        if (value !== undefined) {
          values.push(value);
          updateFields.push(`${key} = $${values.length}`);
        }
      });
      
      if (!updateFields.length) return await this.findById(id);
      
      values.push(id);
      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length}
        RETURNING *
      `;
      
      const { rows } = await client.query(query, values);
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Удалить пользователя
  static async delete(id: number): Promise<boolean> {
    try {
      const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Проверить пароль
  static async verifyPassword(user: User, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  // Получить список просмотренных аниме
  static async getWatchedAnime(userId: number): Promise<any[]> {
    try {
      const query = `
        SELECT DISTINCT a.*, MAX(we.watched_at) as last_watched
        FROM animes a
        JOIN episodes e ON a.id = e.anime_id
        JOIN watched_episodes we ON e.id = we.episode_id
        WHERE we.user_id = $1
        GROUP BY a.id
        ORDER BY last_watched DESC
      `;
      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Error getting watched anime:', error);
      throw error;
    }
  }

  // Получить список избранных аниме
  static async getFavorites(userId: number): Promise<any[]> {
    try {
      const query = `
        SELECT a.*, f.added_at
        FROM animes a
        JOIN favorites f ON a.id = f.anime_id
        WHERE f.user_id = $1
        ORDER BY f.added_at DESC
      `;
      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  }

  // Добавить аниме в избранное
  static async addToFavorites(userId: number, animeId: number): Promise<boolean> {
    try {
      const query = `
        INSERT INTO favorites(user_id, anime_id)
        VALUES($1, $2)
        ON CONFLICT (user_id, anime_id) DO NOTHING
      `;
      const { rowCount } = await pool.query(query, [userId, animeId]);
      return rowCount > 0;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  // Удалить аниме из избранного
  static async removeFromFavorites(userId: number, animeId: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM favorites WHERE user_id = $1 AND anime_id = $2';
      const { rowCount } = await pool.query(query, [userId, animeId]);
      return rowCount > 0;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  // Проверить, добавлено ли аниме в избранное
  static async isFavorite(userId: number, animeId: number): Promise<boolean> {
    try {
      const query = 'SELECT 1 FROM favorites WHERE user_id = $1 AND anime_id = $2';
      const { rows } = await pool.query(query, [userId, animeId]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking if anime is favorite:', error);
      throw error;
    }
  }

  // Добавить оценку аниме
  static async rateAnime(userId: number, animeId: number, score: number): Promise<boolean> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Добавление/обновление оценки
      const query = `
        INSERT INTO ratings(user_id, anime_id, score)
        VALUES($1, $2, $3)
        ON CONFLICT (user_id, anime_id) 
        DO UPDATE SET score = $3, created_at = CURRENT_TIMESTAMP
      `;
      await client.query(query, [userId, animeId, score]);
      
      // Обновление среднего рейтинга аниме
      await client.query(`
        UPDATE animes
        SET rating = (
          SELECT ROUND(AVG(score)::numeric, 1)
          FROM ratings
          WHERE anime_id = $1
        )
        WHERE id = $1
      `, [animeId]);
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error rating anime:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Получить оценку пользователя для аниме
  static async getUserRating(userId: number, animeId: number): Promise<number | null> {
    try {
      const query = 'SELECT score FROM ratings WHERE user_id = $1 AND anime_id = $2';
      const { rows } = await pool.query(query, [userId, animeId]);
      return rows.length ? rows[0].score : null;
    } catch (error) {
      console.error('Error getting user rating:', error);
      throw error;
    }
  }
  
  // Добавить комментарий
  static async addComment(
    userId: number, 
    text: string, 
    animeId?: number, 
    episodeId?: number, 
    parentId?: number
  ): Promise<any> {
    try {
      let query = '';
      let values = [];
      
      if (animeId) {
        query = `
          INSERT INTO comments(user_id, anime_id, text, parent_id)
          VALUES($1, $2, $3, $4)
          RETURNING *
        `;
        values = [userId, animeId, text, parentId || null];
      } else if (episodeId) {
        query = `
          INSERT INTO comments(user_id, episode_id, text, parent_id)
          VALUES($1, $2, $3, $4)
          RETURNING *
        `;
        values = [userId, episodeId, text, parentId || null];
      } else {
        throw new Error('Either animeId or episodeId must be provided');
      }
      
      const { rows } = await pool.query(query, values);
      
      // Получаем комментарий с данными пользователя
      const commentQuery = `
        SELECT c.*, u.username, u.avatar
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
      `;
      const { rows: commentData } = await pool.query(commentQuery, [rows[0].id]);
      
      return commentData[0];
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
}