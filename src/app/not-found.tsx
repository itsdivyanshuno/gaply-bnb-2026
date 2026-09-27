'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // Redirect to home after a brief message
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
      <div className="text-center space-y-6">
        <div className="flex-shrink-0">
          <svg className="h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring-offset-2"
          >
            Return to Homepage
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          You'll be redirected automatically in 3 seconds...
        </p>
      </div>
    </div>
  );
}