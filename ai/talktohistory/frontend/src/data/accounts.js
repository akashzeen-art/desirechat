/**
 * Multi-account storage — each person gets isolated profile, chats, rooms, favorites.
 */
const ACCOUNTS_KEY = "desirechat_accounts_v2";
const ACTIVE_KEY = "desirechat_active_user";

// Legacy single-user keys (migrated once)
const LEGACY_PROFILE = "desirechat_user_profile_v1";
const LEGACY_CHATS = "desirechat_histories_v1";
const LEGACY_ROOMS = "desirechat_rooms_v1";
const LEGACY_FAVS = "spark_favorites";

function readStore() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.users && typeof parsed.users === "object") return parsed;
  } catch {
    /* fall through */
  }
  return { users: {} };
}

function writeStore(store) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(store));
}

function uidFromName(name = "") {
  const slug = String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20);
  return `u_${Date.now().toString(36)}_${slug || "user"}`;
}

export function getActiveUserId() {
  try {
    return sessionStorage.getItem(ACTIVE_KEY) || "";
  } catch {
    return "";
  }
}

export function setActiveUserId(id) {
  try {
    if (id) sessionStorage.setItem(ACTIVE_KEY, id);
    else sessionStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

function emptyBundle() {
  return {
    profile: {
      name: "",
      nickname: "",
      place: "",
      gender: "",
      bio: "",
      avatar: "",
    },
    chats: {},
    rooms: [],
    favorites: [],
  };
}

/** One-time migrate old single-profile data into an account */
export function migrateLegacyIfNeeded() {
  const store = readStore();
  if (Object.keys(store.users).length) return store;

  let legacyProfile = null;
  try {
    legacyProfile = JSON.parse(localStorage.getItem(LEGACY_PROFILE) || "null");
  } catch {
    legacyProfile = null;
  }
  if (!legacyProfile?.name && !legacyProfile?.nickname) return store;

  const id = uidFromName(legacyProfile.nickname || legacyProfile.name);
  let chats = {};
  let rooms = [];
  let favorites = [];
  try {
    chats = JSON.parse(localStorage.getItem(LEGACY_CHATS) || "{}") || {};
  } catch {
    chats = {};
  }
  try {
    rooms = JSON.parse(localStorage.getItem(LEGACY_ROOMS) || "[]") || [];
  } catch {
    rooms = [];
  }
  try {
    favorites = JSON.parse(localStorage.getItem(LEGACY_FAVS) || "[]") || [];
  } catch {
    favorites = [];
  }

  store.users[id] = {
    ...emptyBundle(),
    profile: {
      name: legacyProfile.name || "",
      nickname: legacyProfile.nickname || "",
      place: legacyProfile.place || "",
      gender: legacyProfile.gender || "",
      bio: legacyProfile.bio || "",
      avatar: legacyProfile.avatar || "",
    },
    chats,
    rooms: Array.isArray(rooms) ? rooms : [],
    favorites: Array.isArray(favorites) ? favorites : [],
    createdAt: new Date().toISOString(),
  };
  writeStore(store);

  // Don't delete legacy yet — keep as backup; stop using them via new APIs
  if (!getActiveUserId()) setActiveUserId(id);
  return store;
}

export function listAccounts() {
  migrateLegacyIfNeeded();
  const store = readStore();
  return Object.entries(store.users)
    .map(([id, bundle]) => ({
      id,
      name: bundle.profile?.name || "",
      nickname: bundle.profile?.nickname || "",
      avatar: bundle.profile?.avatar || "",
      gender: bundle.profile?.gender || "",
      displayName: (bundle.profile?.nickname || bundle.profile?.name || "User").trim(),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function getActiveBundle() {
  migrateLegacyIfNeeded();
  const id = getActiveUserId();
  if (!id) return null;
  const store = readStore();
  return store.users[id] || null;
}

export function requireActiveBundle() {
  const bundle = getActiveBundle();
  return bundle || emptyBundle();
}

export function updateActiveBundle(patch) {
  const id = getActiveUserId();
  if (!id) return null;
  const store = readStore();
  if (!store.users[id]) store.users[id] = emptyBundle();
  store.users[id] = {
    ...store.users[id],
    ...patch,
    profile: patch.profile
      ? { ...store.users[id].profile, ...patch.profile }
      : store.users[id].profile,
  };
  writeStore(store);
  return store.users[id];
}

/** Create a brand-new account and make it active (does not touch other users) */
export function createAccount(profile) {
  migrateLegacyIfNeeded();
  const store = readStore();
  const id = uidFromName(profile.nickname || profile.name);
  store.users[id] = {
    ...emptyBundle(),
    profile: {
      name: profile.name || "",
      nickname: profile.nickname || "",
      place: profile.place || "",
      gender: profile.gender || "",
      bio: profile.bio || "",
      avatar: profile.avatar || "",
    },
    createdAt: new Date().toISOString(),
  };
  writeStore(store);
  setActiveUserId(id);
  return id;
}

export function switchAccount(userId) {
  const store = readStore();
  if (!store.users[userId]) return false;
  setActiveUserId(userId);
  return true;
}

/** End session only — keep saved accounts on this device */
export function logoutAccount() {
  setActiveUserId("");
}

/** Remove one account and all of their chats/rooms */
export function deleteAccount(userId) {
  const store = readStore();
  delete store.users[userId];
  writeStore(store);
  if (getActiveUserId() === userId) setActiveUserId("");
}

export function storageUserKey(baseKey) {
  const id = getActiveUserId();
  return id ? `${baseKey}::${id}` : `${baseKey}::__none__`;
}
