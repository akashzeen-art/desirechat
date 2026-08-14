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
} from "./characterVoice";

export {
  getCharacterVoiceOpts,
  resolveCharacterVoice,
  resolveCharacterProfile,
  ensureGenderInstructions,
  getRegionChatNote,
  GIRL_REGION_CHAT,
  BOY_REGION_CHAT,
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
  } = opts;

  const vibeSpeed = { sweet: -0.05, bold: 0.02, funny: 0.04 }[vibe] || 0;

  const femaleBase = {
    indian:    { voice: "coral",   speed: 0.93 },
    pakistani: { voice: "shimmer", speed: 0.91 },
    afghani:   { voice: "sage",    speed: 0.88 },
    srilankan: { voice: "nova",    speed: 0.95 },
    african:   { voice: "nova",    speed: 0.94 },
    asian:     { voice: "shimmer", speed: 1.0  },
    chinese:   { voice: "coral",   speed: 0.98 },
    european:  { voice: "alloy",   speed: 0.98 },
  };

  const maleBase = {
    indian:    { voice: "echo",  speed: 0.93 },
    pakistani: { voice: "onyx",  speed: 0.90 },
    afghani:   { voice: "ash",   speed: 0.87 },
    srilankan: { voice: "fable", speed: 0.94 },
    african:   { voice: "onyx",  speed: 0.92 },
    asian:     { voice: "echo",  speed: 0.98 },
    chinese:   { voice: "fable", speed: 0.97 },
    european:  { voice: "verse", speed: 0.97 },
  };

  const base =
    (gender === "female" ? femaleBase : maleBase)[region] ||
    (gender === "female" ? femaleBase.european : maleBase.european);

  const classicFallback = {
    sage: "nova", coral: "nova", alloy: "nova", ash: "onyx", ballad: "fable", verse: "echo",
  };

  const speed = Math.min(1.2, Math.max(0.8, +(base.speed + vibeSpeed).toFixed(2)));
  const resolvedProfile =
    profile ||
    (characterName
      ? resolveCharacterProfile({ name: characterName, gender, region, vibeId: vibe })
      : null);

  return {
    voice: base.voice,
    classicVoice: classicFallback[base.voice] || base.voice,
    speed,
    instructions: resolvedProfile
      ? buildTtsInstructions(resolvedProfile, chatLanguage)
      : ensureGenderInstructions(resolveCharacterProfile({ gender, region, vibeId: vibe }), chatLanguage),
  };
}
