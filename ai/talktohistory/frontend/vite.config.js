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
