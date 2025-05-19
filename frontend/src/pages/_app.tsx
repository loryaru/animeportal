
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { authApi } from '../services/api';

function MyApp({ Component, pageProps }: AppProps) {
  // Проверка токена при инициализации приложения
  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (authApi.isAuthenticated()) {
          await authApi.verifyToken();
        }
      } catch (error) {
        console.error('Invalid token, user logged out');
        // Если токен недействителен, он будет удален в методе verifyToken
      }
    };

    verifyToken();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;