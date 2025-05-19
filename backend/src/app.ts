import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

// Импорт маршрутов
import animeRoutes from './routes/animeRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

// Инициализация Express приложения
const app = express();

// Middleware
app.use(helmet()); // Защита заголовков
app.use(compression()); // Сжатие ответов
app.use(cors()); // CORS для кросс-доменных запросов
app.use(express.json()); // Парсинг JSON тела запроса
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded тела
app.use(morgan('dev')); // Логирование запросов

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Маршруты API
app.use('/api/anime', animeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Обработка ошибок 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Глобальный обработчик ошибок
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;