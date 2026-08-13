import { getPrompt, groupChatNote } from "../data/prompts";
import { MOOD_PROMPT } from "../data/moods";
import { truthOrDareSystemNote } from "../data/truthOrDare";
import { profileSystemNote } from "../data/userProfile";
import { getTtsVoiceConfig } from "../data/voiceTone";
import { getCharacterById } from "../data/characters";

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
  { mood = "sweet", truthOrDare = false, userProfile = null, people = [], speakerName = "" } = {}
) => {
  const recentHistory = history.slice(-10).map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: String(msg.content),
  }));

  const companionName = getCharacterById(characterId)?.name;
  let system = getPrompt(characterId, companionName);
  if (MOOD_PROMPT[mood]) system += `\n\n${MOOD_PROMPT[mood]}`;
  if (truthOrDare) system += `\n\n${truthOrDareSystemNote()}`;
  if (userProfile) system += `\n\n${profileSystemNote(userProfile)}`;
  const group = groupChatNote(people, speakerName, companionName);
  if (group) system += `\n\n${group}`;

  const labeled = speakerName ? `[${speakerName}]: ${message.trim()}` : message.trim();

  const data = await chatRequest([
    { role: "system", content: system },
    ...recentHistory,
    { role: "user", content: labeled },
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
  { themeName = "Flirty Lounge", userProfile = null, people = [], speakerName = "" } = {}
) => {
  const others = members
    .filter((m) => m.id !== speaker.id)
    .map((m) => `${m.name} (${m.gender === "female" ? "girl" : "boy"}, ${m.vibeId})`)
    .join(", ");

  const display =
    userProfile?.nickname || userProfile?.name || "the user";

  let system = getPrompt(speaker.id, speaker.name) || `You are ${speaker.name}, a flirty DesireChat companion.`;
  system += `

GROUP CHAT ROOM RULES:
This is a casual group hangout. Lounge name: "${themeName}".
Other companions in the room: ${others || "none"}.
The human user's preferred name is "${display}".
${people?.length > 1 ? `Humans currently in the room: ${people.map((p) => p.name).filter(Boolean).join(", ")}.
The person who just spoke is "${speakerName || display}".
If one human greets another by name, they are talking to their friend — join in, do not think they renamed you.` : ""}
Reply ONLY as ${speaker.name} — never speak for others.
Keep it short (1–3 sentences), playful, PG-13 flirty. Sound like a real person in a chat — not an ad or host.
Do NOT quote the room name, theme title, or any slogan (never say lines like "soft lights, softer words").
You may lightly tease or react to what other companions said.
If someone @mentions you, answer them first.
Do not invent photos or URLs.
If the user says bye/goodbye, give a short warm farewell — do not call them Bye or restart the chat.`;

  if (userProfile) system += `\n\n${profileSystemNote(userProfile)}`;

  const recentHistory = history.slice(-14).map((msg) => {
    if (msg.role === "user") {
      const who = msg.senderName || msg.speakerName || "Someone";
      return { role: "user", content: `[${who}]: ${String(msg.content)}` };
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
      { role: "user", content: speakerName ? `[${speakerName}]: ${message.trim()}` : message.trim() },
    ],
    { temperature: 0.9, max_tokens: 160 }
  );

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Empty reply from the model.");

  // Strip accidental "Name:" prefix
  const cleaned = reply.replace(new RegExp(`^${speaker.name}\\s*[:：-]\\s*`, "i"), "").trim();
  return { reply: cleaned || reply };
};

function shuffleMembers(members) {
  const order = [...members];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Pick who should reply — default ONE person so voices never overlap */
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

  if (mentioned.length && !wantsEveryone) {
    return mentioned.slice(0, 1);
  }

  const order = shuffleMembers(members);
  if (lastSpeakerIds?.length) {
    order.sort((a, b) => {
      const aQuiet = lastSpeakerIds.includes(a.id) ? 1 : 0;
      const bQuiet = lastSpeakerIds.includes(b.id) ? 1 : 0;
      return aQuiet - bQuiet;
    });
  }

  if (wantsEveryone) return order;
  return order.slice(0, 1);
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

// ── OpenAI TTS (country + vibe instructions via gpt-4o-mini-tts) ─────
let currentAudio = null;
const liveAudios = new Set();

function stopAllAudio() {
  for (const a of liveAudios) {
    try {
      a.pause();
      a.removeAttribute("src");
      a.load();
    } catch {
      /* ignore */
    }
  }
  liveAudios.clear();
  currentAudio = null;
}

async function speakWithOpenAI(text, onEnd, { gender, region, vibe }, token, onStart) {
  const cfg = getTtsVoiceConfig({ gender, region, vibe });

  try {
    stopAllAudio();

    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voice: cfg.voice,
        classicVoice: cfg.classicVoice,
        speed: cfg.speed,
        instructions: cfg.instructions,
      }),
    });

    if (token !== speakToken) return true; // superseded — do not play or fallback
    if (!res.ok) throw new Error("TTS API failed");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    if (token !== speakToken) {
      URL.revokeObjectURL(url);
      return true;
    }

    stopAllAudio();
    const audio = new Audio(url);
    currentAudio = audio;
    liveAudios.add(audio);

    const finish = () => {
      URL.revokeObjectURL(url);
      liveAudios.delete(audio);
      if (currentAudio === audio) currentAudio = null;
      if (token === speakToken) onEnd?.();
    };

    audio.onended = finish;
    audio.onerror = finish;
    const played = audio.play();
    if (played?.then) {
      played
        .then(() => {
          if (token === speakToken) onStart?.();
        })
        .catch(() => {
          if (token !== speakToken) return;
          // Autoplay blocked — still reveal text, retry on next tap
          onStart?.();
          const retry = () => {
            if (token !== speakToken || currentAudio !== audio) return;
            audio.play().catch(finish);
          };
          document.addEventListener("pointerdown", retry, { once: true });
        });
    } else if (token === speakToken) {
      onStart?.();
    }
    return true;
  } catch {
    if (token !== speakToken) return true;
    return false; // fall through to browser TTS
  }
}

// ── Browser TTS fallback config ───────────────────────────────────────
const REGION_VOICE = {
  european: {
    langs: ["en-GB", "en-IE", "en-AU", "en-US"],
    femaleNames: [
      "Microsoft Sonia Online (Natural) - English (United Kingdom)",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Google UK English Female", "Microsoft Hazel", "Microsoft Zira",
      "Microsoft Zira Desktop - English (United States)",
      "Samantha", "Karen", "Moira",
    ],
    maleNames: [
      "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      "Microsoft Guy Online (Natural) - English (United States)",
      "Google UK English Male", "Microsoft George",
      "Microsoft David", "Microsoft David Desktop - English (United States)",
      "Daniel", "Alex",
    ],
    female: { rate: 1.0,  pitch: 1.10 },
    male:   { rate: 0.95, pitch: 0.90 },
  },
  asian: {
    langs: ["en-US", "en-AU", "en-GB"],
    femaleNames: [
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Microsoft Michelle Online (Natural) - English (United States)",
      "Microsoft Zira", "Microsoft Zira Desktop - English (United States)",
      "Samantha", "Karen",
    ],
    maleNames: [
      "Microsoft Guy Online (Natural) - English (United States)",
      "Microsoft Christopher Online (Natural) - English (United States)",
      "Microsoft David", "Microsoft David Desktop - English (United States)",
      "Microsoft Mark", "Alex", "Daniel",
    ],
    female: { rate: 1.05, pitch: 1.25 },
    male:   { rate: 1.0,  pitch: 0.95 },
  },
  chinese: {
    langs: ["zh-CN", "zh-TW", "en-US", "en-GB"],
    femaleNames: [
      "Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)",
      "Microsoft XiaoXiao", "Ting-Ting", "Mei-Jia", "Sin-Ji",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Zira", "Samantha",
    ],
    maleNames: [
      "Microsoft Yunyang Online (Natural) - Chinese (Mainland)",
      "Microsoft Yunxiang Online (Natural) - Chinese (Mainland)",
      "Microsoft Guy Online (Natural) - English (United States)",
      "Microsoft David", "Daniel",
    ],
    female: { rate: 1.08, pitch: 1.30 },
    male:   { rate: 1.0,  pitch: 0.95 },
  },
  african: {
    langs: ["en-ZA", "en-NG", "en-GB", "en-US"],
    femaleNames: [
      "Microsoft Sonia Online (Natural) - English (United Kingdom)",
      "Tessa", "Microsoft Aria Online (Natural) - English (United States)",
      "Google UK English Female", "Microsoft Hazel",
      "Microsoft Zira", "Microsoft Zira Desktop - English (United States)",
      "Samantha",
    ],
    maleNames: [
      "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      "Google UK English Male", "Microsoft George",
      "Microsoft Guy Online (Natural) - English (United States)",
      "Microsoft David", "Microsoft David Desktop - English (United States)",
      "Microsoft Mark", "Daniel",
    ],
    female: { rate: 0.92, pitch: 0.95 },
    male:   { rate: 0.88, pitch: 0.72 },
  },
  pakistani: {
    langs: ["ur-PK", "en-IN", "en-GB", "en-US"],
    femaleNames: [
      "Microsoft Uzma Online (Natural) - Urdu (Pakistan)",
      "Microsoft Neerja Online (Natural) - English (India)",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Zira", "Microsoft Zira Desktop - English (United States)",
      "Samantha",
    ],
    maleNames: [
      "Microsoft Asad Online (Natural) - Urdu (Pakistan)",
      "Microsoft Ravi Online (Natural) - English (India)",
      "Microsoft Guy Online (Natural) - English (United States)",
      "Microsoft David", "Microsoft David Desktop - English (United States)",
      "Daniel", "Microsoft George",
    ],
    female: { rate: 0.88, pitch: 1.15 },
    male:   { rate: 0.85, pitch: 0.82 },
  },
  indian: {
    langs: ["en-IN", "hi-IN", "en-GB", "en-US"],
    femaleNames: [
      "Microsoft Neerja Online (Natural) - English (India)",
      "Microsoft Swara Online (Natural) - Hindi (India)",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Zira", "Microsoft Zira Desktop - English (United States)",
      "Samantha",
    ],
    maleNames: [
      "Microsoft Ravi Online (Natural) - English (India)",
      "Microsoft Madhur Online (Natural) - Hindi (India)",
      "Microsoft Guy Online (Natural) - English (United States)",
      "Microsoft David", "Microsoft David Desktop - English (United States)",
      "Daniel", "Microsoft George",
    ],
    female: { rate: 0.90, pitch: 1.18 },
    male:   { rate: 0.87, pitch: 0.85 },
  },
  afghani: {
    langs: ["fa-AF", "ps-AF", "en-GB", "en-US"],
    femaleNames: [
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Microsoft Zira", "Microsoft Zira Desktop - English (United States)",
      "Google UK English Female", "Samantha",
    ],
    maleNames: [
      "Microsoft Guy Online (Natural) - English (United States)",
      "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      "Microsoft David", "Microsoft David Desktop - English (United States)",
      "Google UK English Male", "Daniel",
    ],
    female: { rate: 0.84, pitch: 1.05 },
    male:   { rate: 0.80, pitch: 0.78 },
  },
  srilankan: {
    langs: ["si-LK", "ta-LK", "en-IN", "en-GB", "en-US"],
    femaleNames: [
      "Microsoft Neerja Online (Natural) - English (India)",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Microsoft Zira", "Microsoft Zira Desktop - English (United States)",
      "Samantha",
    ],
    maleNames: [
      "Microsoft Ravi Online (Natural) - English (India)",
      "Microsoft Guy Online (Natural) - English (United States)",
      "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      "Microsoft David", "Microsoft David Desktop - English (United States)",
      "Daniel", "Microsoft George",
    ],
    female: { rate: 0.93, pitch: 1.20 },
    male:   { rate: 0.90, pitch: 0.88 },
  },
};

// Map user place keywords → voice region
const PLACE_REGION_MAP = [
  { keys: ["pakistan","lahore","karachi","islamabad","peshawar","rawalpindi","multan","faisalabad"], region: "pakistani" },
  { keys: ["india","mumbai","delhi","bangalore","bengaluru","hyderabad","chennai","kolkata","pune","ahmedabad","jaipur","lucknow","surat","chandigarh","kochi"], region: "indian" },
  { keys: ["afghanistan","kabul","kandahar","herat","mazar","afghan"], region: "afghani" },
  { keys: ["sri lanka","srilanka","colombo","kandy","galle","jaffna","negombo"], region: "srilankan" },
  { keys: ["china","beijing","shanghai","guangzhou","shenzhen","chengdu","wuhan","hong kong","taipei","taiwan"], region: "chinese" },
  { keys: ["japan","korea","tokyo","seoul","osaka","bangkok","thailand","vietnam","philippines","manila","jakarta","indonesia","malaysia","kuala lumpur","singapore"], region: "asian" },
  { keys: ["nigeria","ghana","kenya","ethiopia","tanzania","uganda","south africa","cairo","egypt","morocco","senegal","cameroon","ivory coast","zimbabwe","zambia","nairobi","lagos","accra","addis"], region: "african" },
  { keys: ["uk","london","manchester","birmingham","glasgow","edinburgh","france","paris","germany","berlin","italy","rome","spain","madrid","portugal","lisbon","netherlands","amsterdam","sweden","norway","denmark","finland","poland","ukraine","russia","moscow","australia","sydney","melbourne","new zealand","canada","toronto","usa","new york","los angeles","chicago","houston","europe","america"], region: "european" },
];

/** Detect voice region from user's place string */
export function getUserVoiceRegion(place = "") {
  const lower = place.toLowerCase().trim();
  if (!lower) return null;
  for (const { keys, region } of PLACE_REGION_MAP) {
    if (keys.some((k) => lower.includes(k))) return region;
  }
  return null;
}

// Known female voice name fragments
const FEMALE_VOICE_RE =
  /\bfemale\b|\bwoman\b|\bgirl\b|\bzira\b|hazel|susan|samantha|karen|victoria|serena|tessa|sonia|\baria\b|\bjenny\b|\bemma\b|linda|heather|moira|fiona|michelle|natasha|\beva\b|neerja|swara|uzma|xiaoxiao|xiaochen|xiaomo|\bting-ting\b|\bmei-jia\b|\bsin-ji\b|yunxi(?!ang)/i;
// Known male voice name fragments
const MALE_VOICE_RE =
  /\bmale\b|\bman\b|\bboy\b|\bdavid\b|\bmark\b|\bgeorge\b|\bdaniel\b|\bryan\b|\bravi\b|thomas|arthur|\boliver\b|\bguy\b|\btom\b|\bfred\b|\bjames\b|\baaron\b|\beric\b|nathan|christopher|andrew|\bbrian\b|\basad\b|yunyang|yunxi(?=ang)|madhur|rishi|\bnoah\b|\bluca\b|\bkenji\b|\bhiro\b|\bren\b/i;

const ROBOTIC_VOICE_RE = /espeak|festival|robot|compact|mobile|eloquence/i;

function normalizeVoiceOpts(voiceOpts) {
  if (!voiceOpts) return { gender: "male", region: "european", vibe: "sweet" };
  if (typeof voiceOpts === "string") return { gender: voiceOpts, region: "european", vibe: "sweet" };
  return {
    gender: voiceOpts.gender || "male",
    region: voiceOpts.region || "european",
    vibe: voiceOpts.vibe || "sweet",
  };
}

/** Soften text so browser TTS sounds more conversational */
function cleanSpeakText(text) {
  return String(text || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[*_~`#]+/g, "")
    .replace(/!{2,}/g, "!")
    .replace(/\?{2,}/g, "?")
    .replace(/\.{3,}|…+/g, ",") // ellipsis → short breath, less "AI pause"
    .replace(/\s*[—–-]+\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function voiceMatchesGender(voice, gender) {
  const name = voice?.name || "";
  if (ROBOTIC_VOICE_RE.test(name)) return false;
  const isFemale = FEMALE_VOICE_RE.test(name);
  const isMale = MALE_VOICE_RE.test(name);
  if (gender === "female") {
    if (isMale && !isFemale) return false; // clearly male → reject
    return true; // female or unknown → accept
  }
  // male
  if (isFemale && !isMale) return false; // clearly female → reject
  if (/^google us english$/i.test(name.trim())) return false; // Google US = female
  return true; // male or unknown → accept
}

/** Higher = more human-sounding on typical Windows/Mac installs */
function naturalnessScore(voice) {
  const n = (voice?.name || "").toLowerCase();
  let score = 0;
  if (/online\s*\(natural\)|natural|neural|premium/.test(n)) score += 120;
  if (/microsoft.*(aria|jenny|sonia|michelle|neerja|swara|uzma|xiaoxiao)/.test(n)) score += 40; // female naturals
  if (/microsoft.*(guy|ryan|christopher|ravi|asad|yunyang|george|mark)/.test(n)) score += 40; // male naturals
  if (/google.*(uk|us) english (female|male)/.test(n)) score += 25;
  if (/samantha|karen|moira|hazel/.test(n)) score += 20; // female
  if (/daniel|alex|george/.test(n)) score += 20; // male
  if (/zira|david\b/.test(n)) score += 5;
  if (ROBOTIC_VOICE_RE.test(n)) score -= 100;
  if (voice.localService === false) score += 15;
  return score;
}

const pickVoice = (gender, region) => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const cfg = REGION_VOICE[region] || REGION_VOICE.european;
  const namePrefs = gender === "female" ? cfg.femaleNames : cfg.maleNames;

  // 1) Preferred name match — must pass gender check
  for (const name of namePrefs) {
    const match =
      voices.find((v) => v.name === name) ||
      voices.find((v) => v.name.toLowerCase().includes(name.toLowerCase().slice(0, 24)));
    if (match && voiceMatchesGender(match, gender)) {
      console.log(`[voice] ${gender}/${region} → "${match.name}" (preferred)`);
      return match;
    }
  }

  // 2) For non-English regions, try native lang voices first
  const nonEnglishRegions = ["chinese", "pakistani", "indian", "afghani", "srilankan"];
  if (nonEnglishRegions.includes(region)) {
    for (const lang of cfg.langs) {
      if (lang.startsWith("en")) continue;
      const pool = voices
        .filter((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()) && voiceMatchesGender(v, gender))
        .sort((a, b) => naturalnessScore(b) - naturalnessScore(a));
      if (pool.length) {
        console.log(`[voice] ${gender}/${region} → "${pool[0].name}" (native lang ${lang})`);
        return pool[0];
      }
    }
  }

  // 3) Best gendered English voice ranked by naturalness
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const genderedEnglish = english
    .filter((v) => voiceMatchesGender(v, gender))
    .sort((a, b) => naturalnessScore(b) - naturalnessScore(a));

  if (genderedEnglish.length) {
    console.log(`[voice] ${gender}/${region} → "${genderedEnglish[0].name}" (best English)`);
    return genderedEnglish[0];
  }

  // 4) Any lang from region pool matching gender
  for (const lang of cfg.langs) {
    const pool = voices
      .filter((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()) && voiceMatchesGender(v, gender))
      .sort((a, b) => naturalnessScore(b) - naturalnessScore(a));
    if (pool.length) {
      console.log(`[voice] ${gender}/${region} → "${pool[0].name}" (region lang ${lang})`);
      return pool[0];
    }
  }

  // 5) Last resort
  const fallback = english[0] || voices[0];
  console.log(`[voice] ${gender}/${region} → "${fallback?.name}" (last resort)`);
  return fallback;
};

/** Warm voices list early so first speak isn't a generic robot voice */
export function warmUpVoices() {
  if (!window.speechSynthesis) return;
  const load = () => window.speechSynthesis.getVoices();
  load();
  window.speechSynthesis.onvoiceschanged = load;
}

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

/** Speak text — tries OpenAI TTS first, falls back to browser TTS */
export const speakText = (text, onEnd, voiceOpts = "male", extra = {}) => {
  if (!text?.trim()) { extra.onStart?.(); onEnd?.(); return false; }

  const cleaned = cleanSpeakText(text);
  if (!cleaned) { extra.onStart?.(); onEnd?.(); return false; }

  const { gender, region, vibe } = normalizeVoiceOpts(voiceOpts);
  const onStart = extra.onStart;

  // Stop any current audio
  stopAllAudio();
  speakToken += 1;
  const token = speakToken;
  clearChromeKeepAlive();
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }

  // Try OpenAI TTS first (country + vibe tone guide)
  speakWithOpenAI(cleaned, onEnd, { gender, region, vibe }, token, onStart).then((ok) => {
    if (ok || token !== speakToken) return;
    // Fallback: browser TTS
    browserSpeak(cleaned, onEnd, gender, region, vibe, token, onStart);
  });

  return true;
};

function browserSpeak(cleaned, onEnd, gender, region, vibe, token, onStart) {
  if (!window.speechSynthesis) { onStart?.(); onEnd?.(); return; }

  const cfg = REGION_VOICE[region] || REGION_VOICE.european;
  const tone = { ...(cfg[gender] || cfg.male) };
  // Soft vibe pitch/rate tweaks for browser fallback
  if (gender === "female") {
    if (vibe === "sweet") { tone.rate *= 0.96; tone.pitch *= 1.02; }
    if (vibe === "bold") { tone.rate *= 1.03; }
    if (vibe === "funny") { tone.rate *= 1.05; tone.pitch *= 1.04; }
  }

  clearChromeKeepAlive();
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }

  const finish = () => {
    if (token !== speakToken) return;
    clearChromeKeepAlive();
    currentUtterance = null;
    onEnd?.();
  };

  const speak = () => {
    if (token !== speakToken) return;
    const utterance = new SpeechSynthesisUtterance(cleaned);
    currentUtterance = utterance;
    utterance.rate = tone.rate;
    utterance.pitch = tone.pitch;
    utterance.volume = 1;
    const voice = pickVoice(gender, region);
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang || "en-US"; }
    else { utterance.lang = "en-US"; }
    utterance.onend = finish;
    utterance.onerror = () => finish();
    try {
      if (token === speakToken) onStart?.();
      window.speechSynthesis.speak(utterance);
      startChromeKeepAlive();
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    } catch { finish(); }
  };

  const delay = window.speechSynthesis.getVoices().length ? 40 : 120;
  if (!window.speechSynthesis.getVoices().length) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (token === speakToken) setTimeout(speak, 40);
    };
  }
  setTimeout(() => { if (token === speakToken) speak(); }, delay);
}

export const stopSpeaking = () => {
  speakToken += 1;
  clearChromeKeepAlive();
  stopAllAudio();
  currentUtterance = null;
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch { /* ignore */ }
};

/** Call from a tap/click so later TTS can play without another gesture */
export function unlockAudioPlayback() {
  try {
    const silent = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
    );
    silent.volume = 0.01;
    silent.play().then(() => {
      silent.pause();
    }).catch(() => {});
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      ctx.resume?.();
    }
  } catch {
    /* ignore */
  }
}

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
