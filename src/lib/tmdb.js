const BASE_URL = 'https://api.themoviedb.org/3';

let API_KEY = localStorage.getItem('tmdb_api_key') || '';

export function setApiKey(key) {
  API_KEY = key;
  localStorage.setItem('tmdb_api_key', key);
}

export function getApiKey() {
  return API_KEY;
}

async function tmdbFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

export async function searchMulti(query, page = 1) {
  const data = await tmdbFetch('/search/multi', { query, page, include_adult: 'false' });
  return data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
}

export async function getWatchProviders(mediaType, id) {
  const data = await tmdbFetch(`/${mediaType}/${id}/watch/providers`);
  return data.results || {};
}

export async function getDetails(mediaType, id) {
  return tmdbFetch(`/${mediaType}/${id}`);
}

export async function discoverByGenre(mediaType, genreIds, page = 1) {
  return tmdbFetch(`/discover/${mediaType}`, {
    with_genres: genreIds,
    sort_by: 'popularity.desc',
    page,
    'vote_count.gte': 50,
  });
}

export async function getGenres(mediaType) {
  const data = await tmdbFetch(`/genre/${mediaType}/list`);
  return data.genres;
}

export async function getTrending(mediaType = 'all', timeWindow = 'week') {
  return tmdbFetch(`/trending/${mediaType}/${timeWindow}`);
}

export function posterUrl(path, size = 'w342') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Known free streaming providers from TMDB's provider data
const FREE_PROVIDER_IDS = new Set([
  // Major free/ad-supported platforms
  73,   // Tubi
  386,  // Peacock Free
  300,  // Pluto TV
  457,  // Kanopy
  212,  // Hoopla
  207,  // The Roku Channel
  322,  // Tubi TV
  415,  // Xumo
  444,  // Plex
  638,  // Freevee
  1770, // Plex
  538,  // Plex
  442,  // Sling Free
  546,  // Filmzie
  459,  // iPlayer
]);

export function extractFreeProviders(providers, countryCode = 'US') {
  const countryData = providers[countryCode];
  if (!countryData) return [];

  const free = [];

  // "free" tier
  if (countryData.free) {
    free.push(...countryData.free);
  }

  // "ads" tier (ad-supported = free)
  if (countryData.ads) {
    free.push(...countryData.ads);
  }

  // "flatrate" that are known free providers
  if (countryData.flatrate) {
    free.push(...countryData.flatrate.filter(p => FREE_PROVIDER_IDS.has(p.provider_id)));
  }

  // Deduplicate by provider_id
  const seen = new Set();
  return free.filter(p => {
    if (seen.has(p.provider_id)) return false;
    seen.add(p.provider_id);
    return true;
  });
}

export function providerLogoUrl(path) {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/original${path}`;
}
