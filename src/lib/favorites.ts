const KEY = "omo_favorites";

export function getFavoriteIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function isFavorite(id: number): boolean {
  return getFavoriteIds().includes(id);
}

export function toggleFavorite(id: number): boolean {
  const ids = getFavoriteIds();
  const idx = ids.indexOf(id);
  if (idx === -1) {
    ids.push(id);
    localStorage.setItem(KEY, JSON.stringify(ids));
    return true;
  } else {
    ids.splice(idx, 1);
    localStorage.setItem(KEY, JSON.stringify(ids));
    return false;
  }
}

// Для подписчиков на изменения избранного
type Listener = () => void;
const listeners: Listener[] = [];

export function subscribeFavorites(fn: Listener) {
  listeners.push(fn);
  return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); };
}

export function notifyFavorites() {
  listeners.forEach(fn => fn());
}
