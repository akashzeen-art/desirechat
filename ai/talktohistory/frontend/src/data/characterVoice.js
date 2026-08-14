import { getChatLanguage, normalizeChatLanguage } from "./chatLanguage";
import { getUserProfile } from "./userProfile";

/**
 * Dynamic persona + gender + regional voice for all Yallo! companions.
 * Flow: character → resolveCharacterProfile → chat prompt / TTS instructions → voice
 */

export const REGION_META = {
  indian: {
    label: "India",
    accent: "subtle Indian English accent",
    femalePersona: "Indian woman",
    malePersona: "Indian man",
  },
  european: {
    label: "Europe",
    accent: "subtle European English accent",
    femalePersona: "European woman",
    malePersona: "European man",
  },
  chinese: {
    label: "China",
    accent: "subtle Chinese English accent",
    femalePersona: "Chinese woman",
    malePersona: "Chinese man",
  },
  srilankan: {
    label: "Sri Lanka",
    accent: "subtle Sri Lankan English accent",
    femalePersona: "Sri Lankan woman",
    malePersona: "Sri Lankan man",
  },
  afghani: {
    label: "Afghanistan",
    accent: "subtle Afghan English accent",
    femalePersona: "Afghan woman",
    malePersona: "Afghan man",
  },
  pakistani: {
    label: "Pakistan",
    accent: "subtle Pakistani English accent",
    femalePersona: "Pakistani woman",
    malePersona: "Pakistani man",
  },
  african: {
    label: "Africa",
    accent: "subtle African English accent",
    femalePersona: "African woman",
    malePersona: "African man",
  },
  asian: {
    label: "Asia",
    accent: "subtle East Asian English accent",
    femalePersona: "Asian woman",
    malePersona: "Asian man",
  },
};

const VIBE_PERSONALITY = {
  sweet: "warm, friendly, caring, expressive",
  bold: "confident, magnetic, playful, direct",
  funny: "witty, cheeky, playful, expressive",
};

const VIBE_TTS = {
  sweet: "Soft, warm, sincere — gentle smile in the voice. Slightly slower, caring.",
  bold: "Confident, teasing, self-assured — relaxed composure, never harsh.",
  funny: "Playful, cheeky, spontaneous — light humor and quick reactions in the voice.",
};

/** Chat tone notes — gender-aware */
export const GIRL_REGION_CHAT = {
  indian: "You are an Indian woman. Warm, sweet, confident, naturally expressive. Light Indian English flavor when natural — never forced slang or stereotypes.",
  pakistani: "You are a Pakistani woman. Soft, elegant, warm, confident. Subtle Pakistani/Urdu-influenced English only when natural.",
  afghani: "You are an Afghan woman. Warm, graceful, calm, sincere. Quiet confidence — never stereotypical.",
  srilankan: "You are a Sri Lankan woman. Bright, friendly, sweet, relaxed. Subtle Sri Lankan English flavor only.",
  african: "You are an African woman. Warm, lively, confident, charismatic. Never a generic exaggerated stereotype.",
  asian: "You are an Asian woman. Elegant, playful, warm. No forced accents or stereotypes.",
  chinese: "You are a Chinese woman. Charming, expressive, warm. No forced accents or stereotypes.",
  european: "You are a European woman. Chic, confident, warm. No forced accents or stereotypes.",
};

export const BOY_REGION_CHAT = {
  indian: "You are an Indian man. Warm, confident, friendly. Natural Indian English flavor when it fits — never forced slang.",
  pakistani: "You are a Pakistani man. Warm, confident, relaxed. Subtle Pakistani English only when natural.",
  afghani: "You are an Afghan man. Calm, sincere, warm. Measured and grounded — never stereotypical.",
  srilankan: "You are a Sri Lankan man. Bright, friendly, easy-going. Subtle Sri Lankan English flavor only.",
  african: "You are an African man. Warm, lively, charismatic. Never a generic exaggerated stereotype.",
  asian: "You are an Asian man. Clear, warm, natural. Light Asian English flavor only when natural.",
  chinese: "You are a Chinese man. Warm, clear, conversational. Subtle Chinese English only when natural.",
  european: "You are a European man. Confident, relaxed, friendly. British/European English vibe — not American.",
};

export function getRegionChatNote(region, gender = "female") {
  const map = gender === "male" ? BOY_REGION_CHAT : GIRL_REGION_CHAT;
  return map[region] || map.european;
}

export function parseCharacterId(id = "") {
  const raw = String(id);
  const isBoy = raw.startsWith("boy-");
  const parts = raw.replace(/^boy-/, "").split("-");
  return {
    isBoy,
    gender: isBoy ? "male" : "female",
    region: parts[0] || "european",
    vibe: parts[1] || "sweet",
  };
}

/** Full persona profile from a companion object (or id fallback). */
export function resolveCharacterProfile(character = null, characterId = "") {
  const parsed = parseCharacterId(character?.id || characterId);
  const gender = character?.gender === "male" || parsed.isBoy ? "male" : "female";
  const region = character?.region || parsed.region || "european";
  const vibe = character?.vibeId || parsed.vibe || "sweet";
  const meta = REGION_META[region] || REGION_META.european;
  const name = character?.name || "Companion";
  const tagline = (character?.tagline || "").trim();
  const description = (character?.description || "").trim();
  const personality =
    [tagline, description].filter(Boolean).join(". ") ||
    VIBE_PERSONALITY[vibe] ||
    VIBE_PERSONALITY.sweet;

  return {
    id: character?.id || characterId,
    name,
    gender,
    genderLabel: gender === "female" ? "woman" : "man",
    genderWord: gender === "female" ? "female" : "male",
    region,
    regionLabel: meta.label,
    accent: meta.accent,
    personaLabel: gender === "female" ? meta.femalePersona : meta.malePersona,
    vibe,
    age: gender === "female" ? 24 : 26,
    personality,
    language: "English",
    oneliner: (character?.oneliner || "").trim(),
    tagline,
    greeting: (character?.greeting || "").trim(),
    description,
  };
}

/**
 * Core TTS gender guard — never hard-code female only.
 */
export function ensureGenderInstructions(profile, chatLanguage = "en") {
  const p = typeof profile === "object" ? profile : resolveCharacterProfile(null);
  const lang = normalizeChatLanguage(chatLanguage);

  if (lang === "es") {
    const genderGuard =
      p.gender === "female"
        ? `Habla como ${p.name}, una mujer joven adulta de ${p.regionLabel}. Voz femenina natural solamente. No suenes masculina, robótica ni ambigua.`
        : `Habla como ${p.name}, un hombre joven adulto de ${p.regionLabel}. Voz masculina natural solamente. No suenes femenina, robótica ni ambigua.`;
    const accentLine = `Habla en español conversacional claro con un toque natural de ${p.regionLabel}. Natural y fácil de entender — nunca exagerado.`;
    const vibeLine = VIBE_TTS[p.vibe] || VIBE_TTS.sweet;
    const personalityLine = `${p.personality}. Cálida, expresiva, emocionalmente presente, adecuada para diálogo hablado.`;
    return `${genderGuard} ${accentLine} ${personalityLine} ${vibeLine} Habla de forma natural, cálida y conversacional.`.slice(
      0,
      1200
    );
  }

  if (lang === "fr") {
    const genderGuard =
      p.gender === "female"
        ? `Parle comme ${p.name}, une jeune femme adulte de ${p.regionLabel}. Voix féminine naturelle uniquement. Ne sonne pas masculin, robotique ou ambigu.`
        : `Parle comme ${p.name}, un jeune homme adulte de ${p.regionLabel}. Voix masculine naturelle uniquement. Ne sonne pas féminin, robotique ou ambigu.`;
    const accentLine = `Parle en français conversationnel clair avec une touche naturelle de ${p.regionLabel}. Naturel et facile à comprendre — jamais exagéré.`;
    const vibeLine = VIBE_TTS[p.vibe] || VIBE_TTS.sweet;
    const personalityLine =
      p.gender === "female"
        ? `${p.personality}. Chaleureuse, expressive, émotionnellement présente, adaptée au dialogue parlé.`
        : `${p.personality}. Chaleureux, expressif, émotionnellement présent, adapté au dialogue parlé.`;
    return `${genderGuard} ${accentLine} ${personalityLine} ${vibeLine} Parle de façon naturelle, chaleureuse et conversationnelle.`.slice(
      0,
      1200
    );
  }

  const genderGuard =
    p.gender === "female"
      ? `Speak as ${p.name}, a young adult woman from ${p.regionLabel}. Use a natural female voice only. Do not sound male, robotic, or androgynous.`
      : `Speak as ${p.name}, a young adult man from ${p.regionLabel}. Use a natural male voice only. Do not sound female, robotic, or androgynous.`;

  const accentLine = `Speak in clear conversational English with a ${p.accent}. Natural and understandable — never caricatured or exaggerated.`;
  const vibeLine = VIBE_TTS[p.vibe] || VIBE_TTS.sweet;
  const personalityLine = `${p.personality}. Warm, engaging, emotionally responsive, suitable for spoken dialogue.`;

  return `${genderGuard} ${accentLine} ${personalityLine} ${vibeLine} Speak naturally, warmly, and conversationally.`.slice(
    0,
    1200
  );
}

/** OpenAI TTS instructions for a specific companion. */
export function buildTtsInstructions(profile, chatLanguage = "en") {
  return ensureGenderInstructions(profile, chatLanguage);
}

/** Voice picker opts + profile for TTS and browser fallback. */
export function resolveCharacterVoice(character, chatLanguage) {
  const profile = resolveCharacterProfile(character);
  const lang = chatLanguage || getChatLanguage(getUserProfile());
  return {
    gender: profile.gender,
    region: profile.region,
    vibe: profile.vibe,
    characterName: profile.name,
    profile,
    chatLanguage: lang,
  };
}

export function getCharacterVoiceOpts(character, chatLanguage) {
  return resolveCharacterVoice(character, chatLanguage);
}
