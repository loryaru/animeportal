import express from 'express';
import AuthController from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Публичные маршруты
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Маршруты, требующие аутентификации
router.get('/me', authMiddleware, AuthController.getCurrentUser);
router.get('/verify', authMiddleware, AuthController.verifyToken);

export default router;