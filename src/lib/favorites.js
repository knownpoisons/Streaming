const STORAGE_KEY = 'streamfinder_favorites';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

let listeners = [];

export function subscribe(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function notify() {
  const current = load();
  listeners.forEach(fn => fn(current));
}

export function getFavorites() {
  return load();
}

export function addFavorite(item) {
  const favorites = load();
  // Store only what we need
  const entry = {
    id: item.id,
    media_type: item.media_type,
    title: item.title || item.name,
    poster_path: item.poster_path,
    genre_ids: item.genre_ids || [],
    vote_average: item.vote_average,
    release_date: item.release_date || item.first_air_date || '',
    overview: item.overview || '',
    added_at: Date.now(),
  };
  if (!favorites.some(f => f.id === entry.id && f.media_type === entry.media_type)) {
    favorites.push(entry);
    save(favorites);
    notify();
  }
}

export function removeFavorite(id, mediaType) {
  const favorites = load().filter(f => !(f.id === id && f.media_type === mediaType));
  save(favorites);
  notify();
}

export function isFavorite(id, mediaType) {
  return load().some(f => f.id === id && f.media_type === mediaType);
}

// Extract the user's top genre IDs from their favorites, ranked by frequency
export function getTopGenres(limit = 5) {
  const favorites = load();
  const counts = {};
  for (const fav of favorites) {
    for (const gid of fav.genre_ids) {
      counts[gid] = (counts[gid] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => Number(id));
}
