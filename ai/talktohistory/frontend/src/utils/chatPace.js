/** Realistic chat pace: hold the typing indicator ~3–4s before the bubble appears. */
export function humanReplyDelayMs() {
  return 3000 + Math.floor(Math.random() * 1000);
}

/** Wait until `startedAt + delayMs` (no-op if already past). */
export async function waitHumanReplyPace(startedAt, delayMs = humanReplyDelayMs()) {
  const left = delayMs - (Date.now() - startedAt);
  if (left > 40) {
    await new Promise((r) => setTimeout(r, left));
  }
}

/**
 * Keep model replies short like real texting (1–2 lines / ~140 chars).
 */
export function clipChatReply(text = "", { maxSentences = 2, maxChars = 140 } = {}) {
  let t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return t;

  // Prefer sentence boundaries
  const parts = t.split(/(?<=[.!?…])\s+/).filter(Boolean);
  if (parts.length > maxSentences) {
    t = parts.slice(0, maxSentences).join(" ").trim();
  }

  // Also cap by newlines (model sometimes dumps paragraphs)
  const lines = t.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > maxSentences) {
    t = lines.slice(0, maxSentences).join(" ").trim();
  }

  if (t.length > maxChars) {
    const cut = t.slice(0, maxChars);
    const sp = cut.lastIndexOf(" ");
    t = (sp > 50 ? cut.slice(0, sp) : cut).trim();
    if (!/[.!?…]$/.test(t)) t = `${t}…`;
  }
  return t;
}
