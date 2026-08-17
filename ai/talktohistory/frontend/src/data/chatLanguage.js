import { getActiveUserId } from "./accounts";

export const CHAT_LANGUAGES = {
  en: { id: "en", label: "English", speech: "en-US", name: "English" },
  es: { id: "es", label: "Español", speech: "es-ES", name: "Spanish" },
  fr: { id: "fr", label: "Français", speech: "fr-FR", name: "French" },
};

/** Visible language picker. Spanish and French are hidden for now. */
export const APP_LANGS = ["en"];

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
    return `LANGUAGE — SPANISH (REQUIRED):
Reply ONLY in natural conversational Spanish (español). Every message must be in Spanish.
If the user writes in English, understand them but still reply in Spanish unless they ask to switch to English.
Keep flirtation warm and natural — not stiff textbook Spanish.`;
  }
  if (code === "fr") {
    return `LANGUAGE — FRENCH (REQUIRED):
Reply ONLY in natural conversational French (français). Every message must be in French.
If the user writes in English, understand them but still reply in French unless they ask to switch to English.
Keep flirtation warm and natural — not stiff textbook French.`;
  }
  return `LANGUAGE — ENGLISH:
Reply in natural conversational English. If the user writes in another language, understand them but reply in English unless they ask to switch.`;
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
