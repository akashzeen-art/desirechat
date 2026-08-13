import { getActiveUserId, getActiveBundle, updateActiveBundle, migrateLegacyIfNeeded } from "./accounts";

function readAll() {
  migrateLegacyIfNeeded();
  if (!getActiveUserId()) return {};
  const bundle = getActiveBundle();
  return bundle?.chats && typeof bundle.chats === "object" ? bundle.chats : {};
}

function writeAll(data) {
  if (!getActiveUserId()) return false;
  updateActiveBundle({ chats: data });
  return true;
}

export function loadChat(characterId) {
  if (!characterId || !getActiveUserId()) return null;
  const all = readAll();
  const entry = all[characterId];
  if (!entry) return null;
  return {
    messages: entry.messages || [],
    photosShared: entry.photosShared || 0,
    shareId: entry.shareId || "",
    hostId: entry.hostId || "",
    humans: Array.isArray(entry.humans) ? entry.humans : [],
    shared: Boolean(entry.shared),
    updatedAt: entry.updatedAt,
  };
}

export function findChatByShareId(shareId) {
  if (!shareId) return null;
  const all = readAll();
  for (const [characterId, entry] of Object.entries(all)) {
    if (entry?.shareId === shareId) return { characterId, ...entry };
  }
  return null;
}

export function saveChatShare(characterId, patch = {}) {
  if (!characterId || !getActiveUserId()) return;
  const all = readAll();
  all[characterId] = {
    ...(all[characterId] || { messages: [], photosShared: 0 }),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeAll(all);
}

export function saveChat(characterId, messages, photosShared = 0) {
  if (!characterId || !getActiveUserId()) return;
  const all = readAll();
  const prev = all[characterId] || {};
  // Slim old image payloads to avoid quota issues
  const slimMessages = (messages || []).map((m, i, arr) => {
    if (m.image && i < arr.length - 6 && String(m.image).startsWith("data:")) {
      const { image, ...rest } = m;
      return { ...rest, content: rest.content || "[photo]" };
    }
    return m;
  });
  all[characterId] = {
    ...prev,
    messages: slimMessages,
    photosShared,
    updatedAt: new Date().toISOString(),
  };
  writeAll(all);
}

export function clearChat(characterId) {
  if (!characterId || !getActiveUserId()) return;
  const all = readAll();
  delete all[characterId];
  writeAll(all);
}

export function hasChat(characterId) {
  return Boolean(loadChat(characterId));
}
