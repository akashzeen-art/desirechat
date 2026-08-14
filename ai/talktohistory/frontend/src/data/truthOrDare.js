/** Soft PG-13 Truth or Dare prompts for flirt chat */

export const TRUTHS = [
  "What's your biggest green flag in someone?",
  "Have you ever had a crush on a voice before a face?",
  "What's a compliment you secretly love getting?",
  "What's your go-to flirty text opener?",
  "What's one thing that always makes you smile?",
  "Are you more soft romance or playful teasing?",
  "What's your love language — honestly?",
  "What's the cutest way someone could get your attention?",
  "Do you fall for humor or confidence first?",
  "What's a secret talent of yours?",
];

export const DARES = [
  "Give me your best pickup line right now.",
  "Compliment me in the most dramatic way possible.",
  "Describe our chat like a movie trailer.",
  "Send a flirty voice-style line (in text) in all caps.",
  "Rate this convo 1–10 and explain why.",
  "Ask me a bold question — keep it fun.",
  "Make up a cute nickname for me.",
  "Tell me a two-line love poem on the spot.",
  "Act like we just matched — restart the vibe.",
  "Challenge me to something silly and flirty.",
];

export const TRUTHS_ES = [
  "¿Cuál es tu mayor green flag en alguien?",
  "¿Alguna vez te gustó una voz antes de ver la cara?",
  "¿Qué cumplido secretamente te encanta recibir?",
  "¿Cuál es tu frase coqueta favorita para abrir chat?",
  "¿Qué siempre te saca una sonrisa?",
  "¿Eres más romance suave o coqueteo juguetón?",
  "¿Cuál es tu lenguaje del amor — en serio?",
  "¿Cuál es la forma más linda de llamar tu atención?",
  "¿Te conquista primero el humor o la confianza?",
  "¿Cuál es un talento secreto tuyo?",
];

export const DARES_ES = [
  "Dame tu mejor frase para ligar ahora mismo.",
  "Complimentame de la forma más dramática posible.",
  "Describe nuestro chat como un tráiler de película.",
  "Manda una línea coqueta estilo voz (en texto) en MAYÚSCULAS.",
  "Califica esta charla del 1 al 10 y explica por qué.",
  "Hazme una pregunta atrevida — que sea divertida.",
  "Inventa un apodo lindo para mí.",
  "Dime un poema de amor de dos líneas al instante.",
  "Actúa como si acabáramos de hacer match — reinicia el vibe.",
  "Rétame a algo tonto y coqueto.",
];

export const TRUTHS_FR = [
  "Quel est ton plus grand green flag chez quelqu'un ?",
  "As-tu déjà eu un crush sur une voix avant de voir le visage ?",
  "Quel compliment adores-tu secrètement recevoir ?",
  "Quelle est ta phrase coquine préférée pour ouvrir un chat ?",
  "Qu'est-ce qui te fait toujours sourire ?",
  "Tu es plutôt romance douce ou taquinerie joueuse ?",
  "Quel est ton langage de l'amour — honnêtement ?",
  "Quelle est la façon la plus mignonne d'attirer ton attention ?",
  "Est-ce que l'humour ou la confiance te conquiert en premier ?",
  "Quel est un talent secret que tu as ?",
];

export const DARES_FR = [
  "Donne-moi ta meilleure phrase de drague maintenant.",
  "Complimente-moi de la façon la plus dramatique possible.",
  "Décris notre chat comme une bande-annonce de film.",
  "Envoie une réplique coquine style voix (en texte) EN MAJUSCULES.",
  "Note cette conversation de 1 à 10 et explique pourquoi.",
  "Pose-moi une question audacieuse — que ce soit fun.",
  "Invente un surnom mignon pour moi.",
  "Dis-moi un poème d'amour de deux lignes sur le champ.",
  "Agis comme si on venait de matcher — relance le vibe.",
  "Défie-moi avec quelque chose de bête et coquin.",
];

export function randomTruth(lang = "en") {
  const list = lang === "es" ? TRUTHS_ES : lang === "fr" ? TRUTHS_FR : TRUTHS;
  return list[Math.floor(Math.random() * list.length)];
}

export function randomDare(lang = "en") {
  const list = lang === "es" ? DARES_ES : lang === "fr" ? DARES_FR : DARES;
  return list[Math.floor(Math.random() * list.length)];
}

export function truthOrDareSystemNote(lang = "en") {
  if (lang === "es") {
    return `MODO VERDAD O RETO activado.
Si el usuario elige Verdad, haz una pregunta divertida, coqueta y PG-13 o reacciona cálidamente a su respuesta.
Si elige Reto, da un reto juguetón PG-13 o reacciona cuando lo complete.
Manténlo ligero, provocador y alentador. Nunca NSFW.`;
  }
  if (lang === "fr") {
    return `MODE ACTION OU VÉRITÉ activé.
Si l'utilisateur choisit Vérité, pose une question fun, coquine et PG-13 ou réagis chaleureusement à sa réponse.
S'il choisit Action, donne un défi joueur PG-13 ou réagis quand il le termine.
Garde ça léger, taquin et encourageant. Jamais NSFW.`;
  }
  return `TRUTH OR DARE MODE is ON.
If the user picks Truth, ask a fun, flirty, PG-13 truth question or react to their answer warmly.
If the user picks Dare, give a playful PG-13 dare or react when they complete it.
Keep it light, teasing, and encouraging. Never NSFW.`;
}
