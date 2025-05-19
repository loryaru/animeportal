import dotenv from 'dotenv';
import { Pool } from 'pg';

// Загрузка переменных окружения
dotenv.config();

// Конфигурация подключения к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Проверка подключения
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch((err) => console.error('Database connection error:', err.stack));

export default pool;