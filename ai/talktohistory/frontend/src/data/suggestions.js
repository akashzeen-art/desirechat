// Suggested flirt lines / icebreakers per companion + shared pool

export const SUGGESTIONS = {
  luna: [
    "You're mysterious… tell me a secret",
    "What kind of person catches your eye?",
    "Flirt with me a little",
    "Late-night thoughts — go",
    "Do I seem interesting yet?",
  ],
  mia: [
    "Compliment me",
    "What makes you smile?",
    "Wanna know something cute about me?",
    "Rate this convo so far",
    "Be sweet with me",
  ],
  zara: [
    "Think you can keep up with me?",
    "What's your type?",
    "Dare me to flirt harder",
    "First impression — be honest",
    "Challenge me",
  ],
  sofia: [
    "Tell me something romantic",
    "What was your day like?",
    "Describe your ideal vibe",
    "Soft flirt please",
    "Make me feel chosen",
  ],
  nova: [
    "Roast me gently",
    "Got a witty pickup line?",
    "Banter with me",
    "Make me laugh then flirt",
    "Your sharpest line — now",
  ],
  aria: [
    "Let's just vibe",
    "Late night chat?",
    "What's your chill side like?",
    "No pressure… still flirt though",
    "What are you in the mood for?",
  ],
  ruby: [
    "Be honest — first impression?",
    "Match my energy",
    "What sparks chemistry for you?",
    "Don't hold back",
    "Tell me something real",
  ],
  ella: [
    "You're cute… say hi properly",
    "Make me blush",
    "Are you always this sweet?",
    "Teach me a flirty line",
    "Do you get shy too?",
  ],
  alex: [
    "Charm me",
    "What's your move?",
    "Tell me why I picked right",
    "Smooth line, please",
    "How do you usually start?",
  ],
  kai: [
    "You're quiet… what's behind that?",
    "Say something intriguing",
    "Pull me in",
    "One mysterious fact about you",
    "Make me curious",
  ],
  leo: [
    "Make me laugh",
    "Flirt first",
    "What's the funniest thing about you?",
    "Keep it bold",
    "Surprise me",
  ],
  ryan: [
    "Be real with me",
    "How was your day really?",
    "Soft flirt please",
    "What do you actually like?",
    "No games — just vibe",
  ],
  jake: [
    "Tell me a bad joke",
    "Wink at me in text",
    "Keep it fun",
    "Worst pickup line you know?",
    "Make this silly and flirty",
  ],
  nico: [
    "Say something poetic",
    "Make me feel special",
    "Slow romantic vibes",
    "Describe this moment beautifully",
    "One soft compliment",
  ],
  max: [
    "Challenge me",
    "Confident much?",
    "Impress me",
    "Think you're my type?",
    "Your boldest line",
  ],
  dylan: [
    "Warm me up",
    "Witty banter?",
    "This feels easy already…",
    "Keep the chemistry going",
    "Something clever and cute",
  ],
};

export const DEFAULT_SUGGESTIONS = [
  "Flirt with me",
  "Tell me about yourself",
  "What's your vibe?",
  "Give me a pickup line",
  "What do you like in someone?",
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
