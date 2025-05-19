import express from 'express';
import AnimeController from '../controllers/animeController';
import { authMiddleware, optionalAuthMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// Публичные маршруты (не требуют авторизации)
router.get('/list', AnimeController.getAnimeList);
router.get('/popular', AnimeController.getPopularAnime);
router.get('/latest', AnimeController.getLatestAnime);

// Маршруты, которые могут использовать авторизацию (опционально)
router.get('/:slug', optionalAuthMiddleware, AnimeController.getAnimeDetails);
router.get('/:slug/episode/:number', optionalAuthMiddleware, AnimeController.getEpisode);

// Маршруты, требующие аутентификации
router.post('/watch-progress', authMiddleware, AnimeController.saveWatchProgress);
router.post('/favorite', authMiddleware, AnimeController.toggleFavorite);
router.post('/rate', authMiddleware, AnimeController.rateAnime);
router.post('/comment', authMiddleware, AnimeController.addComment);

export default router;