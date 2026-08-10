import { getPrompt } from "../data/prompts";
import { MOOD_PROMPT } from "../data/moods";
import { truthOrDareSystemNote } from "../data/truthOrDare";
import { profileSystemNote } from "../data/userProfile";

const MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

async function chatRequest(messages, { temperature = 0.85, max_tokens = 220 } = {}) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature,
      max_tokens,
      messages,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = data?.error?.message || `Chat failed (${response.status})`;
    throw new Error(msg);
  }

  return data;
}

// ── Chat via Vite proxy ───────────────────────────────────
export const sendChatMessage = async (
  message,
  characterId,
  history = [],
  { mood = "sweet", truthOrDare = false, userProfile = null } = {}
) => {
  const recentHistory = history.slice(-10).map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: String(msg.content),
  }));

  let system = getPrompt(characterId);
  if (MOOD_PROMPT[mood]) system += `\n\n${MOOD_PROMPT[mood]}`;
  if (truthOrDare) system += `\n\n${truthOrDareSystemNote()}`;
  if (userProfile) system += `\n\n${profileSystemNote(userProfile)}`;

  const data = await chatRequest([
    { role: "system", content: system },
    ...recentHistory,
    { role: "user", content: message.trim() },
  ]);

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Empty reply from the model.");

  return { reply };
};

/** Group chat room — one companion replies in character, aware of others */
export const sendRoomChatMessage = async (
  message,
  speaker,
  members,
  history = [],
  { themeName = "Flirty Lounge", userProfile = null } = {}
) => {
  const others = members
    .filter((m) => m.id !== speaker.id)
    .map((m) => `${m.name} (${m.gender === "female" ? "girl" : "boy"}, ${m.vibeId})`)
    .join(", ");

  const display =
    userProfile?.nickname || userProfile?.name || "the user";

  let system = getPrompt(speaker.id) || `You are ${speaker.name}, a flirty DesireChat companion.`;
  system += `

GROUP CHAT ROOM RULES:
You are in a flirty group chat called "${themeName}".
Other companions in the room: ${others || "none"}.
The human user's preferred name is "${display}".
Reply ONLY as ${speaker.name} — never speak for others.
Keep it short (1–3 sentences), playful, PG-13 flirty. Banter with the group vibe.
You may lightly tease or react to what other companions said in history.
If someone @mentions you, answer them first.
Do not invent photos or URLs.`;

  if (userProfile) system += `\n\n${profileSystemNote(userProfile)}`;

  const recentHistory = history.slice(-14).map((msg) => {
    if (msg.role === "user") {
      return { role: "user", content: String(msg.content) };
    }
    const who = msg.speakerName || "Companion";
    return {
      role: "assistant",
      content: `${who}: ${String(msg.content)}`,
    };
  });

  const data = await chatRequest(
    [
      { role: "system", content: system },
      ...recentHistory,
      { role: "user", content: message.trim() },
    ],
    { temperature: 0.9, max_tokens: 160 }
  );

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Empty reply from the model.");

  // Strip accidental "Name:" prefix
  const cleaned = reply.replace(new RegExp(`^${speaker.name}\\s*[:：-]\\s*`, "i"), "").trim();
  return { reply: cleaned || reply };
};

/** Pick who should reply in a room — group messages get all replies; @name targets one */
export function pickRoomResponders(text, members, lastSpeakerIds = []) {
  if (!members?.length) return [];
  const lower = String(text || "").toLowerCase();

  const mentioned = members.filter((m) => {
    const name = m.name.toLowerCase();
    return (
      lower.includes(`@${name}`) ||
      new RegExp(`\\b${name}\\b`, "i").test(String(text || ""))
    );
  });

  const wantsEveryone =
    /\b(both|everyone|everybody|all of you|you (?:two|guys|girls)|y'?all|the (?:room|group)|whole (?:room|group))\b/i.test(
      lower
    );

  // Targeted @ / name without "both/everyone" → only those people
  if (mentioned.length && !wantsEveryone) {
    return mentioned;
  }

  // Talking to the room (or "both") → everyone replies
  // Slight shuffle so reply order isn't always the same
  const order = [...members];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  // Prefer someone quiet recently to speak first
  if (lastSpeakerIds?.length) {
    order.sort((a, b) => {
      const aQuiet = lastSpeakerIds.includes(a.id) ? 1 : 0;
      const bQuiet = lastSpeakerIds.includes(b.id) ? 1 : 0;
      return aQuiet - bQuiet;
    });
  }

  return order;
}

/** Conversation-aware suggested replies for the user */
export const fetchConversationSuggestions = async (characterName, history = [], mood = "sweet") => {
  const recent = history.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n");

  const data = await chatRequest(
    [
      {
        role: "system",
        content: `You write short flirty reply suggestions for the USER to send next in a chat app called DesireChat.
Return ONLY a JSON array of exactly 3 strings. No markdown, no labels.
Each suggestion: under 12 words, PG-13, matches mood "${mood}", continues THIS conversation naturally.
Never NSFW.`,
      },
      {
        role: "user",
        content: `Companion: ${characterName}\nConversation:\n${recent}\n\nGive 3 suggested replies the user could send next.`,
      },
    ],
    { temperature: 0.9, max_tokens: 120 }
  );

  const raw = data?.choices?.[0]?.message?.content?.trim() || "[]";
  try {
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(Boolean).slice(0, 3);
    }
  } catch {
    /* fall through */
  }
  return [
    "Tell me more about that",
    "You're cute when you say that",
    "Okay… your turn to ask me something",
  ];
};

// ── Voice config (region accents — English speech with regional tone) ──
const REGION_VOICE = {
  european: {
    langs: ["en-GB", "en-IE", "en-AU", "en-US"],
    femaleNames: [
      "Google UK English Female",
      "Microsoft Hazel",
      "Microsoft Susan",
      "Microsoft Sonia",
      "Kate",
      "Serena",
      "Samantha",
    ],
    maleNames: [
      "Google UK English Male",
      "Microsoft George",
      "Microsoft Ryan",
      "Microsoft Thomas",
      "Daniel",
      "Oliver",
      "Arthur",
    ],
    female: { rate: 0.95, pitch: 1.1 },
    male: { rate: 0.98, pitch: 0.8 },
  },
  asian: {
    langs: ["en-US", "en-AU", "en-GB"],
    femaleNames: [
      "Google US English Female",
      "Microsoft Zira",
      "Microsoft Aria",
      "Samantha",
      "Karen",
      "Victoria",
    ],
    maleNames: [
      "Microsoft Mark",
      "Microsoft David",
      "Microsoft Guy",
      "Google UK English Male",
      "Daniel",
      "Tom",
    ],
    female: { rate: 0.94, pitch: 1.14 },
    male: { rate: 0.98, pitch: 0.82 },
  },
  chinese: {
    langs: ["en-US", "en-GB", "en-AU"],
    femaleNames: [
      "Google US English Female",
      "Microsoft Zira",
      "Samantha",
      "Karen",
      "Google UK English Female",
    ],
    maleNames: [
      "Microsoft Mark",
      "Microsoft David",
      "Microsoft Guy",
      "Google UK English Male",
      "Daniel",
      "Tom",
    ],
    female: { rate: 0.93, pitch: 1.12 },
    male: { rate: 0.97, pitch: 0.82 },
  },
  african: {
    langs: ["en-GB", "en-ZA", "en-US", "en-AU"],
    femaleNames: [
      "Google UK English Female",
      "Microsoft Hazel",
      "Google US English Female",
      "Tessa",
      "Samantha",
    ],
    maleNames: [
      "Google UK English Male",
      "Microsoft George",
      "Microsoft Mark",
      "Microsoft David",
      "Daniel",
      "Tom",
    ],
    female: { rate: 0.94, pitch: 1.05 },
    male: { rate: 0.96, pitch: 0.78 },
  },
};

const FEMALE_VOICE_RE =
  /female|woman|girl|zira|hazel|susan|samantha|karen|victoria|serena|tessa|sonia|aria|jenny|emma|linda|heather|moira|fiona|karen/i;
const MALE_VOICE_RE =
  /male|man|boy|david|mark|george|daniel|ryan|ravi|thomas|arthur|oliver|guy|tom|fred|james|aaron|eric|nathan|sam\b/i;

function normalizeVoiceOpts(voiceOpts) {
  if (!voiceOpts) return { gender: "male", region: "european" };
  if (typeof voiceOpts === "string") return { gender: voiceOpts, region: "european" };
  return {
    gender: voiceOpts.gender || "male",
    region: voiceOpts.region || "european",
  };
}

function cleanSpeakText(text) {
  return String(text || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    // Soften dramatic punctuation so the engine doesn't hang on !.
    .replace(/!{2,}/g, "!")
    .replace(/\?{2,}/g, "?")
    .replace(/\.{3,}/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

function voiceMatchesGender(voice, gender) {
  const name = voice?.name || "";
  if (gender === "female") {
    if (MALE_VOICE_RE.test(name) && !FEMALE_VOICE_RE.test(name)) return false;
    if (FEMALE_VOICE_RE.test(name)) return true;
    // Unknown name — allow only if not clearly male
    return !/\bmale\b/i.test(name);
  }
  // male
  if (FEMALE_VOICE_RE.test(name)) return false;
  if (MALE_VOICE_RE.test(name)) return true;
  // Reject generic "Google US English" (usually female on Chrome)
  if (/^google us english$/i.test(name.trim())) return false;
  return !/\bfemale\b/i.test(name);
}

const pickVoice = (gender, region) => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const cfg = REGION_VOICE[region] || REGION_VOICE.european;
  const namePrefs = gender === "female" ? cfg.femaleNames : cfg.maleNames;
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const genderedEnglish = english.filter((v) => voiceMatchesGender(v, gender));

  // 1) Exact preferred names (gender-safe)
  for (const name of namePrefs) {
    const match =
      genderedEnglish.find((v) => v.name === name) ||
      english.find((v) => v.name === name && voiceMatchesGender(v, gender));
    if (match) return match;
  }

  // 2) Partial name match — but never cross gender
  for (const name of namePrefs) {
    const needle = name.toLowerCase();
    const match = genderedEnglish.find((v) => v.name.toLowerCase().includes(needle));
    if (match) return match;
  }

  // 3) Region lang pool with gender filter
  for (const lang of cfg.langs) {
    const pool = voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith(lang.toLowerCase()) &&
        voiceMatchesGender(v, gender)
    );
    if (pool.length) return pool[0];
  }

  // 4) Any English voice of the right gender
  if (genderedEnglish.length) return genderedEnglish[0];

  // 5) Last resort: pitch will still push masculine/feminine
  return english[0] || voices[0];
};

let speakToken = 0;
let currentUtterance = null;
let chromeKeepAlive = null;

function clearChromeKeepAlive() {
  if (chromeKeepAlive) {
    clearInterval(chromeKeepAlive);
    chromeKeepAlive = null;
  }
}

function startChromeKeepAlive() {
  clearChromeKeepAlive();
  // Chrome pauses speechSynthesis after ~15s without resume pokes
  chromeKeepAlive = setInterval(() => {
    try {
      if (window.speechSynthesis?.speaking) window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }
  }, 8000);
}

/** Speak full text in one go (no per-sentence gaps). */
export const speakText = (text, onEnd, voiceOpts = "male") => {
  if (!window.speechSynthesis) {
    onEnd?.();
    return false;
  }

  const cleaned = cleanSpeakText(text);
  if (!cleaned) {
    onEnd?.();
    return false;
  }

  const { gender, region } = normalizeVoiceOpts(voiceOpts);
  const cfg = REGION_VOICE[region] || REGION_VOICE.european;
  const tone = cfg[gender] || cfg.male;
  const token = ++speakToken;

  clearChromeKeepAlive();
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }

  const finish = () => {
    if (token !== speakToken) return;
    clearChromeKeepAlive();
    currentUtterance = null;
    onEnd?.();
  };

  const speak = () => {
    if (token !== speakToken) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    // Hold reference so Chrome doesn't GC the utterance mid-speech
    currentUtterance = utterance;
    utterance.rate = tone.rate;
    utterance.pitch = tone.pitch;
    utterance.volume = 1;

    const voice = pickVoice(gender, region);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || "en-US";
    } else {
      utterance.lang = "en-US";
    }

    utterance.onend = finish;
    utterance.onerror = (ev) => {
      // "interrupted" / "canceled" when we stop on purpose — still finish UI
      if (ev?.error === "interrupted" || ev?.error === "canceled") {
        finish();
        return;
      }
      finish();
    };

    try {
      window.speechSynthesis.speak(utterance);
      startChromeKeepAlive();
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    } catch {
      finish();
    }
  };

  // Tiny delay after cancel so Chrome actually starts the next utterance
  const delay = window.speechSynthesis.getVoices().length ? 40 : 120;

  if (!window.speechSynthesis.getVoices().length) {
    const once = () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (token === speakToken) setTimeout(speak, 40);
    };
    window.speechSynthesis.onvoiceschanged = once;
  }

  setTimeout(() => {
    if (token === speakToken) speak();
  }, delay);

  return true;
};

export const stopSpeaking = () => {
  speakToken += 1;
  clearChromeKeepAlive();
  currentUtterance = null;
  try {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
};

export const createSpeechRecognition = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";
  return recognition;
};
