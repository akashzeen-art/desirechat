const BLOCKED_BY_LANG = {
  en: "Sorry — adult or explicit chat isn't allowed on Yallo. Let's keep it fun and PG-13 💕",
  es: "Lo siento — el chat adulto o explícito no está permitido en Yallo. Mantengámoslo divertido y PG-13 💕",
  fr: "Désolé — le chat adulte ou explicite n'est pas autorisé sur Yallo. Restons fun et PG-13 💕",
};

function blockedReply(lang = "en") {
  const code = String(lang || "en").slice(0, 2).toLowerCase();
  return BLOCKED_BY_LANG[code] || BLOCKED_BY_LANG.en;
}

function lastUserText(messages = []) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "user" && m?.content) {
      return String(m.content).replace(/^\[[^\]]+\]:\s*/, "").trim();
    }
  }
  return "";
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
      body: JSON.stringify({ input: text.slice(0, 4000) }),
    });
    const data = await res.json();
    const r = data?.results?.[0];
    if (!r?.flagged) return false;
    return Boolean(
      r.categories?.sexual ||
        r.categories?.["sexual/minors"] ||
        (r.category_scores?.sexual ?? 0) >= 0.35
    );
  } catch {
    return false;
  }
}

function moderatedCompletion(reply, model) {
  return {
    id: "chatcmpl-moderated",
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: model || "gpt-4o-mini",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: reply },
        finish_reason: "stop",
      },
    ],
    moderated: true,
  };
}

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
    let payload = req.body;
    if (!payload || typeof payload === "string") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString("utf8");
      payload = raw ? JSON.parse(raw) : {};
    }

    const chatLanguage = payload.chatLanguage || "en";
    const userText = lastUserText(payload.messages || []);

    if (userText && (await openAiModerationFlagged(userText, apiKey))) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(moderatedCompletion(blockedReply(chatLanguage), payload.model || model)));
      return;
    }

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

    const assistantText = data?.choices?.[0]?.message?.content?.trim();
    if (assistantText && (await openAiModerationFlagged(assistantText, apiKey))) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(moderatedCompletion(blockedReply(chatLanguage), payload.model || model)));
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
