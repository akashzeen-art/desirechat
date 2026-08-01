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

/** Map companions to mood tags */
export const CHARACTER_MOODS = {
  luna: ["sweet", "bold"],
  mia: ["sweet"],
  zara: ["bold"],
  sofia: ["sweet"],
  nova: ["funny", "bold"],
  aria: ["sweet", "funny"],
  ruby: ["bold"],
  ella: ["sweet", "funny"],
  alex: ["bold", "sweet"],
  kai: ["bold"],
  leo: ["funny", "bold"],
  ryan: ["sweet"],
  jake: ["funny"],
  nico: ["sweet"],
  max: ["bold"],
  dylan: ["funny", "sweet"],
};

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
