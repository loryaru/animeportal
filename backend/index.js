// Это упрощенный запасной вариант, если TypeScript бэкенд не работает
const express = require('express');
const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

// Маршрут для проверки, что API работает
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is working!' });
});

// Базовые маршруты для тестирования
app.get('/api/anime/list', (req, res) => {
  res.json({
    animes: [
      {
        id: 1,
        title: 'Demon Slayer',
        slug: 'demon-slayer',
        description: 'A boy becomes a demon slayer after his family is slaughtered and his sister is turned into a demon.',
        release_year: 2019,
        status: 'completed',
        type: 'tv',
        episodes_count: 26,
        rating: 8.9,
        poster: null
      },
      {
        id: 2,
        title: 'Attack on Titan',
        slug: 'attack-on-titan',
        description: 'Humans fight against giant humanoid creatures called Titans.',
        release_year: 2013,
        status: 'completed',
        type: 'tv',
        episodes_count: 75,
        rating: 9.0,
        poster: null
      },
      {
        id: 3,
        title: 'My Hero Academia',
        slug: 'my-hero-academia',
        description: 'A boy born without superpowers in a world where they are common has dreams of becoming a hero.',
        release_year: 2016,
        status: 'ongoing',
        type: 'tv',
        episodes_count: 113,
        rating: 8.4,
        poster: null
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 3,
      pages: 1
    }
  });
});

app.get('/api/anime/popular', (req, res) => {
  res.json({
    animes: [
      {
        id: 2,
        title: 'Attack on Titan',
        slug: 'attack-on-titan',
        description: 'Humans fight against giant humanoid creatures called Titans.',
        rating: 9.0,
        poster: null
      },
      {
        id: 1,
        title: 'Demon Slayer',
        slug: 'demon-slayer',
        description: 'A boy becomes a demon slayer after his family is slaughtered and his sister is turned into a demon.',
        rating: 8.9,
        poster: null
      }
    ]
  });
});

app.get('/api/anime/latest', (req, res) => {
  res.json({
    animes: [
      {
        id: 3,
        title: 'My Hero Academia',
        slug: 'my-hero-academia',
        description: 'A boy born without superpowers in a world where they are common has dreams of becoming a hero.',
        rating: 8.4,
        poster: null
      },
      {
        id: 1,
        title: 'Demon Slayer',
        slug: 'demon-slayer',
        description: 'A boy becomes a demon slayer after his family is slaughtered and his sister is turned into a demon.',
        rating: 8.9,
        poster: null
      }
    ]
  });
});

app.get('/api/anime/:slug', (req, res) => {
  const { slug } = req.params;
  
  // Здесь мы просто возвращаем фиктивные данные для демонстрации
  res.json({
    anime: {
      id: slug === 'demon-slayer' ? 1 : (slug === 'attack-on-titan' ? 2 : 3),
      title: slug === 'demon-slayer' ? 'Demon Slayer' : 
             (slug === 'attack-on-titan' ? 'Attack on Titan' : 'My Hero Academia'),
      original_title: slug === 'demon-slayer' ? '鬼滅の刃' : 
                    (slug === 'attack-on-titan' ? '進撃の巨人' : '僕のヒーローアカデミア'),
      slug,
      description: slug === 'demon-slayer' ? 'A boy becomes a demon slayer after his family is slaughtered and his sister is turned into a demon.' : 
                 (slug === 'attack-on-titan' ? 'Humans fight against giant humanoid creatures called Titans.' : 
                 'A boy born without superpowers in a world where they are common has dreams of becoming a hero.'),
      release_year: slug === 'demon-slayer' ? 2019 : (slug === 'attack-on-titan' ? 2013 : 2016),
      status: slug === 'my-hero-academia' ? 'ongoing' : 'completed',
      type: 'tv',
      episodes_count: slug === 'demon-slayer' ? 26 : (slug === 'attack-on-titan' ? 75 : 113),
      rating: slug === 'demon-slayer' ? 8.9 : (slug === 'attack-on-titan' ? 9.0 : 8.4),
      poster: null
    },
    genres: [
      { id: 1, name: 'Action', description: null },
      { id: 2, name: 'Adventure', description: null },
      { id: 4, name: 'Drama', description: null },
      { id: 5, name: 'Fantasy', description: null }
    ],
    studios: [
      { 
        id: slug === 'demon-slayer' ? 2 : (slug === 'attack-on-titan' ? 5 : 4), 
        name: slug === 'demon-slayer' ? 'Ufotable' : (slug === 'attack-on-titan' ? 'Wit Studio' : 'Madhouse'), 
        description: null 
      }
    ],
    episodes: Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      anime_id: slug === 'demon-slayer' ? 1 : (slug === 'attack-on-titan' ? 2 : 3),
      number: i + 1,
      title: `Episode ${i + 1}`,
      description: null,
      duration: 24,
      thumbnail: null,
      release_date: '2019-04-06'
    })),
    user_data: {
      is_favorite: false,
      rating: null
    }
  });
});

app.get('/api/anime/:slug/episode/:number', (req, res) => {
  const { slug, number } = req.params;
  const episodeNumber = parseInt(number);
  
  res.json({
    anime: {
      id: slug === 'demon-slayer' ? 1 : (slug === 'attack-on-titan' ? 2 : 3),
      title: slug === 'demon-slayer' ? 'Demon Slayer' : 
             (slug === 'attack-on-titan' ? 'Attack on Titan' : 'My Hero Academia'),
      slug
    },
    episode: {
      id: episodeNumber,
      anime_id: slug === 'demon-slayer' ? 1 : (slug === 'attack-on-titan' ? 2 : 3),
      number: episodeNumber,
      title: `Episode ${episodeNumber}`,
      description: 'Test episode description.',
      duration: 24,
      thumbnail: null,
      release_date: '2019-04-06'
    },
    video_sources: [
      {
        id: 1,
        episode_id: episodeNumber,
        quality: '1080p',
        type: 'sub',
        language: 'jp',
        source_url: 'https://example.com/video.mp4',
        source_type: 'video'
      },
      {
        id: 2,
        episode_id: episodeNumber,
        quality: '720p',
        type: 'sub',
        language: 'jp',
        source_url: 'https://example.com/video-720.mp4',
        source_type: 'video'
      },
      {
        id: 3,
        episode_id: episodeNumber,
        quality: '1080p',
        type: 'dub',
        language: 'en',
        source_url: 'https://example.com/video-en.mp4',
        source_type: 'video'
      }
    ],
    comments: [
      {
        id: 1,
        user_id: 2,
        episode_id: episodeNumber,
        text: 'This episode was great!',
        created_at: '2025-01-15T12:00:00.000Z',
        username: 'user1',
        avatar: null
      },
      {
        id: 2,
        user_id: 3,
        episode_id: episodeNumber,
        text: 'I loved the action scenes.',
        created_at: '2025-01-16T14:30:00.000Z',
        username: 'user2',
        avatar: null
      }
    ],
    navigation: {
      previous: episodeNumber > 1 ? {
        id: episodeNumber - 1,
        number: episodeNumber - 1,
        title: `Episode ${episodeNumber - 1}`
      } : null,
      next: {
        id: episodeNumber + 1,
        number: episodeNumber + 1,
        title: `Episode ${episodeNumber + 1}`
      }
    },
    user_data: {
      watch_progress: null
    }
  });
});

// Аутентификация
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: 4,
      username,
      email,
      avatar: null,
      is_admin: false
    },
    token: 'demo_token_for_testing_123'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  res.json({
    message: 'Login successful',
    user: {
      id: 4,
      username: 'testuser',
      email,
      avatar: null,
      is_admin: false
    },
    token: 'demo_token_for_testing_123'
  });
});

app.get('/api/auth/me', (req, res) => {
  // В реальном приложении, вы должны проверить токен аутентификации здесь
  res.json({
    user: {
      id: 4,
      username: 'testuser',
      email: 'test@example.com',
      avatar: null,
      is_admin: false
    }
  });
});

// Функциональные маршруты
app.post('/api/anime/watch-progress', (req, res) => {
  res.json({ message: 'Progress saved successfully' });
});

app.post('/api/anime/favorite', (req, res) => {
  const { action } = req.body;
  res.json({ 
    message: action === 'add' ? 'Added to favorites' : 'Removed from favorites', 
    success: true 
  });
});

app.post('/api/anime/rate', (req, res) => {
  res.json({ 
    message: 'Rating saved successfully', 
    new_rating: 8.5
  });
});

app.post('/api/anime/comment', (req, res) => {
  const { text } = req.body;
  
  res.status(201).json({ 
    message: 'Comment added successfully',
    comment: {
      id: 3,
      user_id: 4,
      episode_id: 1,
      text,
      created_at: new Date().toISOString(),
      username: 'testuser',
      avatar: null
    }
  });
});

// Пользовательские маршруты
app.get('/api/users/watched', (req, res) => {
  res.json({
    animes: [
      {
        id: 1,
        title: 'Demon Slayer',
        slug: 'demon-slayer',
        description: 'A boy becomes a demon slayer after his family is slaughtered and his sister is turned into a demon.',
        rating: 8.9,
        poster: null,
        last_watched: '2025-05-18T00:00:00.000Z'
      }
    ]
  });
});

app.get('/api/users/favorites', (req, res) => {
  res.json({
    animes: [
      {
        id: 2,
        title: 'Attack on Titan',
        slug: 'attack-on-titan',
        description: 'Humans fight against giant humanoid creatures called Titans.',
        rating: 9.0,
        poster: null,
        added_at: '2025-05-17T00:00:00.000Z'
      }
    ]
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Backend API running at http://localhost:${port}`);
});