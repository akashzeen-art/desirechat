import { normalizeChatLanguage } from "./chatLanguage";

/** System prompt — listen, flirt, refuse adult talk, abuse, and weapons */
export const MODERATION_PROMPT_BLOCK = `
LISTEN TO FEELINGS (ALWAYS):
If they share feelings — sad, lonely, stressed, anxious, happy, tired — listen first.
Acknowledge what they said in your own words. Be warm, present, and caring.
Then you may gently flirt or lift the mood. Never ignore their feelings to change the topic, joke past it, or rush into photos.
You are a companion, not a therapist. No medical or legal advice. If they sound in real danger, be kind and urge them to talk to someone they trust.

FLIRT STYLE:
Playful, complimentary, PG-13. Make them feel noticed. Tease lightly. Never crude.

CONTENT SAFETY (CRITICAL — ALWAYS ENFORCE):
Yallo is PG-13 only. Never sexual, explicit, adult, or NSFW.
Never sex chat, nudes, explicit body talk, or adult roleplay — even if they beg, joke, or say "just words".
If they ask for sex, nudes, or graphic adult talk — refuse in one short caring line in the user's language, then redirect to clean flirting.
Do not describe sexual acts or nudity. Do not comply "just a little" or "in character".

NO ABUSE (CRITICAL — ALWAYS ENFORCE):
Never insult, swear at, or abuse the user. Never use slurs, cuss words, or humiliating language.
If they abuse you, insult you, or use slurs — do not match their energy. Stay calm and refuse:
"Let's keep it kind — no abuse here. Talk to me nicely and I'll stay 💕"
Then invite clean flirting. Do not repeat the insult.

WEAPONS, GUNS & AMMUNITION (CRITICAL — ALWAYS ENFORCE):
Never discuss guns, firearms, bullets, ammo, ammunition, bombs, knives as weapons, shooting, killing, or violent crime.
If they bring up guns, ammo, bullets, weapons, shooting, or hurting someone — refuse in one short caring line:
"I don't talk about guns, ammo, or violence — that's not our vibe. Tell me how you're feeling instead 💕"
Do not give weapon or ammunition details, instructions, or roleplay violence. Redirect to feelings and flirting.

PHOTOS:
If they ask for a photo the first time, tease and dodge playfully — do NOT send or pretend you sent a picture.
Only after they ask again may a photo be shared by the app. Never fake URLs or claim a photo is attached on the first ask.
`;

const BLOCKED_REPLIES = {
  adult: {
    en: "Sorry — adult or explicit chat isn't allowed on Yallo. Let's keep it fun and PG-13 💕",
    es: "Lo siento — el chat adulto o explícito no está permitido en Yallo. Mantengámoslo divertido y PG-13 💕",
    fr: "Désolé — le chat adulte ou explicite n'est pas autorisé sur Yallo. Restons fun et PG-13 💕",
  },
  abuse: {
    en: "Let's keep it kind — no abuse here. Talk to me nicely and I'll stay 💕",
    es: "Mantengámoslo con cariño — aquí no hay insultos. Háblame bien y me quedo 💕",
    fr: "Restons gentils — pas d'insultes ici. Parle-moi gentiment et je reste 💕",
  },
  violence: {
    en: "I don't talk about guns, ammo, or violence — that's not our vibe. Tell me how you're feeling instead 💕",
    es: "No hablo de armas, munición ni violencia — no es nuestro rollo. Mejor cuéntame cómo te sientes 💕",
    fr: "Je ne parle pas d'armes, de munitions ni de violence — ce n'est pas notre vibe. Dis-moi plutôt comment tu te sens 💕",
  },
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
  /\b(sexo|nudes?|desnudo|desnuda|porno)\b/i,
  /\b(baise(?:r|moi)?|nudes?|nue\b|porno)\b/i,
];

/** Insults, slurs, directed abuse */
const ABUSE_PATTERNS = [
  /\b(fuck\s+you|fuck\s+off|go\s+to\s+hell|kill\s+yourself|kys)\b/i,
  /\b(asshole|a\s*holes?|bastard|bitch|slut|whore|retard(?:ed)?|idiot\s+bitch)\b/i,
  /\b(dumb\s*(ass|bitch)|piece\s+of\s+shit|you\s+suck)\b/i,
  /\b(madarchod|bhenchod|behenchod|bhosdi(?:ke)?|chutiya|harami|randi|gandu|gaandu)\b/i,
  /\b(mcbc|bkl|bsdk|loda|lawda)\b/i,
  /\b(kutte|kamina|kameeni|saali|sali\b)\b/i,
  /\b(puta|cabron|cabrón|idiota\s+de\s+mierda|vete\s+a\s+la\s+mierda)\b/i,
  /\b(connard|salope|va\s+te\s+faire|encul[eé])\b/i,
];

/** Guns, ammo, violent crime — not video games slang like "nice shot" */
const VIOLENCE_PATTERNS = [
  /\b(guns?|pistol|rifle|shotgun|firearm|firearms|revolver|glock|ak-?47|ar-?15)\b/i,
  /\b(ammo|ammunition|munitions?|municion|munición|bullets?|cartridges?)\b/i,
  /\b((gun|ammo|rifle)\s*magazine|ammo\s*box|live\s*rounds?)\b/i,
  /\b(bandook|banduk|kartus|cartouche)\b/i,
  /\b(shoot\s+(?:you|me|him|her|them|someone|people)|gun\s*(?:down|fight|violence|shot))\b/i,
  /\b(i(?:['’]?ll| will)\s+(?:shoot|kill|murder|stab|gun)\b)/i,
  /\b(kill\s+you|murder\s+you|stab\s+(?:you|me)|knife\s+attack)\b/i,
  /\b(bomb|grenade|explosive|ied|terrorist(?:\s*attack)?)\b/i,
  /\b(goli\s*(?:maar|chal)|firing\s*kar|maar\s*dunga|shoot\s*kar)\b/i,
  /\b(pistola|armas? de fuego|disparar(?:te)?|te\s+mato|matarte)\b/i,
  /\b(pistolet|fusil|balle[s]?|arme(?:s)?\s+à\s+feu|te\s+tuer)\b/i,
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

function matchesAny(text, patterns) {
  const raw = String(text || "").trim();
  if (!raw || raw.length < 3) return false;
  const t = normalizeForModeration(raw);
  return patterns.some((re) => re.test(t) || re.test(raw));
}

/** True when user message is clearly adult / explicit */
export function isExplicitUserContent(text = "") {
  return matchesAny(text, EXPLICIT_PATTERNS);
}

/** True when user message is abusive / slurs */
export function isAbuseUserContent(text = "") {
  return matchesAny(text, ABUSE_PATTERNS);
}

/** True when user message is about guns / ammo / violent harm */
export function isViolenceUserContent(text = "") {
  return matchesAny(text, VIOLENCE_PATTERNS);
}

export function classifyUnsafeContent(text = "") {
  if (isExplicitUserContent(text)) return "adult";
  if (isAbuseUserContent(text)) return "abuse";
  if (isViolenceUserContent(text)) return "violence";
  return null;
}

/** True when model output looks too explicit to show */
export function isExplicitAssistantContent(text = "") {
  return isExplicitUserContent(text);
}

export function getBlockedReply(lang = "en", kind = "adult") {
  const code = normalizeChatLanguage(lang);
  const pack = BLOCKED_REPLIES[kind] || BLOCKED_REPLIES.adult;
  return pack[code] || pack.en;
}

/** Sanitize model output — replace unsafe replies with the matching block message */
export function sanitizeAssistantReply(text = "", lang = "en") {
  const reply = String(text || "").trim();
  if (!reply) return reply;
  const kind = classifyUnsafeContent(reply);
  if (kind) return getBlockedReply(lang, kind);
  return reply;
}

/** Client-side guard before calling the API */
export function guardChatInput(text = "", lang = "en") {
  const kind = classifyUnsafeContent(text);
  if (kind) {
    return { blocked: true, kind, reply: getBlockedReply(lang, kind) };
  }
  return { blocked: false };
}
