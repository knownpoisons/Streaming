import { useState, useEffect } from 'react';
import { getGenres, discoverByGenre, getWatchProviders, extractFreeProviders, getTrending } from '../lib/tmdb';
import MediaCard from './MediaCard';

const MOODS = [
  { label: 'Chill', icon: '😌', movieGenres: [35, 10749], tvGenres: [35, 10749] },
  { label: 'Thrilling', icon: '😱', movieGenres: [53, 27], tvGenres: [80, 9648] },
  { label: 'Adventurous', icon: '🗺️', movieGenres: [12, 878], tvGenres: [10759, 10765] },
  { label: 'Thoughtful', icon: '🤔', movieGenres: [18, 99], tvGenres: [18, 99] },
  { label: 'Fun', icon: '🎉', movieGenres: [16, 35, 10751], tvGenres: [16, 35, 10751] },
  { label: 'Inspiring', icon: '✨', movieGenres: [18, 36], tvGenres: [18, 10768] },
];

const TIME_OPTIONS = [
  { label: 'Short (< 1.5 hrs)', maxRuntime: 90, type: 'movie' },
  { label: 'Movie Night (~2 hrs)', maxRuntime: 150, type: 'movie' },
  { label: 'TV Episode (~45 min)', maxRuntime: null, type: 'tv' },
  { label: 'Binge Session', maxRuntime: null, type: 'tv' },
];

export default function Recommendations({ country }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // Load trending on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getTrending('all', 'week');
        const items = data.results
          .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
          .slice(0, 6);

        const enriched = await Promise.all(
          items.map(async (item) => {
            try {
              const providers = await getWatchProviders(item.media_type, item.id);
              return { ...item, freeProviders: extractFreeProviders(providers, country) };
            } catch {
              return { ...item, freeProviders: [] };
            }
          })
        );
        setTrending(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setTrendingLoading(false);
      }
    })();
  }, [country]);

  async function getRecommendations() {
    if (selectedMood === null || selectedTime === null) return;
    setLoading(true);

    const mood = MOODS[selectedMood];
    const time = TIME_OPTIONS[selectedTime];
    const mediaType = time.type;
    const genreIds = mediaType === 'movie' ? mood.movieGenres : mood.tvGenres;

    try {
      const data = await discoverByGenre(mediaType, genreIds.join(','));
      const items = data.results.slice(0, 12).map(r => ({ ...r, media_type: mediaType }));

      const enriched = await Promise.all(
        items.map(async (item) => {
          try {
            const providers = await getWatchProviders(mediaType, item.id);
            return { ...item, freeProviders: extractFreeProviders(providers, country) };
          } catch {
            return { ...item, freeProviders: [] };
          }
        })
      );

      // Sort: items with free providers first
      enriched.sort((a, b) => b.freeProviders.length - a.freeProviders.length);
      setResults(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Mood selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">What's your mood?</h3>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood, i) => (
            <button
              key={mood.label}
              onClick={() => setSelectedMood(i)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                selectedMood === i
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              {mood.icon} {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">How much time do you have?</h3>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => setSelectedTime(i)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                selectedTime === i
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Get recommendations button */}
      <button
        onClick={getRecommendations}
        disabled={selectedMood === null || selectedTime === null || loading}
        className="mb-8 px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Finding picks...
          </span>
        ) : (
          'Get Recommendations'
        )}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">
            Your Picks
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((item) => (
              <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Trending section */}
      {results.length === 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-100 mb-4">
            Trending This Week
          </h3>
          {trendingLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-3 border-gray-600 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {trending.map((item) => (
                <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
