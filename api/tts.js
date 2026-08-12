export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const apiKey = (process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "").trim();
  if (!apiKey || apiKey.includes("your-openai")) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Missing OPENAI_API_KEY" }));
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const { text, voice = "nova", speed = 1.0 } = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    if (!text?.trim()) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "No text" }));
      return;
    }

    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text.slice(0, 4096),
        voice,
        speed,
        response_format: "mp3",
      }),
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.json().catch(() => ({}));
      res.statusCode = ttsRes.status;
      res.end(JSON.stringify({ error: err?.error?.message || "TTS failed" }));
      return;
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    res.statusCode = 200;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.end(Buffer.from(audioBuffer));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || "TTS proxy error" }));
  }
}
