import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

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

      server.middlewares.use("/api/ratings", (req, res) => {
        const dataDir = path.join(root, ".data");
        const dataFile = path.join(dataDir, "ratings.json");

        const readFileStore = () => {
          try {
            if (!fs.existsSync(dataFile)) return { reviews: [], byVideo: {} };
            return JSON.parse(fs.readFileSync(dataFile, "utf8"));
          } catch {
            return { reviews: [], byVideo: {} };
          }
        };

        const writeFileStore = (store) => {
          if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
          fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), "utf8");
        };

        const mergeStores = (a, b) => {
          const out = { reviews: [], byVideo: {} };
          const reviewMap = new Map();
          [...(a.reviews || []), ...(b.reviews || [])].forEach((r) => {
            if (!r?.userId) return;
            const prev = reviewMap.get(r.userId);
            if (!prev || new Date(r.at || 0) > new Date(prev.at || 0)) reviewMap.set(r.userId, r);
          });
          out.reviews = [...reviewMap.values()].sort(
            (x, y) => new Date(y.at || 0) - new Date(x.at || 0)
          );
          const videos = new Set([...Object.keys(a.byVideo || {}), ...Object.keys(b.byVideo || {})]);
          videos.forEach((vid) => {
            const map = new Map();
            [...(a.byVideo?.[vid] || []), ...(b.byVideo?.[vid] || [])].forEach((r) => {
              if (!r?.userId) return;
              map.set(r.userId, r);
            });
            if (map.size) out.byVideo[vid] = [...map.values()];
          });
          return out;
        };

        if (req.method === "GET") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(readFileStore()));
          return;
        }

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
        req.on("end", () => {
          try {
            const payload = JSON.parse(body || "{}");
            let store = mergeStores(readFileStore(), payload.clientStore || { reviews: [], byVideo: {} });

            if (payload.action === "saveReview" && payload.review?.userId) {
              const r = payload.review;
              store.reviews = store.reviews.filter((x) => x.userId !== r.userId);
              store.reviews.unshift({
                id: r.userId,
                userId: r.userId,
                name: String(r.name || "Guest").slice(0, 32),
                stars: Math.min(5, Math.max(1, Number(r.stars) || 5)),
                text: String(r.text || "").slice(0, 180),
                at: r.at || new Date().toISOString(),
              });
            }

            if (payload.action === "rateVideo" && payload.videoId && payload.userId) {
              const vid = String(payload.videoId);
              const list = Array.isArray(store.byVideo[vid]) ? store.byVideo[vid] : [];
              store.byVideo[vid] = [
                ...list.filter((x) => x.userId !== payload.userId),
                {
                  userId: payload.userId,
                  stars: Math.min(5, Math.max(1, Number(payload.stars) || 5)),
                },
              ];
            }

            writeFileStore(store);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(store));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err.message || "Ratings error" }));
          }
        });
      });

      server.middlewares.use("/api/chat", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: { message: "Method not allowed" } }));
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", async () => {
          try {
            const { apiKey, model } = readEnvKey(root);

            if (!apiKey || apiKey.includes("your-openai")) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: {
                    message:
                      "Missing API key. Put a valid key in frontend/.env as VITE_OPENAI_API_KEY, then restart npm run dev.",
                  },
                })
              );
              return;
            }

            const payload = JSON.parse(body || "{}");
            const openaiRes = await fetch(
              "https://api.openai.com/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  model: payload.model || model || "gpt-4o-mini",
                  temperature: payload.temperature ?? 0.85,
                  max_tokens: payload.max_tokens ?? 220,
                  messages: payload.messages,
                }),
              }
            );

            const data = await openaiRes.json();

            if (openaiRes.status === 401) {
              res.statusCode = 401;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: {
                    message:
                      "OpenAI rejected this API key. Create a new secret key at https://platform.openai.com/api-keys , paste it into frontend/.env, then restart npm run dev.",
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
            res.end(
              JSON.stringify({
                error: { message: err.message || "Proxy error" },
              })
            );
          }
        });
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
