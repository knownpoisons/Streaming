import { useState } from 'react';
import { searchMulti, getWatchProviders, extractFreeProviders, posterUrl, providerLogoUrl } from '../lib/tmdb';
import MediaCard from './MediaCard';

export default function Search({ country }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const items = await searchMulti(query.trim());

      // Fetch free providers for each result
      const enriched = await Promise.all(
        items.slice(0, 12).map(async (item) => {
          const mediaType = item.media_type;
          try {
            const providers = await getWatchProviders(mediaType, item.id);
            const freeProviders = extractFreeProviders(providers, country);
            return { ...item, freeProviders };
          } catch {
            return { ...item, freeProviders: [] };
          }
        })
      );

      setResults(enriched);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie or TV show..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-3 border-gray-600 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-400 mt-3">Finding free streams...</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No results found. Try a different search.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((item) => (
            <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
