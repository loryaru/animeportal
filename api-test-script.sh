#!/bin/bash

# Установка базового URL
BASE_URL="http://localhost:5001/api"
TOKEN=""

# Функция для вывода результатов запроса
show_response() {
  echo "Status: $1"
  echo "Response:"
  echo "$2" | jq '.'
  echo "-----------------------------------------"
}

# 1. Тестирование регистрации
echo "Testing Registration..."
RESP=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }')
HTTP_CODE=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
show_response $HTTP_CODE "$BODY"

# Извлечение токена для дальнейших запросов
if [ "$HTTP_CODE" == "201" ]; then
  TOKEN=$(echo $BODY | jq -r '.token')
  echo "Token received: $TOKEN"
fi

# 2. Тестирование входа
echo "Testing Login..."
RESP=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
HTTP_CODE=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
show_response $HTTP_CODE "$BODY"

# Обновление токена, если первый запрос не удался
if [ "$TOKEN" == "" ] && [ "$HTTP_CODE" == "200" ]; then
  TOKEN=$(echo $BODY | jq -r '.token')
  echo "Token received: $TOKEN"
fi

# 3. Получение информации о текущем пользователе
echo "Testing Get Current User..."
RESP=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
show_response $HTTP_CODE "$BODY"

# 4. Получение списка аниме
echo "Testing Get Anime List..."
RESP=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/anime/list")
HTTP_CODE=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
show_response $HTTP_CODE "$BODY"

# 5. Получение популярных аниме
echo "Testing Get Popular Anime..."
RESP=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/anime/popular")
HTTP_CODE=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
show_response $HTTP_CODE "$BODY"

# 6. Получение подробной информации об аниме (первый элемент из списка)
echo "Testing Get Anime Details..."
ANIME_SLUG="demon-slayer"  # предполагается, что такой аниме существует в БД
RESP=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/anime/$ANIME_SLUG" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
show_response $HTTP_CODE "$BODY"

# 7. Добавление в избранное
echo "Testing Add to Favorites..."
ANIME_ID=1  # ID для аниме Demon Slayer в тестовой БД
RESP=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/anime/favorite" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"animeId\": $ANIME_ID,
    \"action\": \"add\"
  }")
HTTP_CODE=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
show_response $HTTP_CODE "$BODY"

# 8. Получение списка избранных аниме
echo "Testing Get Favorites..."
RESP=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/users/favorites" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
show_response $HTTP_CODE "$BODY"

# 9. Получение эпизода
echo "Testing Get Episode..."
ANIME_SLUG="demon-slayer"
EPISODE_NUMBER=1
RESP=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/anime/$ANIME_SLUG/episode/$EPISODE_NUMBER" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
show_response $HTTP_CODE "$BODY"

echo "API Testing Completed"