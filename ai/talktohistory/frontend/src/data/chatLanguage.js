import { getActiveUserId } from "./accounts";

export const CHAT_LANGUAGES = {
  en: { id: "en", label: "English", speech: "en-US", name: "English" },
  es: { id: "es", label: "Español", speech: "es-ES", name: "Spanish" },
  fr: { id: "fr", label: "Français", speech: "fr-FR", name: "French" },
};

export const APP_LANGS = ["en", "es", "fr"];

export const SESSION_LANG_KEY = "yallo:chat_language";

export function normalizeChatLanguage(lang) {
  if (APP_LANGS.includes(lang)) return lang;
  return "en";
}

export function readStoredLanguage() {
  try {
    const session = sessionStorage.getItem(SESSION_LANG_KEY);
    if (session) return normalizeChatLanguage(session);
  } catch {
    /* ignore */
  }
  return null;
}

/** Persist active portal/chat language for this browser tab */
export function persistChatLanguage(lang) {
  const next = normalizeChatLanguage(lang);
  try {
    sessionStorage.setItem(SESSION_LANG_KEY, next);
  } catch {
    /* ignore */
  }
  return next;
}

/**
 * Chat/voice language for API and TTS.
 * Logged-in: saved profile. Guest: navbar toggle (session), then default English.
 */
export function getChatLanguage(profile) {
  if (getActiveUserId()) {
    return normalizeChatLanguage(profile?.chatLanguage || "en");
  }
  return readStoredLanguage() || normalizeChatLanguage(profile?.chatLanguage || "en");
}

/** Portal UI language on load — syncs session to profile when logged in */
export function resolveAppLanguage(profile) {
  if (getActiveUserId()) {
    const lang = normalizeChatLanguage(profile?.chatLanguage || "en");
    persistChatLanguage(lang);
    return lang;
  }
  return readStoredLanguage() || normalizeChatLanguage(profile?.chatLanguage || "en");
}

export function getSpeechRecognitionLang(profile) {
  const code = getChatLanguage(profile);
  return CHAT_LANGUAGES[code]?.speech || CHAT_LANGUAGES.en.speech;
}

export function getLanguagePromptBlock(lang) {
  const code = normalizeChatLanguage(lang);
  if (code === "es") {
    return `LANGUAGE — SPANISH (REQUIRED, NEVER BREAK):
Write EVERY message ONLY in natural conversational Spanish (español). Every word must be Spanish.
If the user writes in English, Hindi, Hinglish, or any other language, understand them but STILL reply in Spanish.
Never mix languages. Never add an English or Hindi sentence. Never Hinglish.
Keep flirtation warm and natural — not stiff textbook Spanish.`;
  }
  if (code === "fr") {
    return `LANGUAGE — FRENCH (REQUIRED, NEVER BREAK):
Write EVERY message ONLY in natural conversational French (français). Every word must be French.
If the user writes in English, Hindi, Hinglish, or any other language, understand them but STILL reply in French.
Never mix languages. Never add an English or Hindi sentence. Never Hinglish.
Keep flirtation warm and natural — not stiff textbook French.`;
  }
  return `LANGUAGE — ENGLISH:
Reply in natural conversational English. If the user writes in another language, understand them but reply in English unless they ask to switch.`;
}

export function getPhotoReactPrompt(lang, { room = false, caption = "" } = {}) {
  const code = normalizeChatLanguage(lang);
  const cap = String(caption || "").trim();
  if (code === "es") {
    if (cap) {
      return room
        ? `Compartí una foto y dije: "${cap}". Reaccionad como grupo — coqueto y corto. SOLO en español.`
        : `Compartí una foto y dije: "${cap}". Reacciona con calidez. SOLO en español.`;
    }
    return room
      ? "Acabo de compartir una foto con el grupo. Reacciona con calidez y coqueteo — corto, SOLO en español."
      : "Acabo de compartir una foto contigo. Reacciona de forma coqueta y cálida — corto, SOLO en español.";
  }
  if (code === "fr") {
    if (cap) {
      return room
        ? `J'ai partagé une photo et j'ai dit : "${cap}". Réagissez en groupe — flirty et court. UNIQUEMENT en français.`
        : `J'ai partagé une photo et j'ai dit : "${cap}". Réagis avec chaleur. UNIQUEMENT en français.`;
    }
    return room
      ? "Je viens de partager une photo avec le groupe. Réagis avec chaleur et flirt — court, UNIQUEMENT en français."
      : "Je viens de partager une photo avec toi. Réagis de façon flirteuse et chaleureuse — court, UNIQUEMENT en français.";
  }
  if (cap) {
    return room
      ? `I shared a photo and said: "${cap}". React as a group — keep it flirty and short.`
      : `I shared a photo and said: "${cap}". React warmly.`;
  }
  return room
    ? "I just shared a photo with the room. React warmly and flirty — keep it short."
    : "I just shared a photo with you. React to it in a flirty, warm way — keep it short.";
}

export function getRoomJoinIntroPrompt(lang, { themeName, others, displayName }) {
  const code = normalizeChatLanguage(lang);
  const group = others || (code === "es" ? "el grupo" : code === "fr" ? "le groupe" : "the group");
  if (code === "es") {
    return `Acabas de entrar a este chat de grupo coqueto (${themeName}). Otros aquí: ${group}. El nombre del usuario es ${displayName}. Saluda, preséntate breve y súbete a lo que están hablando. Juguetón, PG-13, 1–3 frases. No hables por nadie más. Responde SOLO en español.`;
  }
  if (code === "fr") {
    return `Tu viens d'entrer dans ce chat de groupe flirty (${themeName}). Les autres ici : ${group}. Le prénom de l'utilisateur est ${displayName}. Dis salut, présente-toi brièvement et rejoins la conversation. Ludique, PG-13, 1–3 phrases. Ne parle pour personne d'autre. Réponds UNIQUEMENT en français.`;
  }
  return `You just walked into this flirty group chat (${themeName}). Others here: ${group}. The user's name is ${displayName}. Say hi, introduce yourself briefly, and jump into the vibe of what they've been chatting about. Keep it playful, PG-13, 1–3 sentences. Do not speak for anyone else.`;
}

export function getRoomJoinFallback(lang, name) {
  const code = normalizeChatLanguage(lang);
  if (code === "es") return `Hola… soy ${name}. Acabo de entrar — ¿qué me perdí?`;
  if (code === "fr") return `Salut… c'est ${name}. Je viens d'entrer — j'ai raté quoi ?`;
  return `Hey… I'm ${name}. Just slipped into the room — what'd I miss?`;
}

export function getSuggestionFallbacks(lang) {
  const code = normalizeChatLanguage(lang);
  if (code === "es") {
    return ["Cuéntame más de eso", "Eres lindo/a cuando dices eso", "Vale… ahora te toca preguntarme"];
  }
  if (code === "fr") {
    return ["Dis-m'en plus là-dessus", "T'es mignon·ne quand tu dis ça", "Ok… à toi de me poser une question"];
  }
  return ["Tell me more about that", "You're cute when you say that", "Okay… your turn to ask me something"];
}

export function buildIntroGreetingForLanguage(character, profile, lang) {
  const code = normalizeChatLanguage(lang ?? getChatLanguage(profile));
  const display = (profile?.nickname || profile?.name || "").trim();
  const name = typeof character === "string" ? character : character?.name || "";
  const first = name.split(/\s+/)[0] || name;

  if (code === "es") {
    if (display) {
      return `Hola ${display}… soy ${first}. Me alegra que estés aquí — ¿cómo estás? 💕`;
    }
    return `Hola… soy ${first}. Me alegra que estés aquí — ¿cómo estás?`;
  }

  if (code === "fr") {
    if (display) {
      return `Salut ${display}… c'est ${first}. Content·e que tu sois là — comment tu vas ? 💕`;
    }
    return `Salut… c'est ${first}. Content·e que tu sois là — comment tu vas ?`;
  }

  return null;
}

export function buildRoomGreetingForLanguage(members, displayName, lang) {
  const code = normalizeChatLanguage(lang);
  const host = members[0]?.name || "us";
  const other = members[1]?.name;
  const who = displayName || "";

  if (code === "es") {
    if (who && other) {
      return `Hola ${who} — soy ${host}. ${other} también está aquí. ¿Cómo va tu noche?`;
    }
    if (who) return `¡Hola ${who}! Soy ${host}. Me alegra que entraras — ¿cómo estás?`;
    if (other) return `¡Hola! Soy ${host}. ${other} también está aquí. ¿Cómo va tu noche?`;
    return `¡Hola! Soy ${host}. Siéntate con nosotros — ¿cómo estás?`;
  }

  if (code === "fr") {
    if (who && other) {
      return `Salut ${who} — c'est ${host}. ${other} est là aussi. Comment se passe ta soirée ?`;
    }
    if (who) return `Salut ${who} ! C'est ${host}. Content·e que tu sois là — comment tu vas ?`;
    if (other) return `Salut ! C'est ${host}. ${other} est là aussi. Comment se passe ta soirée ?`;
    return `Salut ! C'est ${host}. Installe-toi avec nous — comment tu vas ?`;
  }

  return null;
}
