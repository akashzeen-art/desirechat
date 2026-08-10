const MOOD_KEY = "spark_mood";

export const MOODS = [
  { id: "sweet", label: "Sweet", emoji: "🌸", hint: "Soft, warm, complimentary" },
  { id: "bold", label: "Bold", emoji: "🔥", hint: "Direct, confident, spicy-lite" },
  { id: "funny", label: "Funny", emoji: "😂", hint: "Playful jokes & banter" },
];

export const MOOD_PROMPT = {
  sweet:
    "MOOD: Keep replies extra sweet, warm, and complimentary. Soft flirting only.",
  bold:
    "MOOD: Keep replies bold, confident, and playfully daring. Still PG-13 — no NSFW.",
  funny:
    "MOOD: Keep replies funny, witty, and lightly teasing. Banter first, then flirt.",
};

const REGIONS = ["african", "asian", "chinese", "european"];
const VIBES = ["sweet", "bold", "funny"];

/** Map companions to mood tags — match their vibe only */
export const CHARACTER_MOODS = Object.fromEntries([
  ...REGIONS.flatMap((region) =>
    VIBES.map((vibe) => [`${region}-${vibe}`, [vibe]])
  ),
  ...REGIONS.flatMap((region) =>
    VIBES.map((vibe) => [`boy-${region}-${vibe}`, [vibe]])
  ),
]);

export function getMood() {
  return sessionStorage.getItem(MOOD_KEY) || "sweet";
}

export function setMood(mood) {
  sessionStorage.setItem(MOOD_KEY, mood);
}

export function characterMatchesMood(characterId, mood) {
  if (!mood) return true;
  const tags = CHARACTER_MOODS[characterId] || [];
  return tags.includes(mood);
}
