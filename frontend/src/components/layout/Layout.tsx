import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Anime Streaming Site',
  description = 'Watch your favorite anime online'
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Обработчик скролла для изменения стиля навигационной панели
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Выход из аккаунта
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };
  
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        {/* Навигационная панель */}
        <header className={`fixed top-0 left-0 right-0 z-10 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}>
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              {/* Логотип */}
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">AniStream</span>
              </Link>
              
              {/* Мобильное меню */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-gray-700 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16m-7 6h7"
                      />
                    )}
                  </svg>
                </button>
              </div>
              
              {/* Десктопное меню */}
              <nav className="hidden lg:flex items-center space-x-6">
                <Link
                  href="/catalog"
                  className={`text-base ${
                    router.pathname === '/catalog' 
                      ? 'text-primary-600 font-medium' 
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  Catalog
                </Link>
                <Link
                  href="/genres"
                  className={`text-base ${
                    router.pathname === '/genres' 
                      ? 'text-primary-600 font-medium' 
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  Genres
                </Link>
                <Link
                  href="/schedule"
                  className={`text-base ${
                    router.pathname === '/schedule' 
                      ? 'text-primary-600 font-medium' 
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  Release Schedule
                </Link>
                
                {isLoggedIn ? (
                  <div className="relative group">
                    <button className="flex items-center text-base text-gray-700 hover:text-primary-600 focus:outline-none">
                      <span>My Account</span>
                      <svg
                        className="h-5 w-5 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link 
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <Link 
                        href="/favorites"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Favorites
                      </Link>
                      <Link 
                        href="/history"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Watch History
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link 
                      href="/auth/login"
                      className="text-base text-gray-700 hover:text-primary-600"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/auth/register"
                      className="px-4 py-2 bg-primary-600 text-white text-base font-medium rounded-md hover:bg-primary-700"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
          
          {/* Мобильное меню (выпадающее) */}
          {isMenuOpen && (
            <div className="lg:hidden bg-white shadow-md">
              <div className="container mx-auto px-4 py-3">
                <nav className="flex flex-col space-y-3">
                  <Link 
                    href="/catalog"
                    className={`text-base ${
                      router.pathname === '/catalog' 
                        ? 'text-primary-600 font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    Catalog
                  </Link>
                  <Link 
                    href="/genres"
                    className={`text-base ${
                      router.pathname === '/genres' 
                        ? 'text-primary-600 font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    Genres
                  </Link>
                  <Link 
                    href="/schedule"
                    className={`text-base ${
                      router.pathname === '/schedule' 
                        ? 'text-primary-600 font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    Release Schedule
                  </Link>
                  
                  {isLoggedIn ? (
                    <>
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <Link 
                          href="/profile"
                          className="block text-base text-gray-700"
                        >
                          Profile
                        </Link>
                        <Link 
                          href="/favorites"
                          className="block text-base text-gray-700 mt-3"
                        >
                          My Favorites
                        </Link>
                        <Link 
                          href="/history"
                          className="block text-base text-gray-700 mt-3"
                        >
                          Watch History
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left text-base text-gray-700 mt-3"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="border-t border-gray-200 pt-3 mt-3 flex flex-col space-y-3">
                      <Link 
                        href="/auth/login"
                        className="text-base text-gray-700"
                      >
                        Login
                      </Link>
                      <Link 
                        href="/auth/register"
                        className="px-4 py-2 bg-primary-600 text-white text-base font-medium rounded-md inline-block text-center"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </nav>
              </div>
            </div>
          )}
        </header>
        
        {/* Основной контент */}
        <main className="flex-grow pt-16">
          {children}
        </main>
        
        {/* Футер */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">AniStream</h3>
                <p className="text-gray-400">
                  The best place to watch anime online. Subbed and dubbed, all in HD, and completely free.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/catalog"
                      className="text-gray-400 hover:text-white"
                    >
                      Catalog
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/genres"
                      className="text-gray-400 hover:text-white"
                    >
                      Genres
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/schedule"
                      className="text-gray-400 hover:text-white"
                    >
                      Schedule
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Account</h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/profile"
                      className="text-gray-400 hover:text-white"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/favorites"
                      className="text-gray-400 hover:text-white"
                    >
                      Favorites
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/history"
                      className="text-gray-400 hover:text-white"
                    >
                      History
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/terms"
                      className="text-gray-400 hover:text-white"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/privacy"
                      className="text-gray-400 hover:text-white"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dmca"
                      className="text-gray-400 hover:text-white"
                    >
                      DMCA
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-6">
              <p className="text-center text-gray-400">
                &copy; {new Date().getFullYear()} AniStream. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;