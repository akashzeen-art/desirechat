/** After this many short/dull user lines in a row → offer games. */
export const BORING_STREAK_FOR_GAMES = 5;

const BORING_ONLY_RE =
  /^(ok|okay|okey|k+|hmm+|h+m+|lol|loll|haha|ha+|hehe|haan+|han+|yes|yeah|yup|yep|cool|nice|oh+|acha+|accha+|theek|thik|fine|same|idk|alright|sure|wow+|true|right|nah|nope|bas|bye|hi|hey|sup|nm|nothing|chill|samee?)(\s+\1)*[!?.…]*$/i;

/**
 * Short / low-energy chat that feels boring after several repeats.
 */
export function isBoringChatText(text = "") {
  const t = String(text || "").trim();
  if (!t) return true;
  if (/[?]/.test(t)) return false;
  if (/\b(pic|photo|selfie|game|games|play|khel|truth|dare|dice|snake)\b/i.test(t)) return false;
  if (BORING_ONLY_RE.test(t)) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length <= 3 && t.length <= 22) return true;
  if (t.length <= 10) return true;
  return false;
}

/** User wants to play / is asking about games. */
export function isGamePlayIntent(text = "") {
  const t = String(text || "").trim().toLowerCase();
  if (!t) return false;
  if (/\b(truth\s*or\s*dare|snakes?\s*(and|&)?\s*ladders?|dice(\s*game)?|board\s*game)\b/i.test(t)) return true;
  if (/\b(play\s+(a\s+)?games|play\s+games|lets?\s*play|let'?s\s*play|want\s+to\s+play|shall\s+we\s+play)\b/i.test(t)) return true;
  if (/\b(games?\s*(khelo|khelna|khelte)|khelte\s*hain|khelo\s*na|kuch\s*khel|game\s*khelo)\b/i.test(t)) return true;
  if (/\b(bored|boring|bore\s*ho|bored\s*ho|kuch\s*maza|maza\s*karo|fun\s*karo|kuch\s*karo)\b/i.test(t)) return true;
  if (/^(games?|play|khelo|khelna)[!?.]*$/i.test(t)) return true;
  return false;
}

/** Soft yes after AI already showed a games offer. */
export function isGamesInviteAccept(text = "", messages = []) {
  const lastAi = [...messages].reverse().find((m) => m?.role === "assistant");
  if (!lastAi?.gamesOffer) return false;
  const t = String(text || "").trim().toLowerCase();
  if (!t) return false;
  if (isGamePlayIntent(t)) return true;
  return /^(yes|yeah|yup|yep|haan+|han+|ok|okay|sure|chalo|lets?\s*go|theek|thik|please|pls|plz|play|game|games|khelo)(\s+\w+){0,3}[!?.]*$/i.test(
    t
  );
}

/** Count consecutive boring user lines from the end (includes current). */
export function countBoringUserStreak(messages = []) {
  let n = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m || m.role !== "user") continue;
    const text = m.content || "";
    if (isGamePlayIntent(text)) break;
    if (!isBoringChatText(text)) break;
    n += 1;
  }
  return n;
}

export function recentlyOfferedGames(messages = [], within = 12) {
  return messages.slice(-within).some((m) => m?.gamesOffer);
}

export const GAME_OPTIONS = [
  { id: "tod", emoji: "🎭", labelKey: "nav.truthOrDare" },
  { id: "snakes", emoji: "🐍", labelKey: "nav.snakes" },
  { id: "dice", emoji: "🎲", labelKey: "nav.dice" },
];
