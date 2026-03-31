import { posterUrl, providerLogoUrl } from '../lib/tmdb';

export default function MediaCard({ item }) {
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const type = item.media_type === 'tv' ? 'TV' : 'Movie';
  const poster = posterUrl(item.poster_path);
  const overview = item.overview
    ? item.overview.length > 120
      ? item.overview.slice(0, 120) + '...'
      : item.overview
    : 'No description available.';

  const hasFree = item.freeProviders && item.freeProviders.length > 0;

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden hover:border-gray-600 transition-all group">
      <div className="flex gap-4 p-4">
        {/* Poster */}
        <div className="w-24 shrink-0">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-full rounded-lg shadow-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-3xl">
              🎬
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white text-base leading-tight truncate">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-2 text-xs">
            <span className="px-2 py-0.5 bg-gray-700 rounded-md text-gray-300">{type}</span>
            {year && <span className="text-gray-500">{year}</span>}
            {rating && (
              <span className="text-yellow-400 flex items-center gap-0.5">
                ★ {rating}
              </span>
            )}
          </div>

          <p className="text-gray-400 text-xs leading-relaxed mb-3">{overview}</p>

          {/* Free providers */}
          {hasFree ? (
            <div>
              <p className="text-green-400 text-xs font-medium mb-1.5">
                Free on:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.freeProviders.map((p) => (
                  <div
                    key={p.provider_id}
                    className="flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-800/40 rounded-lg"
                    title={p.provider_name}
                  >
                    {p.logo_path && (
                      <img
                        src={providerLogoUrl(p.logo_path)}
                        alt=""
                        className="w-4 h-4 rounded-sm"
                      />
                    )}
                    <span className="text-green-300 text-xs">{p.provider_name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-xs italic">
              No free streaming found in your region
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
