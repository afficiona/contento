'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function OAuthAuthorizePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clientId = searchParams?.get('client_id');
  const redirectUri = searchParams?.get('redirect_uri');
  const state = searchParams?.get('state');
  const clientName = clientId === 'prasaran-client-id' ? 'Prasaran' : 'Unknown App';

  useEffect(() => {
    // Check if user is logged in to Manch
    const token = localStorage.getItem('manch_token');
    setIsAuthenticated(!!token);

    if (!token) {
      // Redirect to login, then come back here
      const currentUrl = window.location.href;
      localStorage.setItem('oauth_return_url', currentUrl);
      router.push('/login');
    }
  }, [router]);

  const handleApprove = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('manch_token');

      const response = await fetch('http://localhost:3000/api/oauth/authorize/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          state: state,
          user_token: token,
        }),
      });

      if (!response.ok) {
        throw new Error('Authorization failed');
      }

      const data = await response.json();

      // Redirect back to the client app with the authorization code
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const handleDeny = () => {
    // Redirect back with error
    if (redirectUri && state) {
      window.location.href = `${redirectUri}?error=access_denied&state=${state}`;
    } else {
      router.push('/feed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Authorize Application</h2>
          <p className="text-gray-600">
            <strong className="text-indigo-600">{clientName}</strong> wants to access your Manch account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">This will allow {clientName} to:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Access your profile information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Create posts on your behalf</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>View your posts</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authorizing...' : 'Authorize'}
          </button>

          <button
            onClick={handleDeny}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 transition duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>By authorizing, you agree to share your information with {clientName}</p>
        </div>
      </div>
    </div>
  );
}
