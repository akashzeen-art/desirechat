/**
 * Face-locked selfie generation via OpenAI Images Edit (gpt-image-1).
 * Uses high input_fidelity so the companion's face stays the same.
 */

function blockedSceneReply(lang = "en") {
  const code = String(lang || "en").slice(0, 2).toLowerCase();
  if (code === "es") {
    return "Eso se pone demasiado atrevido… pídeme otra foto más cute y PG-13 💕";
  }
  if (code === "fr") {
    return "C'est trop osé… demande-moi une autre photo cute et PG-13 💕";
  }
  return "That's a bit too spicy… ask me for another cute PG-13 pic 💕";
}

async function openAiModerationFlagged(text, apiKey) {
  if (!text?.trim()) return false;
  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: String(text).slice(0, 4000) }),
    });
    const data = await res.json();
    const r = data?.results?.[0];
    if (!r) return false;
    return Boolean(
      r.categories?.sexual ||
        r.categories?.["sexual/minors"] ||
        (r.category_scores?.sexual ?? 0) >= 0.35
    );
  } catch {
    return false;
  }
}

function buildFaceLockPrompt({ characterName, scene, vibe }) {
  const safeScene = String(scene || "a cute casual selfie")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 280);
  const who = characterName || "this woman";
  const mood = vibe || "flirty";

  return [
    `Edit Image 1 (reference face of ${who}).`,
    "CRITICAL IDENTITY LOCK: Keep the EXACT same face, facial structure, eyes, nose, lips, skin tone, hair color/style, age, and identity as Image 1.",
    "Do not replace, morph, beautify into a different person, or invent a new face. The output must look like the same person.",
    `Create a new photorealistic phone selfie / portrait for a flirty chat app.`,
    `User scene request: ${safeScene}.`,
    `Mood: ${mood}, warm, PG-13 flirt, natural lighting, candid phone camera look.`,
    "Change only clothing style lightly if needed for the scene, pose, background, and framing — never the face identity.",
    "No nudity, no lingerie focus, no explicit content, no sexual acts.",
    "No text, logos, watermarks, or UI overlays.",
    "Portrait orientation preferred. Single person only.",
  ].join(" ");
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: { message: "Method not allowed" } }));
    return;
  }

  const apiKey = (process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "").trim();
  if (!apiKey || apiKey.includes("your-openai")) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: { message: "Missing OPENAI_API_KEY" } }));
    return;
  }

  try {
    const payload = await parseBody(req);
    const {
      imageBase64,
      mimeType = "image/jpeg",
      scene = "",
      characterName = "",
      vibe = "sweet",
      chatLanguage = "en",
    } = payload;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: { message: "Missing face image" } }));
      return;
    }

    // Cap ~4.5MB base64
    if (imageBase64.length > 6_000_000) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: { message: "Face image too large" } }));
      return;
    }

    if (await openAiModerationFlagged(scene, apiKey)) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          moderated: true,
          reply: blockedSceneReply(chatLanguage),
        })
      );
      return;
    }

    const cleanB64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
    const bytes = Buffer.from(cleanB64, "base64");
    const mime = String(mimeType || "image/jpeg").split(";")[0];
    const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";

    const prompt = buildFaceLockPrompt({ characterName, scene, vibe });
    const form = new FormData();
    const model =
      process.env.VITE_OPENAI_IMAGE_MODEL ||
      process.env.OPENAI_IMAGE_MODEL ||
      "gpt-image-1";
    // File is more reliable than Blob for OpenAI multipart in Node
    const file =
      typeof File !== "undefined"
        ? new File([bytes], `face.${ext}`, { type: mime })
        : new Blob([bytes], { type: mime });
    form.append("model", model);
    form.append("image", file, `face.${ext}`);
    form.append("prompt", prompt);
    form.append("input_fidelity", "high");
    form.append("quality", "high");
    form.append("size", "1024x1536");
    form.append("output_format", "jpeg");

    const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    const data = await openaiRes.json().catch(() => ({}));
    if (!openaiRes.ok) {
      const message = data?.error?.message || `Image edit failed (${openaiRes.status})`;
      const code = data?.error?.code || null;
      console.error("[image-edit]", openaiRes.status, message);
      res.statusCode = openaiRes.status === 401 ? 401 : openaiRes.status === 429 ? 429 : 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: { message, code } }));
      return;
    }

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: { message: "No image returned" } }));
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(
      JSON.stringify({
        image: `data:image/jpeg;base64,${b64}`,
        model: data?.model || "gpt-image-1",
      })
    );
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: { message: err.message || "Image edit proxy error" } }));
  }
}
