FROM node:18-alpine

WORKDIR /app

# Установка зависимостей
COPY package.json ./
RUN npm install

# Копирование исходного кода
COPY . .

# Экспозиция порта
EXPOSE 3000

# Запуск в development режиме для горячей перезагрузки
CMD ["npm", "run", "dev"]