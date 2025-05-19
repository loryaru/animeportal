import dotenv from 'dotenv';
import app from './app';

// Загрузка переменных окружения
dotenv.config();

// Определение порта
const PORT = process.env.PORT || 5000;

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});