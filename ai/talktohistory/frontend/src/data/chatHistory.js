const STORAGE_KEY = "desirechat_histories_v1";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    // Quota exceeded — drop image payloads from older messages and retry
    try {
      const slim = {};
      for (const [id, entry] of Object.entries(data)) {
        slim[id] = {
          ...entry,
          messages: (entry.messages || []).map((m, i, arr) => {
            if (m.image && i < arr.length - 6 && String(m.image).startsWith("data:")) {
              const { image, ...rest } = m;
              return { ...rest, content: rest.content || "[photo]" };
            }
            return m;
          }),
        };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
      return true;
    } catch {
      return false;
    }
  }
}

export function loadChat(characterId) {
  if (!characterId) return null;
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
  if (!characterId || !messages?.length) return;
  const all = readAll();
  all[characterId] = {
    messages,
    photosShared,
    updatedAt: new Date().toISOString(),
  };
  writeAll(all);
}

export function clearChat(characterId) {
  if (!characterId) return;
  const all = readAll();
  delete all[characterId];
  writeAll(all);
}

export function hasChat(characterId) {
  return Boolean(loadChat(characterId));
}
