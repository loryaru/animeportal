import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, sanitizeUser } from '../models/User';

// Расширение интерфейса Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: number;
    }
  }
}

// Middleware для проверки JWT токена
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Проверка наличия токена в заголовке
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Получение токена из заголовка
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }
    
    // Проверка токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
    
    // Проверка пользователя в базе данных
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Добавление пользователя к запросу
    req.user = sanitizeUser(user);
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware для проверки прав администратора
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Middleware для опциональной аутентификации
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Проверка наличия токена в заголовке
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Продолжаем без аутентификации
    }
    
    // Получение токена из заголовка
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(); // Продолжаем без аутентификации
    }
    
    // Проверка токена
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
      
      // Проверка пользователя в базе данных
      const user = await UserModel.findById(decoded.userId);
      
      if (user) {
        // Добавление пользователя к запросу
        req.user = sanitizeUser(user);
        req.userId = user.id;
      }
    } catch (tokenError) {
      // Если токен недействителен, продолжаем без аутентификации
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Продолжаем без аутентификации в случае ошибки
  }
};