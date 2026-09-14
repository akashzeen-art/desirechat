import { getActiveUserId } from "../data/accounts";
import { getDisplayName, getUserProfile } from "../data/userProfile";

export function getMyHuman() {
  const profile = getUserProfile();
  return {
    id: getActiveUserId() || "anon",
    name: getDisplayName(profile) || profile?.name || "Guest",
    avatar: profile?.avatar || "",
  };
}

export function mergeById(local = [], remote = []) {
  const map = new Map();
  [...local, ...remote].forEach((m) => {
    if (!m?.id) return;
    if (!map.has(m.id)) map.set(m.id, m);
  });
  return [...map.values()].sort(
    (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
  );
}

export function mergeHumans(local = [], remote = []) {
  const map = new Map();
  [...local, ...remote].forEach((h) => {
    if (!h?.id) return;
    map.set(h.id, { ...map.get(h.id), ...h });
  });
  return [...map.values()];
}
