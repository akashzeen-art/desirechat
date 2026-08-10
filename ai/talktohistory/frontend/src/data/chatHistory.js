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
  if (!entry?.messages?.length) return null;
  return {
    messages: entry.messages,
    photosShared: entry.photosShared || 0,
    updatedAt: entry.updatedAt,
  };
}

export function saveChat(characterId, messages, photosShared = 0) {
  if (!characterId || !messages?.length || !getActiveUserId()) return;
  const all = readAll();
  // Slim old image payloads to avoid quota issues
  const slimMessages = messages.map((m, i, arr) => {
    if (m.image && i < arr.length - 6 && String(m.image).startsWith("data:")) {
      const { image, ...rest } = m;
      return { ...rest, content: rest.content || "[photo]" };
    }
    return m;
  });
  all[characterId] = {
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
