const PROFILE_KEY = "desirechat_user_profile_v1";

const NOT_NAMES = new Set([
  "yes", "no", "hi", "hey", "hello", "ok", "okay", "sure", "fine", "good", "great",
  "thanks", "thank", "please", "what", "where", "how", "why", "who", "the", "and",
  "from", "here", "there", "today", "tonight", "maybe", "nothing", "someone", "anyone",
  "love", "like", "haha", "lol", "true", "dare", "pic", "photo", "image", "selfie",
]);

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

export function getUserProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      name: parsed.name || "",
      nickname: parsed.nickname || "",
      place: parsed.place || "",
      gender: parsed.gender === "male" || parsed.gender === "female" ? parsed.gender : "",
      bio: parsed.bio || "",
      avatar: parsed.avatar || "",
    };
  } catch {
    return { ...EMPTY };
  }
}

export function setUserProfile(partial = {}) {
  const next = { ...getUserProfile(), ...partial };
  for (const key of Object.keys(EMPTY)) {
    if (partial[key] === "") next[key] = "";
  }
  if (next.bio) next.bio = String(next.bio).slice(0, 160);
  if (next.name) next.name = String(next.name).slice(0, 40);
  if (next.nickname) next.nickname = String(next.nickname).slice(0, 24);
  if (next.place) next.place = String(next.place).slice(0, 40);
  if (next.gender && next.gender !== "male" && next.gender !== "female") next.gender = "";
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  return next;
}

export function clearUserProfile() {
  localStorage.removeItem(PROFILE_KEY);
  return { ...EMPTY };
}

export function getDisplayName(profile = getUserProfile()) {
  return (profile.nickname || profile.name || "").trim();
}

/** Enough to start chatting — name/nickname + boy/girl */
export function isProfileReady(profile = getUserProfile()) {
  const nameOk = Boolean(getDisplayName(profile));
  const genderOk = profile.gender === "male" || profile.gender === "female";
  return nameOk && genderOk;
}

/** Pull name / nickname / place from a user message */
export function extractProfileHints(text = "") {
  const t = String(text || "").trim();
  if (!t) return {};

  const out = {};

  const nick =
    t.match(/\b(?:my\s+)?(?:nick\s*name|nickname)\s*(?:is|=|:)?\s*([A-Za-z][A-Za-z'\-]{1,20})\b/i) ||
    t.match(/\b(?:call|callin(?:g)?)\s+me\s+([A-Za-z][A-Za-z'\-]{1,20})\b/i) ||
    t.match(/\b(?:you\s+can\s+)?call\s+me\s+([A-Za-z][A-Za-z'\-]{1,20})\b/i);
  if (nick && !NOT_NAMES.has(nick[1].toLowerCase())) {
    out.nickname = capitalize(nick[1]);
  }

  const name =
    t.match(/\b(?:my\s+name\s+is|i\s*am|i['’]m)\s+([A-Za-z][A-Za-z'\-]{1,20})\b/i) ||
    t.match(/\b(?:name['’]?s)\s+([A-Za-z][A-Za-z'\-]{1,20})\b/i) ||
    t.match(/^\s*(?:it['’]?s|this\s+is)\s+([A-Za-z][A-Za-z'\-]{1,20})\s*[.!]?\s*$/i);
  if (name && !NOT_NAMES.has(name[1].toLowerCase())) {
    out.name = capitalize(name[1]);
  }

  const place =
    t.match(/\b(?:i['’]?m\s+from|i\s+am\s+from|from|i\s+live\s+in|living\s+in|based\s+in|i['’]?m\s+in)\s+([A-Za-z][A-Za-z\s'\-]{1,35})/i);
  if (place) {
    const p = cleanPlace(place[1]);
    if (p && !NOT_NAMES.has(p.toLowerCase())) {
      out.place = p
        .split(" ")
        .filter(Boolean)
        .map((w) => capitalize(w))
        .join(" ");
    }
  }

  if (!out.name && !out.nickname && /^[A-Za-z][A-Za-z'\-]{1,20}$/.test(t)) {
    const low = t.toLowerCase();
    if (!NOT_NAMES.has(low)) out.name = capitalize(t);
  }

  if (!out.name) {
    const combo = t.match(
      /^\s*(?:i['’]?m\s+|i\s+am\s+)?([A-Za-z][A-Za-z'\-]{1,20})\s*[,!]?\s*(?:from|in)\s+([A-Za-z][A-Za-z\s'\-]{1,35})/i
    );
    if (combo && !NOT_NAMES.has(combo[1].toLowerCase())) {
      out.name = capitalize(combo[1]);
      if (!out.place) {
        const p = cleanPlace(combo[2]);
        if (p) {
          out.place = p
            .split(" ")
            .filter(Boolean)
            .map((w) => capitalize(w))
            .join(" ");
        }
      }
    }
  }

  return out;
}

export function buildIntroGreeting(characterName, profile = getUserProfile()) {
  const display = getDisplayName(profile);
  if (display && profile.place) {
    return `Hey ${display}! I'm ${characterName} — good to see you again. How are things in ${profile.place}? Tell me something fun about your day.`;
  }
  if (display) {
    return `Hey ${display}! I'm ${characterName}. So nice to chat with you — where are you from? I'd love to know a little more about you.`;
  }
  return `Hey you… I'm ${characterName}. What's your name, and where are you from? I'd love to get to know you a little.`;
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
  return lines.join("\n");
}
