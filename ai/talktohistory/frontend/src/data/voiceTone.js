/**
 * OpenAI TTS voice IDs + speed per region/gender/vibe.
 * Persona + accent instructions live in characterVoice.js.
 */
import {
  buildTtsInstructions,
  ensureGenderInstructions,
  resolveCharacterProfile,
  getCharacterVoiceOpts,
  resolveCharacterVoice,
  GIRL_REGION_CHAT,
  detectIndianGirlEmotion,
  getIndianGirlTtsSpeed,
  buildIndianGirlTtsInstructions,
  prepareIndianGirlSpeakText,
} from "./characterVoice";
import { normalizeChatLanguage } from "./chatLanguage";

export {
  getCharacterVoiceOpts,
  resolveCharacterVoice,
  resolveCharacterProfile,
  ensureGenderInstructions,
  getRegionChatNote,
  GIRL_REGION_CHAT,
  BOY_REGION_CHAT,
  detectIndianGirlEmotion,
  getIndianGirlTtsSpeed,
  prepareIndianGirlSpeakText,
} from "./characterVoice";

export function getGirlRegionChatNote(region) {
  return GIRL_REGION_CHAT[region] || GIRL_REGION_CHAT.european;
}

export function getVibeChatNote(vibe) {
  const map = {
    sweet: "Sweet: Soft smile in the voice/text, caring and friendly.",
    bold: "Bold: Confident, teasing, slightly flirty but classy.",
    funny: "Funny: Playful, cheeky, quick reactions.",
  };
  return map[vibe] || map.sweet;
}

/**
 * @deprecated use buildTtsInstructions(resolveCharacterProfile(character))
 */
export function getTtsInstructions({ gender = "female", region = "european", vibe = "sweet", characterName = "", profile = null } = {}) {
  if (profile) return buildTtsInstructions(profile);
  if (characterName) {
    return buildTtsInstructions(
      resolveCharacterProfile({
        name: characterName,
        gender,
        region,
        vibeId: vibe,
      })
    );
  }
  return buildTtsInstructions(resolveCharacterProfile({ gender, region, vibeId: vibe, name: "Companion" }));
}

/** OpenAI voice + speed tuned per region / vibe / gender */
export function getTtsVoiceConfig(opts = {}) {
  const {
    gender = "female",
    region = "european",
    vibe = "sweet",
    characterName = "",
    profile = null,
    chatLanguage = "en",
    text = "",
  } = opts;

  const vibeSpeed = { sweet: -0.02, bold: 0.04, funny: 0.05 }[vibe] || 0;

  // Clearly feminine OpenAI voices only — never alloy (androgynous) for women
  const femaleBase = {
    // Prefer brighter feminine OpenAI voices — slightly faster for natural chat pace
    indian:    { voice: "nova",    speed: 0.98 },
    pakistani: { voice: "shimmer", speed: 0.97 },
    afghani:   { voice: "shimmer", speed: 0.95 },
    srilankan: { voice: "nova",    speed: 1.00 },
    african:   { voice: "nova",    speed: 0.99 },
    asian:     { voice: "shimmer", speed: 1.02 },
    chinese:   { voice: "nova",    speed: 1.01 },
    european:  { voice: "nova",    speed: 1.01 },
  };

  const maleBase = {
    indian:    { voice: "echo",  speed: 0.98 },
    pakistani: { voice: "onyx",  speed: 0.96 },
    afghani:   { voice: "ash",   speed: 0.93 },
    srilankan: { voice: "fable", speed: 0.99 },
    african:   { voice: "onyx",  speed: 0.97 },
    asian:     { voice: "echo",  speed: 1.02 },
    chinese:   { voice: "fable", speed: 1.01 },
    european:  { voice: "verse", speed: 1.01 },
  };

  const base =
    (gender === "female" ? femaleBase : maleBase)[region] ||
    (gender === "female" ? femaleBase.european : maleBase.european);

  const classicFallback = {
    sage: "nova", coral: "nova", alloy: "nova", ash: "onyx", ballad: "fable", verse: "echo", shimmer: "nova",
  };

  const resolvedProfile =
    profile ||
    (characterName
      ? resolveCharacterProfile({ name: characterName, gender, region, vibeId: vibe })
      : null);

  const lang = normalizeChatLanguage(chatLanguage);
  // India female + English only: emotion → speed + modulation instructions
  const isIndianGirl = region === "indian" && gender === "female" && lang === "en";
  const emotion = isIndianGirl ? detectIndianGirlEmotion(text, vibe) : null;
  const speed = isIndianGirl
    ? getIndianGirlTtsSpeed(vibe, emotion)
    : Math.min(1.2, Math.max(0.8, +(base.speed + vibeSpeed).toFixed(2)));

  const instructions = isIndianGirl && resolvedProfile
    ? buildIndianGirlTtsInstructions(resolvedProfile, emotion)
    : resolvedProfile
      ? buildTtsInstructions(resolvedProfile, chatLanguage, text)
      : ensureGenderInstructions(resolveCharacterProfile({ gender, region, vibeId: vibe }), chatLanguage);

  return {
    voice: base.voice,
    classicVoice: classicFallback[base.voice] || base.voice,
    speed,
    emotion: emotion || undefined,
    instructions,
  };
}
