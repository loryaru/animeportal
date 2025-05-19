- Создание таблиц для аниме-сайта

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица жанров
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Таблица аниме
CREATE TABLE animes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    release_year SMALLINT,
    status VARCHAR(20) CHECK (status IN ('ongoing', 'completed', 'announced')),
    type VARCHAR(20) CHECK (type IN ('tv', 'movie', 'ova', 'ona', 'special')),
    episodes_count INT,
    poster VARCHAR(255),
    rating DECIMAL(3, 1) DEFAULT 0.0,
    views INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Связь аниме и жанров (многие ко многим)
CREATE TABLE anime_genres (
    anime_id INT REFERENCES animes(id) ON DELETE CASCADE,
    genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (anime_id, genre_id)
);

-- Таблица для студий производства аниме
CREATE TABLE studios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Связь аниме и студий (многие ко многим)
CREATE TABLE anime_studios (
    anime_id INT REFERENCES animes(id) ON DELETE CASCADE,
    studio_id INT REFERENCES studios(id) ON DELETE CASCADE,
    PRIMARY KEY (anime_id, studio_id)
);

-- Таблица серий
CREATE TABLE episodes (
    id SERIAL PRIMARY KEY,
    anime_id INT NOT NULL REFERENCES animes(id) ON DELETE CASCADE,
    number SMALLINT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    duration SMALLINT, -- в минутах
    thumbnail VARCHAR(255),
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (anime_id, number)
);

-- Таблица источников видео (разные озвучки и качество)
CREATE TABLE video_sources (
    id SERIAL PRIMARY KEY,
    episode_id INT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    quality VARCHAR(10) CHECK (quality IN ('240p', '360p', '480p', '720p', '1080p', '4k')),
    type VARCHAR(20) CHECK (type IN ('sub', 'dub')),
    language VARCHAR(10) NOT NULL, -- код языка (ru, en, jp и т.д.)
    source_url VARCHAR(255) NOT NULL,
    source_type VARCHAR(20) CHECK (source_type IN ('video', 'iframe', 'm3u8')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица комментариев
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    anime_id INT REFERENCES animes(id) ON DELETE CASCADE,
    episode_id INT REFERENCES episodes(id) ON DELETE CASCADE,
    parent_id INT REFERENCES comments(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK ((anime_id IS NOT NULL AND episode_id IS NULL) OR (anime_id IS NULL AND episode_id IS NOT NULL))
);

-- Таблица для просмотренных серий пользователями
CREATE TABLE watched_episodes (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    episode_id INT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    watch_progress INT DEFAULT 0, -- прогресс просмотра в секундах
    PRIMARY KEY (user_id, episode_id)
);

-- Таблица для списка избранного
CREATE TABLE favorites (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    anime_id INT NOT NULL REFERENCES animes(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, anime_id)
);

-- Таблица для оценок аниме пользователями
CREATE TABLE ratings (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    anime_id INT NOT NULL REFERENCES animes(id) ON DELETE CASCADE,
    score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, anime_id)
);

-- Добавление тестовых данных

-- Жанры
INSERT INTO genres (name, description) VALUES
    ('Action', 'Anime with lots of fighting, chasing and explosions'),
    ('Adventure', 'Exploring new places and situations'),
    ('Comedy', 'Anime focused on humor'),
    ('Drama', 'Emotional stories with conflict'),
    ('Fantasy', 'Magic and supernatural elements'),
    ('Sci-Fi', 'Science fiction with futuristic technology'),
    ('Slice of Life', 'Daily life experiences'),
    ('Romance', 'Love stories and relationships');

-- Студии
INSERT INTO studios (name) VALUES
    ('MAPPA'),
    ('Ufotable'),
    ('Kyoto Animation'),
    ('Madhouse'),
    ('Wit Studio');

-- Тестовые пользователи (пароль 'password' захеширован для bcrypt)
INSERT INTO users (username, email, password, is_admin) VALUES
    ('admin', 'admin@example.com', '$2b$10$rM5.NJJFqzrGhGP7yvyf4eDqmvFEHBtVf5hHQ0.v25CwlmpBW9KyG', true),
    ('user1', 'user1@example.com', '$2b$10$rM5.NJJFqzrGhGP7yvyf4eDqmvFEHBtVf5hHQ0.v25CwlmpBW9KyG', false),
    ('user2', 'user2@example.com', '$2b$10$rM5.NJJFqzrGhGP7yvyf4eDqmvFEHBtVf5hHQ0.v25CwlmpBW9KyG', false);

-- Тестовые аниме
INSERT INTO animes (title, original_title, slug, description, release_year, status, type, episodes_count, rating) VALUES
    ('Demon Slayer', '鬼滅の刃', 'demon-slayer', 'A boy becomes a demon slayer after his family is slaughtered and his sister is turned into a demon.', 2019, 'completed', 'tv', 26, 8.9),
    ('Attack on Titan', '進撃の巨人', 'attack-on-titan', 'Humans fight against giant humanoid creatures called Titans.', 2013, 'completed', 'tv', 75, 9.0),
    ('My Hero Academia', '僕のヒーローアカデミア', 'my-hero-academia', 'A boy born without superpowers in a world where they are common has dreams of becoming a hero.', 2016, 'ongoing', 'tv', 113, 8.4);

-- Связи аниме и жанров
INSERT INTO anime_genres (anime_id, genre_id) VALUES
    (1, 1), (1, 2), (1, 4), (1, 5), -- Demon Slayer
    (2, 1), (2, 2), (2, 4), (2, 6), -- Attack on Titan
    (3, 1), (3, 2), (3, 3), (3, 4); -- My Hero Academia

-- Связи аниме и студий
INSERT INTO anime_studios (anime_id, studio_id) VALUES
    (1, 2), -- Demon Slayer - Ufotable
    (2, 5), -- Attack on Titan - Wit Studio
    (3, 4); -- My Hero Academia - Madhouse

-- Тестовые серии
INSERT INTO episodes (anime_id, number, title, duration, release_date) VALUES
    (1, 1, 'Cruelty', 24, '2019-04-06'),
    (1, 2, 'Trainer Sakonji Urokodaki', 24, '2019-04-13'),
    (1, 3, 'Sabito and Makomo', 24, '2019-04-20'),
    (2, 1, 'To You, 2000 Years From Now', 24, '2013-04-07'),
    (2, 2, 'That Day', 24, '2013-04-14'),
    (2, 3, 'A Dim Light Amid Despair', 24, '2013-04-21'),
    (3, 1, 'Izuku Midoriya: Origin', 24, '2016-04-03'),
    (3, 2, 'What It Takes to Be a Hero', 24, '2016-04-10'),
    (3, 3, 'Roaring Muscles', 24, '2016-04-17');

-- Источники видео
INSERT INTO video_sources (episode_id, quality, type, language, source_url, source_type) VALUES
    (1, '1080p', 'sub', 'jp', '/uploads/videos/demon-slayer-1-jp-1080p.mp4', 'video'),
    (1, '720p', 'sub', 'jp', '/uploads/videos/demon-slayer-1-jp-720p.mp4', 'video'),
    (1, '1080p', 'dub', 'en', '/uploads/videos/demon-slayer-1-en-1080p.mp4', 'video'),
    (2, '1080p', 'sub', 'jp', '/uploads/videos/demon-slayer-2-jp-1080p.mp4', 'video'),
    (2, '720p', 'sub', 'jp', '/uploads/videos/demon-slayer-2-jp-720p.mp4', 'video'),
    (4, '1080p', 'sub', 'jp', '/uploads/videos/attack-on-titan-1-jp-1080p.mp4', 'video'),
    (4, '720p', 'sub', 'jp', '/uploads/videos/attack-on-titan-1-jp-720p.mp4', 'video'),
    (7, '1080p', 'sub', 'jp', '/uploads/videos/my-hero-academia-1-jp-1080p.mp4', 'video');

-- Тестовые комментарии
INSERT INTO comments (user_id, anime_id, episode_id, text) VALUES
    (2, 1, NULL, 'Demon Slayer is one of the best anime I''ve ever watched!'),
    (3, 1, NULL, 'The animation quality is amazing!'),
    (2, NULL, 1, 'This first episode hooked me right away.'),
    (3, NULL, 1, 'That ending was so emotional...');

-- Тестовые данные об избранном
INSERT INTO favorites (user_id, anime_id) VALUES
    (2, 1),
    (2, 2),
    (3, 1);

-- Тестовые данные о просмотренных сериях
INSERT INTO watched_episodes (user_id, episode_id, watch_progress) VALUES
    (2, 1, 1440), -- Полностью просмотрено (24 минуты)
    (2, 2, 1200), -- Частично просмотрено (20 минут из 24)
    (3, 1, 1440);

-- Тестовые оценки
INSERT INTO ratings (user_id, anime_id, score) VALUES
    (2, 1, 10),
    (3, 1, 9),
    (2, 2, 10);

-- Обновление средних рейтингов аниме
UPDATE animes 
SET rating = (
    SELECT ROUND(AVG(score)::numeric, 1) 
    FROM ratings 
    WHERE ratings.anime_id = animes.id
)
WHERE id IN (
    SELECT DISTINCT anime_id 
    FROM ratings
);

-- Создание индексов для ускорения запросов
CREATE INDEX idx_animes_slug ON animes(slug);
CREATE INDEX idx_episodes_anime_id_number ON episodes(anime_id, number);
CREATE INDEX idx_video_sources_episode_id ON video_sources(episode_id);
CREATE INDEX idx_comments_anime_id ON comments(anime_id);
CREATE INDEX idx_comments_episode_id ON comments(episode_id);
CREATE INDEX idx_watched_episodes_user_id ON watched_episodes(user_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);