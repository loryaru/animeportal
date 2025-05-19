import axios from 'axios';

// API базовый URL
const API_URL = '/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена авторизации к запросам
api.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');
    
    // Если токен существует, добавляем его в заголовки
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерфейсы данных
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
}

export interface Episode {
  id: number;
  anime_id: number;
  number: number;
  title: string | null;
  description: string | null;
  duration: number | null;
  thumbnail: string | null;
  release_date: string | null;
}

export interface Genre {
  id: number;
  name: string;
  description: string | null;
}

export interface Studio {
  id: number;
  name: string;
  description: string | null;
}

export interface VideoSource {
  id: number;
  episode_id: number;
  quality: string;
  type: 'sub' | 'dub';
  language: string;
  source_url: string;
  source_type: 'video' | 'iframe' | 'm3u8';
}

export interface Comment {
  id: number;
  user_id: number;
  episode_id: number;
  text: string;
  created_at: string;
  username: string;
  avatar: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  is_admin: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// API функции
export const animeApi = {
  // Получить список аниме с пагинацией и фильтрацией
  getAnimeList: async (
    page: number = 1,
    limit: number = 20,
    sort: string = 'title',
    order: 'ASC' | 'DESC' = 'ASC',
    genre?: number,
    search?: string
  ) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sort', sort);
    params.append('order', order);
    
    if (genre) {
      params.append('genre', genre.toString());
    }
    
    if (search) {
      params.append('search', search);
    }
    
    const response = await api.get(`/anime/list?${params.toString()}`);
    return response.data;
  },
  
  // Получить популярные аниме
  getPopularAnime: async (limit: number = 10) => {
    const response = await api.get(`/anime/popular?limit=${limit}`);
    return response.data;
  },
  
  // Получить последние добавленные аниме
  getLatestAnime: async (limit: number = 10) => {
    const response = await api.get(`/anime/latest?limit=${limit}`);
    return response.data;
  },
  
  // Получить детальную информацию об аниме по slug
  getAnimeDetails: async (slug: string) => {
    const response = await api.get(`/anime/${slug}`);
    return response.data;
  },
  
  // Получить эпизод аниме
  getEpisode: async (slug: string, episodeNumber: number) => {
    const response = await api.get(`/anime/${slug}/episode/${episodeNumber}`);
    return response.data;
  },
  
  // Записать прогресс просмотра
  saveWatchProgress: async (episodeId: number, progress: number) => {
    const response = await api.post('/anime/watch-progress', { episodeId, progress });
    return response.data;
  },
  
  // Добавить/удалить аниме из избранного
  toggleFavorite: async (animeId: number, action: 'add' | 'remove') => {
    const response = await api.post('/anime/favorite', { animeId, action });
    return response.data;
  },
  
  // Оценить аниме
  rateAnime: async (animeId: number, score: number) => {
    const response = await api.post('/anime/rate', { animeId, score });
    return response.data;
  },
  
  // Добавить комментарий
  addComment: async (text: string, animeId?: number, episodeId?: number, parentId?: number) => {
    const response = await api.post('/anime/comment', { 
      text, 
      animeId, 
      episodeId,
      parentId
    });
    return response.data;
  }
};

export const authApi = {
  // Регистрация нового пользователя
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
  
  // Вход в систему
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Сохраняем токен в localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },
  
  // Выход из системы
  logout: () => {
    localStorage.removeItem('token');
  },
  
  // Получить данные текущего пользователя
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  // Проверить валидность токена
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      // Если токен недействителен, удаляем его из localStorage
      localStorage.removeItem('token');
      throw error;
    }
  },
  
  // Проверить, аутентифицирован ли пользователь
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export const userApi = {
  // Получить профиль пользователя
  getUserProfile: async (userId: number) => {
    const response = await api.get(`/users/profile/${userId}`);
    return response.data;
  },
  
  // Получить список просмотренных аниме
  getWatchedAnime: async () => {
    const response = await api.get('/users/watched');
    return response.data;
  },
  
  // Получить список избранных аниме
  getFavorites: async () => {
    const response = await api.get('/users/favorites');
    return response.data;
  },
  
  // Обновить профиль пользователя
  updateProfile: async (userData: {
    username?: string;
    email?: string;
    password?: string;
    avatar?: string;
  }) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  }
};

export default api;