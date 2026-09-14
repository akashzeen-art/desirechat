import { getCharacterPhotoLines } from "../data/photoFlirtLines";

/** Soft scene hints from the user's photo ask */
export function extractPhotoScene(userText = "", character = null) {
  const t = String(userText || "").trim();
  const name = character?.name || "her";
  if (!t) {
    return `a cute casual flirty selfie of ${name}, soft natural light`;
  }

  const lower = t.toLowerCase();
  const scenes = [
    { re: /\b(beach|ocean|sea|playa|plage)\b/i, scene: "on a sunny beach, soft breeze, golden hour" },
    { re: /\b(cafe|coffee|café)\b/i, scene: "at a cozy cafe table, warm indoor light" },
    { re: /\b(night|midnight|noche|nuit)\b/i, scene: "at night city lights bokeh behind her" },
    { re: /\b(gym|workout|fitness)\b/i, scene: "post-workout casual athletic wear, bright gym light, PG-13" },
    { re: /\b(office|work|trabajo|bureau)\b/i, scene: "smart casual in a bright modern office" },
    { re: /\b(park|garden|jardin|parque)\b/i, scene: "in a sunny park with soft greenery" },
    { re: /\b(mirror|selfie)\b/i, scene: "cute mirror selfie, bedroom soft light, PG-13" },
    { re: /\b(rain|lluvia|pluie)\b/i, scene: "by a rainy window, soft moody light" },
    { re: /\b(party|club|fiesta)\b/i, scene: "going-out glam, soft party lights, PG-13" },
    { re: /\b(bed|bedroom|cama|lit)\b/i, scene: "cozy morning in bed, soft daylight, fully clothed PG-13" },
  ];

  for (const s of scenes) {
    if (s.re.test(lower)) {
      return `a flirty photoreal selfie of ${name}, ${s.scene}`;
    }
  }

  const cleaned = t.replace(/[^\p{L}\p{N}\s.,'!?-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 120);
  return `a flirty photoreal selfie of ${name} matching this vibe: ${cleaned || "cute casual chat selfie"}`;
}

/** Downscale large face refs so edits are cheaper / more reliable */
async function faceToBase64(imageUrl) {
  const src = String(imageUrl || "").trim();
  if (!src) throw new Error("No face image");

  const res = await fetch(src);
  if (!res.ok) throw new Error(`Could not load face (${res.status})`);
  const blob = await res.blob();

  // Prefer canvas resize when available (browser)
  if (typeof createImageBitmap === "function" && typeof document !== "undefined") {
    try {
      const bitmap = await createImageBitmap(blob);
      const maxSide = 1024;
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(64, Math.round(bitmap.width * scale));
      const h = Math.max(64, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0, w, h);
      bitmap.close?.();
      const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
      const imageBase64 = dataUrl.replace(/^data:[^;]+;base64,/, "");
      return { imageBase64, mimeType: "image/jpeg" };
    } catch {
      // fall through to raw blob
    }
  }

  const mimeType = blob.type || "image/jpeg";
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return { imageBase64: btoa(binary), mimeType };
}

/**
 * Generate a new photo with the companion's exact face locked.
 * Throws with a clear message on quota / API failure.
 */
export async function generateCharacterPhoto(character, userText = "", lang = "en") {
  const faceSrc = character?.image || character?.avatar;
  if (!faceSrc) return null;

  const { imageBase64, mimeType } = await faceToBase64(faceSrc);
  const scene = extractPhotoScene(userText, character);

  const response = await fetch("/api/image-edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64,
      mimeType,
      scene,
      characterName: character?.name || "",
      vibe: character?.vibeId || character?.vibe || "sweet",
      chatLanguage: lang,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data?.error?.message || `Image generation failed (${response.status})`;
    const err = new Error(msg);
    err.code = data?.error?.code || response.status;
    err.quota = /credit|quota|billing|insufficient/i.test(msg);
    throw err;
  }
  if (data?.moderated) {
    return {
      moderated: true,
      content: data.reply,
      image: null,
      images: [],
      speak: data.reply,
    };
  }
  if (!data?.image) {
    throw new Error("No generated image");
  }

  const lines = getCharacterPhotoLines(character?.id, lang);
  const caption = lines.captions[0] || lines.oneMore;

  return {
    moderated: false,
    content: caption,
    image: data.image,
    images: [data.image],
    speak: caption.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").replace(/\s+/g, " ").trim(),
    generated: true,
  };
}
