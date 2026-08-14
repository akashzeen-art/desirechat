export const IDLE_NUDGE_MS = 2 * 60 * 1000;

const IDLE_NUDGE_LINES = [
  "Hey… what happened? You went quiet on me. Is your mood not good? I'm here if you want to talk 💕",
  "Still there? I noticed you paused — everything okay? You don't have to explain, just know I'm here.",
  "Hello? I saw you go silent for a bit… rough day? Tell me what's on your mind, or we can just sit together.",
  "Hey, you okay? You stopped replying and I got a little worried. Want to share what's going on?",
  "Where'd you go? I hope you're alright. If something's bothering you, I'm listening — no pressure.",
  "You went quiet… is something wrong? I'm not going anywhere. Talk to me when you're ready 💗",
];

export function pickIdleGameNudge() {
  return IDLE_NUDGE_LINES[Math.floor(Math.random() * IDLE_NUDGE_LINES.length)];
}
