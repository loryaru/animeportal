#!/bin/bash

# Имя проекта
PROJECT_NAME="anime-site"

# Docker и конфигурация
touch docker-compose.yml
touch .env.example

# Структура для Nginx
mkdir -p nginx/conf.d
touch nginx/Dockerfile
touch nginx/conf.d/default.conf

# Структура для Frontend
mkdir -p frontend/src/{pages/{anime,auth},components/{layout,ui,anime,auth},services,styles,hooks,types,utils}
touch frontend/Dockerfile
touch frontend/package.json
touch frontend/next.config.js
touch frontend/tsconfig.json
touch frontend/tailwind.config.js
touch frontend/postcss.config.js

# Создаем основные страницы
touch frontend/src/pages/index.tsx
touch frontend/src/pages/catalog.tsx
touch frontend/src/pages/anime/\[id\].tsx
touch frontend/src/pages/anime/\[id\]/\[episode\].tsx
touch frontend/src/pages/auth/login.tsx
touch frontend/src/pages/404.tsx

# Создаем основные компоненты
touch frontend/src/components/layout/Header.tsx
touch frontend/src/components/layout/Footer.tsx
touch frontend/src/components/layout/Layout.tsx
touch frontend/src/components/ui/Button.tsx
touch frontend/src/components/anime/AnimeCard.tsx
touch frontend/src/components/anime/VideoPlayer.tsx

# Создаем сервисы и стили
touch frontend/src/services/api.ts
touch frontend/src/styles/globals.css

# Структура для Backend
mkdir -p backend/src/{config,controllers,middleware,models,routes,services,utils}
touch backend/Dockerfile
touch backend/package.json
touch backend/tsconfig.json
touch backend/src/index.ts
touch backend/src/app.ts
touch backend/src/config/database.ts

# Контроллеры
touch backend/src/controllers/animeController.ts
touch backend/src/controllers/authController.ts
touch backend/src/controllers/episodeController.ts

# Middleware
touch backend/src/middleware/auth.ts

# Модели
touch backend/src/models/Anime.ts
touch backend/src/models/Episode.ts
touch backend/src/models/User.ts

# Маршруты
touch backend/src/routes/animeRoutes.ts
touch backend/src/routes/authRoutes.ts
touch backend/src/routes/userRoutes.ts

# Сервисы
touch backend/src/services/animeService.ts

# Структура для PostgreSQL
mkdir -p postgres/init
touch postgres/init/01-init.sql

echo "Структура проекта $PROJECT_NAME создана успешно!"
ls -la

# Сводка
echo ""
echo "Создано файлов:"
find . -type f | wc -l

# Показываем структуру
echo ""
echo "Структура проекта:"
find . -type f | sort