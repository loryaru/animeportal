import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, sanitizeUser } from '../models/User';

// Интерфейс для запроса регистрации
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Интерфейс для запроса входа
interface LoginRequest {
  email: string;
  password: string;
}

// Контроллер для аутентификации
export default class AuthController {
  // Регистрация нового пользователя
  static async register(req: Request<{}, {}, RegisterRequest>, res: Response) {
    try {
      const { username, email, password } = req.body;
      
      // Проверка наличия всех необходимых полей
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Проверка, не существует ли уже пользователь с таким email
      const existingUserByEmail = await UserModel.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Проверка, не существует ли уже пользователь с таким username
      const existingUserByUsername = await UserModel.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Создание нового пользователя
      const user = await UserModel.create({
        username,
        email,
        password,
      });
      
      // Создание JWT токена
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      // Возвращаем данные пользователя (без пароля) и токен
      res.status(201).json({
        message: 'User registered successfully',
        user: sanitizeUser(user),
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Вход пользователя
  static async login(req: Request<{}, {}, LoginRequest>, res: Response) {
    try {
      const { email, password } = req.body;
      
      // Проверка наличия всех необходимых полей
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Поиск пользователя по email
      const user = await UserModel.findByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Проверка пароля
      const isPasswordValid = await UserModel.verifyPassword(user, password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Создание JWT токена
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      // Возвращаем данные пользователя (без пароля) и токен
      res.json({
        message: 'Login successful',
        user: sanitizeUser(user),
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Получение данных текущего пользователя
  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const user = await UserModel.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        user: sanitizeUser(user)
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Проверка валидности токена
  static async verifyToken(req: Request, res: Response) {
    try {
      // Если запрос дошел до этого метода, значит middleware уже проверил токен
      res.json({
        valid: true,
        user: req.user
      });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}