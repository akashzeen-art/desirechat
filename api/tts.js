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
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const {
      text,
      voice = "nova",
      classicVoice,
      speed = 1.0,
      instructions = "",
    } = body;

    if (!text?.trim()) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "No text" }));
      return;
    }

    const input = text.slice(0, 4096);
    const clampedSpeed = Math.min(1.2, Math.max(0.25, Number(speed) || 1));

    // Prefer gpt-4o-mini-tts so country/vibe instructions shape the delivery
    const tryModels = [
      {
        model: "gpt-4o-mini-tts",
        payload: {
          model: "gpt-4o-mini-tts",
          input,
          voice,
          speed: clampedSpeed,
          response_format: "mp3",
          ...(instructions
            ? { instructions: String(instructions).slice(0, 2500) }
            : {}),
        },
      },
      {
        model: "tts-1-hd",
        payload: {
          model: "tts-1-hd",
          input,
          voice: classicVoice || voice,
          speed: clampedSpeed,
          response_format: "mp3",
        },
      },
      {
        model: "tts-1",
        payload: {
          model: "tts-1",
          input,
          voice: classicVoice || voice,
          speed: clampedSpeed,
          response_format: "mp3",
        },
      },
    ];

    let lastErr = "TTS failed";
    for (const attempt of tryModels) {
      const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(attempt.payload),
      });

      if (ttsRes.ok) {
        const audioBuffer = await ttsRes.arrayBuffer();
        res.statusCode = 200;
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-TTS-Model", attempt.model);
        res.end(Buffer.from(audioBuffer));
        return;
      }

      const err = await ttsRes.json().catch(() => ({}));
      lastErr = err?.error?.message || `TTS failed (${attempt.model})`;
      // try next model
    }

    res.statusCode = 500;
    res.end(JSON.stringify({ error: lastErr }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || "TTS proxy error" }));
  }
}
