import { getPrompt } from "../data/prompts";
import { MOOD_PROMPT } from "../data/moods";
import { truthOrDareSystemNote } from "../data/truthOrDare";

const MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

async function chatRequest(messages, { temperature = 0.85, max_tokens = 220 } = {}) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature,
      max_tokens,
      messages,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = data?.error?.message || `Chat failed (${response.status})`;
    throw new Error(msg);
  }

  return data;
}

// ── Chat via Vite proxy ───────────────────────────────────
export const sendChatMessage = async (
  message,
  characterId,
  history = [],
  { mood = "sweet", truthOrDare = false } = {}
) => {
  const recentHistory = history.slice(-10).map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: String(msg.content),
  }));

  let system = getPrompt(characterId);
  if (MOOD_PROMPT[mood]) system += `\n\n${MOOD_PROMPT[mood]}`;
  if (truthOrDare) system += `\n\n${truthOrDareSystemNote()}`;

  const data = await chatRequest([
    { role: "system", content: system },
    ...recentHistory,
    { role: "user", content: message.trim() },
  ]);

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Empty reply from the model.");

  return { reply };
};

/** Conversation-aware suggested replies for the user */
export const fetchConversationSuggestions = async (characterName, history = [], mood = "sweet") => {
  const recent = history.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n");

  const data = await chatRequest(
    [
      {
        role: "system",
        content: `You write short flirty reply suggestions for the USER to send next in a chat app called Flirt Net.
Return ONLY a JSON array of exactly 3 strings. No markdown, no labels.
Each suggestion: under 12 words, PG-13, matches mood "${mood}", continues THIS conversation naturally.
Never NSFW.`,
      },
      {
        role: "user",
        content: `Companion: ${characterName}\nConversation:\n${recent}\n\nGive 3 suggested replies the user could send next.`,
      },
    ],
    { temperature: 0.9, max_tokens: 120 }
  );

  const raw = data?.choices?.[0]?.message?.content?.trim() || "[]";
  try {
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(Boolean).slice(0, 3);
    }
  } catch {
    /* fall through */
  }
  return [
    "Tell me more about that",
    "You're cute when you say that",
    "Okay… your turn to ask me something",
  ];
};

// ── Voice config ──────────────────────────────────────────
const VOICE_PREFS = {
  male: [
    "Google UK English Male",
    "Microsoft David",
    "Microsoft Mark",
    "Alex",
    "Daniel",
    "Google US English",
  ],
  female: [
    "Google UK English Female",
    "Microsoft Zira",
    "Microsoft Susan",
    "Samantha",
    "Karen",
    "Victoria",
    "Google US English Female",
  ],
};

const pickVoice = (gender) => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const prefs = VOICE_PREFS[gender] || VOICE_PREFS.male;
  for (const name of prefs) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }
  for (const name of prefs) {
    const match = voices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
    if (match) return match;
  }
  return voices.find((v) => v.lang.startsWith("en")) || voices[0];
};

export const speakText = (text, onEnd, gender = "male") => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = gender === "female" ? 1.0 : 0.92;
    utterance.pitch = gender === "female" ? 1.2 : 0.9;
    utterance.volume = 1;
    const voice = pickVoice(gender);
    if (voice) utterance.voice = voice;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length) {
    speak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      speak();
    };
  }
};

export const stopSpeaking = () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
};

export const createSpeechRecognition = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";
  return recognition;
};
