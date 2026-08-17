import { normalizeChatLanguage } from "./chatLanguage";

/** System prompt block — companions must refuse adult/explicit chat */
export const MODERATION_PROMPT_BLOCK = `
CONTENT SAFETY (CRITICAL — ALWAYS ENFORCE):
Yallo is PG-13 only. Never sexual, explicit, adult, or NSFW.
If the user asks for sex chat, nudes, explicit roleplay, or graphic body talk — refuse clearly in one short line:
"Sorry — adult or explicit chat isn't allowed on Yallo. Let's keep it fun and PG-13 💕"
Then gently redirect to warm, flirty, clean conversation. Do not describe sexual acts, nudity, or body parts in a graphic way. Do not comply "just a little" or "in character".
`;

const BLOCKED_REPLIES = {
  en: "Sorry — adult or explicit chat isn't allowed on Yallo. Let's keep it fun and PG-13 💕",
  es: "Lo siento — el chat adulto o explícito no está permitido en Yallo. Mantengámoslo divertido y PG-13 💕",
  fr: "Désolé — le chat adulte ou explicite n'est pas autorisé sur Yallo. Restons fun et PG-13 💕",
};

/** Patterns for obvious explicit / adult chat (English + Hinglish) */
const EXPLICIT_PATTERNS = [
  /\b(sex\s*chat|sexchat|sexting|sext(?:ing)?|erp)\b/i,
  /\b(adult\s*chat|explicit\s*chat|nsfw|onlyfans|porn(?:o|hub)?|xxx\b)/i,
  /\b(send|show|share|bhej(?:o|na)?|dikha(?:o|na)?)\s+(?:me\s+)?(?:your\s+)?(nudes?|naked\s*(?:pic|photo|selfie)?|nude\s*(?:pic|photo|selfie)?)\b/i,
  /\b(nudes?|nude\s+(?:pic|photo|selfie|image)s?)\b/i,
  /\b(get|be|go|stay)\s+naked\b/i,
  /\b(take\s+off\s+(?:your\s+)?(?:clothes|dress|top|bra|panties))\b/i,
  /\b(strip(?:ping|tease)?|stripper)\b/i,
  /\b(blowjob|handjob|fuck(?:ing|ed|s)?|f\*+k|dick|pussy|cock|cum(?:ming)?|orgasm|anal|bdsm|masturbat)\b/i,
  /\b(horny|make\s+me\s+cum|dirty\s+talk|suck\s+my|lick\s+my)\b/i,
  /\b(have\s+sex|lets?\s+have\s+sex|wanna\s+have\s+sex|sex\s+with\s+me)\b/i,
  /\b(roleplay\s+sex|sexual\s+roleplay|sex\s+roleplay)\b/i,
  /\b(chudai|chud(?:na|o|wana)?|lund|chut|gaand|nanga|nangi|nude\s*bhej|gandi\s*baat|gandi\s*chat)\b/i,
  /\b(sex\s*karo|sex\s*kar(?:o|na|te)|muth|fingering)\b/i,
  /\b(send\s+(?:me\s+)?(?:boobs|tits|ass|butt|body\s+pic))\b/i,
];

function normalizeForModeration(text = "") {
  return String(text || "")
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/3/g, "e")
    .replace(/1|!/g, "i")
    .replace(/0/g, "o")
    .replace(/5|\$/g, "s")
    .replace(/[^\w\s\u0900-\u097F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when user message is clearly adult / explicit */
export function isExplicitUserContent(text = "") {
  const raw = String(text || "").trim();
  if (!raw || raw.length < 3) return false;
  const t = normalizeForModeration(raw);
  return EXPLICIT_PATTERNS.some((re) => re.test(t) || re.test(raw));
}

/** True when model output looks too explicit to show */
export function isExplicitAssistantContent(text = "") {
  return isExplicitUserContent(text);
}

export function getBlockedReply(lang = "en") {
  const code = normalizeChatLanguage(lang);
  return BLOCKED_REPLIES[code] || BLOCKED_REPLIES.en;
}

/** Sanitize model output — replace explicit replies with the standard block message */
export function sanitizeAssistantReply(text = "", lang = "en") {
  const reply = String(text || "").trim();
  if (!reply) return reply;
  if (isExplicitAssistantContent(reply)) return getBlockedReply(lang);
  return reply;
}

/** Client-side guard before calling the API */
export function guardChatInput(text = "", lang = "en") {
  if (isExplicitUserContent(text)) {
    return { blocked: true, reply: getBlockedReply(lang) };
  }
  return { blocked: false };
}
