import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { UserModel, sanitizeUser } from '../models/User';

const router = express.Router();

// Получить профиль пользователя
router.get('/profile/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Возвращаем безопасную версию пользователя (без пароля)
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Получить список просмотренных аниме
router.get('/watched', authMiddleware, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const animes = await UserModel.getWatchedAnime(req.userId);
    res.json({ animes });
  } catch (error) {
    console.error('Error getting watched anime:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Получить список избранных аниме
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const animes = await UserModel.getFavorites(req.userId);
    res.json({ animes });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Обновить профиль пользователя
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { username, email, password, avatar } = req.body;
    
    // Создаем объект с данными для обновления
    const updateData: any = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (avatar) updateData.avatar = avatar;
    
    // Проверяем, если пользователь пытается изменить username или email
    if (username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser && existingUser.id !== req.userId) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== req.userId) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Обновляем данные пользователя
    const updatedUser = await UserModel.update(req.userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;