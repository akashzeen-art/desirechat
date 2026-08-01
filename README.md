# Spark (FlirtAI)

Chat & voice flirting app — pick your vibe, choose who to flirt with, and talk.

## Run locally

```bash
cd ai/talktohistory/frontend
npm install
cp .env.example .env
# add your OpenAI key to .env as VITE_OPENAI_API_KEY
npm run dev
```

Open http://localhost:5173

## Deploy on Vercel

### Option A — Root Directory (recommended)

1. Import [akashzeen-art/flirtai](https://github.com/akashzeen-art/flirtai)
2. Set **Root Directory** to: `ai/talktohistory/frontend`
3. Framework: Vite (auto)
4. Build: `npm run build` · Output: `dist`
5. Add Environment Variable:
   - `OPENAI_API_KEY` = your OpenAI key
6. Deploy

If using Root Directory, also copy/move the API by keeping `api/chat` under that root — see Option B if chat fails.

### Option B — Deploy from repo root (current setup)

This repo includes root `vercel.json` + `/api/chat` so Vercel can build from the monorepo layout.

1. Import the GitHub repo (Root Directory = `.` / empty)
2. Add env var `OPENAI_API_KEY`
3. Redeploy

See `ai/talktohistory/README.md` for more app details.
