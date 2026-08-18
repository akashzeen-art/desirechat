import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import chatHandler from "./api/chat.js";

function readEnvKey(root) {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return { apiKey: "", model: "gpt-4o-mini" };

  const text = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  const map = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const name = trimmed.slice(0, i).trim();
    let value = trimmed.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map[name] = value;
  }

  return {
    apiKey: (map.VITE_OPENAI_API_KEY || map.OPENAI_API_KEY || "").trim(),
    model: (map.VITE_OPENAI_MODEL || map.OPENAI_MODEL || "gpt-4o-mini").trim(),
  };
}

function openaiChatProxy() {
  return {
    name: "openai-chat-proxy",
    configureServer(server) {
      const root = server.config.root;

      server.middlewares.use("/api/tts", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", async () => {
          try {
            const { apiKey } = readEnvKey(root);
            if (!apiKey || apiKey.includes("your-openai")) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing OPENAI_API_KEY" }));
              return;
            }

            const parsed = JSON.parse(body || "{}");
            const {
              text,
              voice = "nova",
              classicVoice,
              speed = 1.0,
              instructions = "",
            } = parsed;

            if (!text?.trim()) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "No text" }));
              return;
            }

            const input = String(text).slice(0, 4096);
            const clampedSpeed = Math.min(1.2, Math.max(0.25, Number(speed) || 1));
            const attempts = [
              {
                model: "gpt-4o-mini-tts",
                payload: {
                  model: "gpt-4o-mini-tts",
                  input,
                  voice,
                  speed: clampedSpeed,
                  response_format: "mp3",
                  ...(instructions
                    ? { instructions: String(instructions).slice(0, 1500) }
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
            for (const attempt of attempts) {
              const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify(attempt.payload),
              });

              if (ttsRes.ok) {
                const buf = Buffer.from(await ttsRes.arrayBuffer());
                res.statusCode = 200;
                res.setHeader("Content-Type", "audio/mpeg");
                res.setHeader("Cache-Control", "no-store");
                res.setHeader("X-TTS-Model", attempt.model);
                res.end(buf);
                return;
              }

              const err = await ttsRes.json().catch(() => ({}));
              lastErr = err?.error?.message || `TTS failed (${attempt.model})`;
            }

            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: lastErr }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err.message || "TTS proxy error" }));
          }
        });
      });

      server.middlewares.use("/api/chat", (req, res) => {
        const { apiKey, model } = readEnvKey(root);
        if (apiKey) process.env.OPENAI_API_KEY = apiKey;
        if (model) process.env.OPENAI_MODEL = model;
        chatHandler(req, res);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // keep loadEnv so Vite still exposes VITE_ vars if needed
  loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), openaiChatProxy()],
    build: {
      sourcemap: false,
    },
  };
});
