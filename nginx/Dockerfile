FROM nginx:1.23-alpine

# Удаление стандартной конфигурации Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копирование нашей конфигурации
COPY conf.d/default.conf /etc/nginx/conf.d/

# Экспозиция порта
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]