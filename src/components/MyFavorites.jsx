import { useState, useEffect } from 'react';
import { searchMulti, posterUrl } from '../lib/tmdb';
import { getFavorites, addFavorite, removeFavorite, subscribe } from '../lib/favorites';

export default function MyFavorites() {
  const [favorites, setFavorites] = useState(getFavorites());
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    return subscribe(setFavorites);
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await searchMulti(query.trim());
      setSearchResults(results.slice(0, 8));
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }

  function handleAdd(item) {
    addFavorite(item);
    setSearchResults([]);
    setQuery('');
  }

  const genreSummary = () => {
    if (favorites.length === 0) return null;
    const counts = {};
    const GENRE_NAMES = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
      10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
      10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
    };
    for (const fav of favorites) {
      for (const gid of fav.genre_ids) {
        counts[gid] = (counts[gid] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => GENRE_NAMES[id] || `#${id}`)
      .join(', ');
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-400 text-sm mb-4">
          Add shows and movies you love. The more you add, the better your recommendations get.
        </p>

        {/* Add search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search to add a favorite..."
            className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {searching ? '...' : 'Find'}
          </button>
        </form>

        {/* Search results to add */}
        {searchResults.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 mb-6 space-y-2">
            <p className="text-xs text-gray-500 mb-2">Click to add:</p>
            {searchResults.map((item) => {
              const title = item.title || item.name;
              const year = (item.release_date || item.first_air_date || '').slice(0, 4);
              const alreadyAdded = favorites.some(
                f => f.id === item.id && f.media_type === item.media_type
              );
              return (
                <button
                  key={`${item.media_type}-${item.id}`}
                  onClick={() => !alreadyAdded && handleAdd(item)}
                  disabled={alreadyAdded}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    alreadyAdded
                      ? 'opacity-50 cursor-default'
                      : 'hover:bg-gray-800 cursor-pointer'
                  }`}
                >
                  {item.poster_path ? (
                    <img src={posterUrl(item.poster_path, 'w92')} alt="" className="w-10 h-14 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-lg">🎬</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{title}</p>
                    <p className="text-gray-500 text-xs">
                      {item.media_type === 'tv' ? 'TV' : 'Movie'}{year ? ` · ${year}` : ''}
                    </p>
                  </div>
                  {alreadyAdded ? (
                    <span className="text-green-400 text-xs">Added</span>
                  ) : (
                    <span className="text-purple-400 text-xl">+</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Genre profile */}
      {favorites.length > 0 && (
        <div className="mb-6 p-4 bg-purple-900/20 border border-purple-800/30 rounded-xl">
          <p className="text-sm text-purple-300">
            <span className="font-semibold">Your taste profile:</span>{' '}
            <span className="text-purple-200">{genreSummary()}</span>
          </p>
          <p className="text-xs text-purple-400/60 mt-1">
            Based on {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Favorites list */}
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">No favorites yet</p>
          <p className="text-gray-600 text-sm">Search above to start adding shows you love</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favorites.map((fav) => (
            <div key={`${fav.media_type}-${fav.id}`} className="group relative">
              {fav.poster_path ? (
                <img
                  src={posterUrl(fav.poster_path)}
                  alt={fav.title}
                  className="w-full rounded-xl shadow-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 rounded-xl flex items-center justify-center text-gray-600 text-3xl">
                  🎬
                </div>
              )}
              <button
                onClick={() => removeFavorite(fav.id, fav.media_type)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                ✕
              </button>
              <p className="mt-2 text-sm text-white font-medium truncate">{fav.title}</p>
              <p className="text-xs text-gray-500">
                {fav.media_type === 'tv' ? 'TV' : 'Movie'}
                {fav.release_date ? ` · ${fav.release_date.slice(0, 4)}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
