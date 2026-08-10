// Suggested flirt lines / icebreakers per companion + shared pool

const SWEET = [
  "Compliment me",
  "What makes you smile?",
  "Be sweet with me",
  "Soft flirt please",
  "Make me feel chosen",
  "Share your pic with me?",
];

const BOLD = [
  "Think you can keep up with me?",
  "Dare me to flirt harder",
  "Challenge me",
  "Don't hold back",
  "Your boldest line",
  "Send me a pic 😏",
];

const FUNNY = [
  "Roast me gently",
  "Make me laugh then flirt",
  "Banter with me",
  "Worst pickup line you know?",
  "Keep it silly and flirty",
  "Share a funny selfie?",
];

const REGIONS = ["african", "asian", "chinese", "european"];

export const SUGGESTIONS = Object.fromEntries([
  ...REGIONS.flatMap((region) => [
    [`${region}-sweet`, SWEET],
    [`${region}-bold`, BOLD],
    [`${region}-funny`, FUNNY],
    [`boy-${region}-sweet`, SWEET],
    [`boy-${region}-bold`, BOLD],
    [`boy-${region}-funny`, FUNNY],
  ]),
]);

export const DEFAULT_SUGGESTIONS = [
  "Flirt with me",
  "Tell me about yourself",
  "What's your vibe?",
  "Give me a pickup line",
  "Share your pic?",
];

export const MORE_LINES = [
  "If we just met IRL, what would you say?",
  "Truth or dare — soft version",
  "Compliment me in your style",
  "What should we talk about?",
  "Are you always this flirty?",
  "Tell me a secret about you",
  "Rate my energy right now",
  "Ask me something personal",
  "What's your love language?",
  "Describe me in three words",
  "Would you text me first?",
  "Make me smile in one line",
  "Can you share your photo?",
];

export function getSuggestionsFor(characterId) {
  return SUGGESTIONS[characterId] || DEFAULT_SUGGESTIONS;
}

/** Pick `count` unique suggestions, shuffled, mixing character + shared lines */
export function pickSuggestions(characterId, count = 4, exclude = []) {
  const base = [...getSuggestionsFor(characterId), ...MORE_LINES];
  const pool = base.filter((q) => !exclude.includes(q));
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
