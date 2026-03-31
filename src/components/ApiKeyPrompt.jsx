import { useState } from 'react';
import { setApiKey } from '../lib/tmdb';

export default function ApiKeyPrompt({ onKeySet }) {
  const [key, setKey] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = key.trim();
    if (trimmed) {
      setApiKey(trimmed);
      onKeySet(trimmed);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎬</div>
          <h1 className="text-2xl font-bold text-white mb-2">StreamFinder</h1>
          <p className="text-gray-400 text-sm">
            Find free, legal streaming for any movie or show
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              TMDB API Key
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter your TMDB API key..."
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Get Started
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Get a free API key at{' '}
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300"
          >
            themoviedb.org
          </a>
          {' '}&mdash; it&apos;s instant and free.
        </p>
      </div>
    </div>
  );
}
