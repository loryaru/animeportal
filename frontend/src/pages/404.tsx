import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const NotFoundPage: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Head>
        <title>404 - Page Not Found | Anime Streaming Site</title>
        <meta name="description" content="The page you are looking for could not be found." />
      </Head>

      <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <Link href="/">
          <a className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors">
            Return to Home
          </a>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;