"use client";
import { useEffect } from 'react';

export default function SignOutPage() {
  useEffect(() => {
    // Clear user session
    localStorage.removeItem('gaply_user');

    // Redirect to home page
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 17l4-4m0 0l-4-4m4 4H3"></path>
          </svg>
        </div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          You've been signed out
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          You have successfully signed out of your GAPLY account.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring-offset-2"
        >
          Sign in again
        </a>
      </div>
    </div>
  );
}