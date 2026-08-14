import { translate } from "./translations";
import { localizeCharacter } from "./characterLocale";
import { SHARE_STATUS_KEYS, ROOM_ERROR_KEYS } from "./uiTranslations";
import { SHARE_STATUS_KEYS_FR, ROOM_ERROR_KEYS_FR } from "./uiTranslationsFr";

const ALL_SHARE_STATUS_KEYS = { ...SHARE_STATUS_KEYS, ...SHARE_STATUS_KEYS_FR };
const ALL_ROOM_ERROR_KEYS = { ...ROOM_ERROR_KEYS, ...ROOM_ERROR_KEYS_FR };

export { localizeCharacter };

export function makeT(lang) {
  return (key, vars = {}) => translate(lang, key, vars);
}

export function localizeTheme(theme, lang) {
  if (!theme || lang === "en") return theme;
  const t = makeT(lang);
  const name = t(`themes.${theme.id}.name`);
  const tagline = t(`themes.${theme.id}.tagline`);
  return {
    ...theme,
    name: name !== `themes.${theme.id}.name` ? name : theme.name,
    tagline: tagline !== `themes.${theme.id}.tagline` ? tagline : theme.tagline,
  };
}

export function localizeTestimonial(clip, lang) {
  if (!clip || lang === "en") return clip;
  const quote = translate(lang, `testimonials.${clip.id}.quote`);
  if (quote === `testimonials.${clip.id}.quote`) return clip;
  return { ...clip, quote };
}

export function translateShareStatus(status, lang) {
  if (!status) return status;
  const key = ALL_SHARE_STATUS_KEYS[status];
  return key ? translate(lang, key) : status;
}

export function translateRoomError(message, lang) {
  if (!message) return message;
  const key = ALL_ROOM_ERROR_KEYS[message];
  return key ? translate(lang, key) : message;
}

export function getPhotoStrings(lang) {
  const t = makeT(lang);
  return {
    noPhotos: t("photo.noPhotos"),
    captions: [t("photo.cap1"), t("photo.cap2"), t("photo.cap3"), t("photo.cap4")],
    bulk: t("photo.bulk"),
    oneMore: t("photo.oneMore"),
    denied: [t("photo.denied1"), t("photo.denied2"), t("photo.denied3")],
    photoTag: t("chat.photoTag"),
  };
}

import { getCharacterById } from "../data/characters";

export function getLocalizedCharacter(id, lang) {
  const c = getCharacterById(id);
  if (!c) return null;
  return localizeCharacter(c, lang, makeT(lang));
}
