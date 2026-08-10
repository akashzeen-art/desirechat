import { getActiveUserId, getActiveBundle, updateActiveBundle, migrateLegacyIfNeeded } from "./accounts";

export function getFavorites() {
  migrateLegacyIfNeeded();
  if (!getActiveUserId()) return [];
  try {
    const list = getActiveBundle()?.favorites;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function toggleFavorite(id) {
  if (!getActiveUserId()) return [];
  const list = getFavorites();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  updateActiveBundle({ favorites: next });
  return next;
}
