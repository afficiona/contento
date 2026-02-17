'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store token with correct key
      localStorage.setItem('manch_token', token);

      // Decode JWT to get user info (basic decode, no verification needed since it came from our backend)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('manch_user', JSON.stringify({
          id: payload.userId,
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          picture: payload.picture
        }));
      } catch (e) {
        console.error('Failed to decode token:', e);
      }

      // Check if there's an OAuth return URL
      const returnUrl = localStorage.getItem('oauth_return_url');
      if (returnUrl) {
        localStorage.removeItem('oauth_return_url');
        window.location.href = returnUrl;
      } else {
        router.push('/feed');
      }
    } else {
      // No token, redirect to login
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <div className="inline-block p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
          <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Completing sign in...</h2>
        <p className="mt-2 text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}
