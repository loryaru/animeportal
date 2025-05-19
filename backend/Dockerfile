FROM node:18-alpine

WORKDIR /app

# Инициализация пакета
RUN npm init -y && npm install express cors

# Копирование исходного кода
COPY index.js .

# Экспозиция порта
EXPOSE 5001

# Запуск сервера
CMD ["node", "index.js"]