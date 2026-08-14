export const IDLE_NUDGE_MS = 2 * 60 * 1000;

const IDLE_NUDGE_LINES_EN = [
  "Hey… what happened? You went quiet on me. Is your mood not good? I'm here if you want to talk 💕",
  "Still there? I noticed you paused — everything okay? You don't have to explain, just know I'm here.",
  "Hello? I saw you go silent for a bit… rough day? Tell me what's on your mind, or we can just sit together.",
  "Hey, you okay? You stopped replying and I got a little worried. Want to share what's going on?",
  "Where'd you go? I hope you're alright. If something's bothering you, I'm listening — no pressure.",
  "You went quiet… is something wrong? I'm not going anywhere. Talk to me when you're ready 💗",
];

const IDLE_NUDGE_LINES_ES = [
  "Oye… ¿qué pasó? Te quedaste callada/o. ¿No estás bien? Estoy aquí si quieres hablar 💕",
  "¿Sigues ahí? Noté que te pausaste — ¿todo bien? No tienes que explicar nada, solo quiero que sepas que estoy aquí.",
  "¿Hola? Vi que te quedaste en silencio… ¿día difícil? Cuéntame qué tienes en mente, o podemos quedarnos aquí juntos.",
  "¿Estás bien? Dejaste de responder y me preocupé un poco. ¿Quieres contarme qué pasa?",
  "¿Dónde te fuiste? Espero que estés bien. Si algo te molesta, te escucho — sin presión.",
  "Te quedaste callada/o… ¿pasa algo? No me voy a ningún lado. Háblame cuando quieras 💗",
];

const IDLE_NUDGE_LINES_FR = [
  "Hey… qu'est-ce qui se passe ? Tu t'es tue·e. Tout va bien ? Je suis là si tu veux parler 💕",
  "Tu es toujours là ? J'ai remarqué que tu t'es arrêté·e — ça va ? Pas besoin d'expliquer, je suis juste là.",
  "Allô ? Je t'ai vu·e te taire un moment… journée difficile ? Dis-moi ce que tu as en tête, ou on reste ensemble.",
  "Ça va ? Tu as arrêté de répondre et je me suis un peu inquiété·e. Tu veux me dire ce qui se passe ?",
  "Où es-tu passé·e ? J'espère que tout va bien. Si quelque chose te tracasse, je t'écoute — sans pression.",
  "Tu t'es tu·e… il y a un souci ? Je ne pars nulle part. Parle-moi quand tu veux 💗",
];

export function pickIdleGameNudge(lang = "en") {
  const lines =
    lang === "es" ? IDLE_NUDGE_LINES_ES : lang === "fr" ? IDLE_NUDGE_LINES_FR : IDLE_NUDGE_LINES_EN;
  return lines[Math.floor(Math.random() * lines.length)];
}
