import {
  getActiveUserId,
  getActiveBundle,
  updateActiveBundle,
  createAccount,
  logoutAccount,
  migrateLegacyIfNeeded,
} from "./accounts";

const NOT_NAMES = new Set([
  "yes", "no", "hi", "hey", "hello", "ok", "okay", "sure", "fine", "good", "great",
  "thanks", "thank", "please", "what", "where", "how", "why", "who", "the", "and",
  "from", "here", "there", "today", "tonight", "maybe", "nothing", "someone", "anyone",
  "love", "like", "haha", "lol", "true", "dare", "pic", "photo", "image", "selfie",
  "bye", "goodbye", "goodnight", "night", "later", "cya", "ciao",
  "gn", "ttyl", "peace", "see", "ya", "you", "bro", "sis", "dude", "man", "girl",
  "boy", "baby", "babe", "dear", "miss", "mr", "mrs", "nah", "yep", "yeah", "yup",
]);

/** Farewell / leaving — never treat as a name */
export function isFarewellMessage(text = "") {
  const t = String(text || "").trim().toLowerCase();
  if (!t) return false;
  return /^(bye+|goodbye|good\s*bye|good\s*night|goodnight|night|see\s+ya|see\s+you|cya|ttyl|take\s+care|gotta\s+go|i('?m|\s+am)\s+(leaving|out|off)|talk\s+later|catch\s+you\s+later)[.!?\s💕❤️]*$/i.test(
    t
  );
}

function safeNameField(value = "") {
  const v = String(value || "").trim();
  if (!v) return "";
  if (NOT_NAMES.has(v.toLowerCase())) return "";
  if (isFarewellMessage(v)) return "";
  return v;
}

function capitalize(word = "") {
  const w = String(word).trim();
  if (!w) return "";
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function cleanPlace(raw = "") {
  return String(raw)
    .replace(/[?.!,]+$/g, "")
    .replace(/\b(actually|right now|these days)\b/gi, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 40);
}

const EMPTY = {
  name: "",
  nickname: "",
  place: "",
  gender: "",
  bio: "",
  avatar: "",
};

function sanitizeProfile(raw = {}) {
  return {
    name: safeNameField(raw.name || ""),
    nickname: safeNameField(raw.nickname || ""),
    place: raw.place || "",
    gender: raw.gender === "male" || raw.gender === "female" ? raw.gender : "",
    bio: raw.bio || "",
    avatar: raw.avatar || "",
  };
}

export function getUserProfile() {
  migrateLegacyIfNeeded();
  if (!getActiveUserId()) return { ...EMPTY };
  const bundle = getActiveBundle();
  if (!bundle?.profile) return { ...EMPTY };
  return sanitizeProfile(bundle.profile);
}

/**
 * Update active account profile.
 * If nobody is logged in and this looks like a full create, opens a NEW account.
 */
export function setUserProfile(partial = {}) {
  migrateLegacyIfNeeded();
  const cleanedPartial = { ...partial };
  if (partial.name !== undefined) cleanedPartial.name = safeNameField(partial.name);
  if (partial.nickname !== undefined) cleanedPartial.nickname = safeNameField(partial.nickname);

  if (!getActiveUserId()) {
    const draft = sanitizeProfile({ ...EMPTY, ...cleanedPartial });
    const nameOk = Boolean((draft.nickname || draft.name || "").trim());
    const genderOk = draft.gender === "male" || draft.gender === "female";
    if (nameOk && genderOk) {
      createAccount(draft);
      return getUserProfile();
    }
    return draft;
  }

  const next = sanitizeProfile({ ...getUserProfile(), ...cleanedPartial });
  for (const key of Object.keys(EMPTY)) {
    if (partial[key] === "") next[key] = "";
  }
  if (next.bio) next.bio = String(next.bio).slice(0, 160);
  if (next.name) next.name = String(next.name).slice(0, 40);
  if (next.nickname) next.nickname = String(next.nickname).slice(0, 24);
  if (next.place) next.place = String(next.place).slice(0, 40);

  updateActiveBundle({ profile: next });
  return next;
}

/** Logout current session (other accounts stay saved on device) */
export function clearUserProfile() {
  logoutAccount();
  return { ...EMPTY };
}

export function getDisplayName(profile = getUserProfile()) {
  return (profile.nickname || profile.name || "").trim();
}

/** Enough to start chatting — active session + name/nickname + boy/girl */
export function isProfileReady(profile = getUserProfile()) {
  if (!getActiveUserId()) return false;
  const nameOk = Boolean(getDisplayName(profile));
  const genderOk = profile.gender === "male" || profile.gender === "female";
  return nameOk && genderOk;
}

/** Pull name / nickname / place from a user message */
export function extractProfileHints(text = "") {
  const t = String(text || "").trim();
  if (!t) return {};
  if (isFarewellMessage(t)) return {};

  const out = {};

  const nick =
    t.match(/\b(?:my\s+)?(?:nick\s*name|nickname)\s*(?:is|=|:)?\s*([A-Za-z][A-Za-z'\-]{1,20})\b/i) ||
    t.match(/\b(?:call|callin(?:g)?)\s+me\s+([A-Za-z][A-Za-z'\-]{1,20})\b/i) ||
    t.match(/\b(?:you\s+can\s+)?call\s+me\s+([A-Za-z][A-Za-z'\-]{1,20})\b/i);
  if (nick && !NOT_NAMES.has(nick[1].toLowerCase())) {
    out.nickname = capitalize(nick[1]);
  }

  const name =
    t.match(/\b(?:my\s+name\s+is|i\s*am|i[''`]m)\s+([A-Za-z][A-Za-z'\-]{1,20})\b/i) ||
    t.match(/\b(?:name[''`]?s)\s+([A-Za-z][A-Za-z'\-]{1,20})\b/i) ||
    t.match(/^\s*(?:it[''`]?s|this\s+is)\s+([A-Za-z][A-Za-z'\-]{1,20})\s*[.!]?\s*$/i);
  if (name && !NOT_NAMES.has(name[1].toLowerCase())) {
    out.name = capitalize(name[1]);
  }

  const place =
    t.match(/\b(?:i[''`]?m\s+from|i\s+am\s+from|i\s+live\s+in|living\s+in|based\s+in|i[''`]?m\s+in)\s+([A-Za-z][A-Za-z\s'\-]{1,35})/i);
  if (place) {
    const p = cleanPlace(place[1]);
    if (p && !NOT_NAMES.has(p.toLowerCase())) {
      out.place = p.split(" ").filter(Boolean).map((w) => capitalize(w)).join(" ");
    }
  }

  return out;
}

export function buildIntroGreeting(characterName, profile = getUserProfile()) {
  const display = getDisplayName(profile);
  if (display) {
    return `Hey ${display}!`;
  }
  return `Hey!`;
}

export function profileSystemNote(profile = getUserProfile()) {
  const display = getDisplayName(profile);
  const lines = [
    "USER PROFILE (use this naturally in conversation):",
  ];
  if (display) {
    lines.push(`- Address the user as "${display}" often (especially in hellos and warm replies).`);
  } else {
    lines.push("- You do not know their name yet. Ask friendly: what's your name?");
  }
  if (profile.name && profile.nickname && profile.name !== profile.nickname) {
    lines.push(`- Their real name is ${profile.name}; nickname/preferred name is ${profile.nickname}. Prefer the nickname.`);
  } else if (profile.name) {
    lines.push(`- Their name is ${profile.name}.`);
  }
  if (profile.gender === "male") lines.push("- They identify as a guy / boy.");
  if (profile.gender === "female") lines.push("- They identify as a girl.");
  if (profile.place) {
    lines.push(`- They are from / in ${profile.place}. Mention it sometimes in a friendly way.`);
  } else {
    lines.push("- If you don't know where they're from, ask warmly once.");
  }
  if (profile.bio) {
    lines.push(`- About them: ${profile.bio}`);
  }
  lines.push("- Be friendly and personal. Do not repeatedly ask for name/place once you already know them.");
  lines.push('- If the user says bye/goodbye/good night/see you, give a warm short farewell using their real name if known. Do NOT call them "Bye". Do not ask a new question after a goodbye.');
  return lines.join("\n");
}
