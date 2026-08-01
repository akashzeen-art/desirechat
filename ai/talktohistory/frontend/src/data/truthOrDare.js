/** Soft PG-13 Truth or Dare prompts for flirt chat */

export const TRUTHS = [
  "What's your biggest green flag in someone?",
  "Have you ever had a crush on a voice before a face?",
  "What's a compliment you secretly love getting?",
  "What's your go-to flirty text opener?",
  "What's one thing that always makes you smile?",
  "Are you more soft romance or playful teasing?",
  "What's your love language — honestly?",
  "What's the cutest way someone could get your attention?",
  "Do you fall for humor or confidence first?",
  "What's a secret talent of yours?",
];

export const DARES = [
  "Give me your best pickup line right now.",
  "Compliment me in the most dramatic way possible.",
  "Describe our chat like a movie trailer.",
  "Send a flirty voice-style line (in text) in all caps.",
  "Rate this convo 1–10 and explain why.",
  "Ask me a bold question — keep it fun.",
  "Make up a cute nickname for me.",
  "Tell me a two-line love poem on the spot.",
  "Act like we just matched — restart the vibe.",
  "Challenge me to something silly and flirty.",
];

export function randomTruth() {
  return TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
}

export function randomDare() {
  return DARES[Math.floor(Math.random() * DARES.length)];
}

export function truthOrDareSystemNote() {
  return `TRUTH OR DARE MODE is ON.
If the user picks Truth, ask a fun, flirty, PG-13 truth question or react to their answer warmly.
If the user picks Dare, give a playful PG-13 dare or react when they complete it.
Keep it light, teasing, and encouraging. Never NSFW.`;
}
