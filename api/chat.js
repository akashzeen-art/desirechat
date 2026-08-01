export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: { message: "Method not allowed" } }));
    return;
  }

  const apiKey = (process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "").trim();
  const model = process.env.OPENAI_MODEL || process.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey || apiKey.includes("your-openai")) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: {
          message:
            "Missing OPENAI_API_KEY. Add it in Vercel → Project → Settings → Environment Variables.",
        },
      })
    );
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8");
    const payload = raw ? JSON.parse(raw) : req.body || {};

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: payload.model || model,
        temperature: payload.temperature ?? 0.85,
        max_tokens: payload.max_tokens ?? 220,
        messages: payload.messages,
      }),
    });

    const data = await openaiRes.json();

    if (openaiRes.status === 401) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: {
            message:
              "OpenAI rejected this API key. Check OPENAI_API_KEY in Vercel environment variables.",
          },
        })
      );
      return;
    }

    res.statusCode = openaiRes.status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: { message: err.message || "Proxy error" } }));
  }
}
