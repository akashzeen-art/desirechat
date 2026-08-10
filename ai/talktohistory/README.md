# DesireChat — Chat & Voice Chemistry

Pick your vibe, choose a companion, and start a conversation with chat + voice.

Frontend-only — no backend server needed.

---

## Project Structure

```
talktohistory/
└── frontend/
    ├── .env                 ← OpenAI key (VITE_OPENAI_API_KEY)
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/api.js  ← OpenAI + voice
    │   └── data/            ← companions + prompts
    └── package.json
```

---

## Setup

### 1. OpenAI key
1. Get a key at https://platform.openai.com/api-keys
2. Put it in `frontend/.env`:

```
VITE_OPENAI_API_KEY=sk-your-actual-key-here
VITE_OPENAI_MODEL=gpt-4o-mini
```

### 2. Run the app

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## How to use

1. Choose if you're a boy or a girl
2. Choose who you want to chat with (girls / boys)
3. Pick Sweet / Bold / Funny, then a region (girls & boys)
4. Chat by typing or using the mic — replies speak aloud
5. Ask them to share a photo — they send images 2→5, then stop

---

## Notes

- Voice uses the browser Web Speech API (Chrome works best)
- Restart `npm run dev` after changing `.env`
