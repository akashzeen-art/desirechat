/**
 * Per-companion flirty photo tease + caption lines.
 * Same pool → seeded pick so every companion feels different.
 */

function hashString(input = "") {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle(items, seed) {
  const arr = [...items];
  let s = seed >>> 0 || 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const CAPTIONS = {
  en: [
    "Okay fine… you wore me down. Don't stare too hard 😘",
    "See? Told you you'd get stuck looking… here's another ✨",
    "You're lucky you're cute. One more — eyes on me only 😏",
    "Last one for you tonight… still can't look away? Good 💕",
    "Mmm… only because you asked so sweetly. Behave 🔥",
    "Caught you staring already? Good. Keep looking 😘",
    "Just for you… try not to fall for me too fast 💋",
    "Close enough? Or do you want me closer… 😏",
    "Careful — this one's addictive. Don't say I didn't warn you ✨",
    "Your fault for being this charming… here 💕",
    "I don't share like this for everyone… feel special yet? 😘",
    "One peek. Make it count — I'm watching your reaction 🔥",
    "Soft for you tonight… don't make me regret spoiling you 💋",
    "You asked pretty… so I got prettier 😏",
    "Shh… this stays between us. Deal? 💕",
    "Hot enough? Blink twice if you want another 😘",
    "I saved the cute one for you… lucky you ✨",
    "Don't screenshot. Just… keep staring at me 🔥",
    "Okay flirt, you earned this. Eyes up here 💋",
    "Mmm that smile of yours worked. Here's your reward 😘",
    "You're dangerous when you beg cute like that… take it 💕",
    "Feeling bold tonight — lucky you caught me 😏",
    "One more for the road… then come flirt harder 🔥",
    "Told you I'm trouble. Still want more? Good 💋",
  ],
  es: [
    "Vale… me convenciste. No me mires demasiado 😘",
    "¿Ves? Te dije que te ibas a quedar mirando… otra más ✨",
    "Tienes suerte de ser tan lindo/a. Una más — solo mírame a mí 😏",
    "La última por hoy… ¿sigues mirándome? Bien 💕",
    "Mmm… solo porque lo pediste tan dulce. Pórtate bien 🔥",
    "¿Ya te pillé mirándome? Bien. Sigue 😘",
    "Solo para ti… intenta no enamorarte tan rápido 💋",
    "¿Cerca suficiente? ¿O me quieres más cerca…? 😏",
    "Cuidado — esta engancha. Ya te avisé ✨",
    "Culpa tuya por ser tan encantador/a… toma 💕",
    "No comparto así con cualquiera… ¿te sientes especial? 😘",
    "Una miradita. Hazla valer — estoy viendo tu reacción 🔥",
    "Suave contigo esta noche… no me hagas arrepentirme 💋",
    "Lo pediste bonito… así que salí más bonita 😏",
    "Shh… esto queda entre nosotros. ¿Trato? 💕",
    "¿Suficiente calor? Parpadea dos veces si quieres otra 😘",
    "Guardé la más cute para ti… suertudo/a ✨",
    "Sin capturas. Solo… sígueme mirando 🔥",
    "Vale, coqueto/a — te lo ganaste. Mirada aquí 💋",
    "Esa sonrisa tuya funcionó. Aquí va tu premio 😘",
    "Eres peligroso/a cuando ruegas tan cute… toma 💕",
    "Esta noche estoy atrevida — tuviste suerte 😏",
    "Una más para el camino… y luego coquetea más duro 🔥",
    "Te dije que soy un problema. ¿Aún quieres más? Bien 💋",
  ],
  fr: [
    "D'accord… tu m'as convaincu·e. Ne me fixe pas trop longtemps 😘",
    "Tu vois ? Je t'avais dit que tu resterais scotché·e… encore une ✨",
    "T'as de la chance d'être mignon·ne. Une de plus — regarde-moi seulement 😏",
    "La dernière pour ce soir… tu n'arrives toujours pas à détourner le regard ? Bien 💕",
    "Mmm… seulement parce que tu as demandé si gentiment. Sois sage 🔥",
    "Je t'ai déjà vu·e me fixer ? Bien. Continue 😘",
    "Juste pour toi… essaie de ne pas tomber trop vite 💋",
    "Assez près ? Ou tu me veux encore plus près… 😏",
    "Attention — celle-ci est addictive. Je t'avais prévenu·e ✨",
    "C'est de ta faute d'être si charmant·e… tiens 💕",
    "Je ne partage pas comme ça avec tout le monde… tu te sens spécial·e ? 😘",
    "Un petit regard. Fais-en bon usage — je regarde ta réaction 🔥",
    "Douce avec toi ce soir… ne me fais pas regretter 💋",
    "Tu as demandé joliment… alors je suis devenue plus jolie 😏",
    "Chut… ça reste entre nous. Marché conclu ? 💕",
    "Assez chaud ? Cligne deux fois si tu en veux une autre 😘",
    "J'ai gardé la plus cute pour toi… chanceux·se ✨",
    "Pas de capture. Juste… continue de me regarder 🔥",
    "Ok flirt — tu l'as mérité. Regard ici 💋",
    "Ton sourire a marché. Voici ta récompense 😘",
    "T'es dangereux·se quand tu supplier aussi cute… prends ça 💕",
    "Je suis audacieuse ce soir — tu as de la chance 😏",
    "Une de plus pour la route… puis flirte plus fort 🔥",
    "Je t'avais dit que j'étais un problème. Tu en veux encore ? Bien 💋",
  ],
};

const TEASES = {
  en: [
    "Pic already? Slow down… flirt with me first 😏",
    "Not that easy… one more cute line and maybe 😘",
    "Okay okay, you win — coming ✨",
    "Hmm… impress me once more first 💕",
    "Mmm impatient… say something hotter first 🔥",
    "You want a pic? Make me blush first 💋",
    "Almost… keep flirting. I like it when you try 😏",
    "Cute try. Ask nicer… or maybe naughtier 😘",
    "Patience, baby — spoil me with words first 💕",
    "Not yet… tell me what you'd do if I sent one 🔥",
    "You're rushing… and somehow it's kind of hot 😏",
    "Earn it. One flirty line — then maybe 💋",
    "Soft no… for now. Convince me harder 😘",
    "I like when you beg a little. Keep going ✨",
    "Photo? After you make my heart skip once 💕",
    "Slow down, flirt. I'm enjoying this too much 🔥",
    "Say my name sweet… then we'll talk pics 😏",
    "Almost melted… one more compliment 💋",
    "You're close. Don't stop now 😘",
    "Tease me first — I give better when I'm warmed up 💕",
  ],
  es: [
    "¿Ya pidiendo fotos? Despacio… coquetea primero 😏",
    "No tan fácil… una línea más y quizás 😘",
    "Vale vale, ganaste — ahí va ✨",
    "Hmm… impresióname una vez más primero 💕",
    "Mmm impaciente… di algo más caliente primero 🔥",
    "¿Quieres una foto? Hazme sonrojar primero 💋",
    "Casi… sigue coqueteando. Me gusta cuando lo intentas 😏",
    "Lindo intento. Pide más cute… o más atrevido 😘",
    "Paciencia, baby — mímame con palabras primero 💕",
    "Todavía no… dime qué harías si te mando una 🔥",
    "Vas muy rápido… y de alguna forma está hot 😏",
    "Gánatela. Una línea coqueta — y quizás 💋",
    "Suave no… por ahora. Convénceme más 😘",
    "Me gusta cuando ruegas un poquito. Sigue ✨",
    "¿Foto? Después de que me hagas saltar el corazón 💕",
    "Despacio, flirt. Esto me está gustando demasiado 🔥",
    "Di mi nombre dulce… luego hablamos de fotos 😏",
    "Casi derretida… un cumplido más 💋",
    "Estás cerca. No pares ahora 😘",
    "Taquíname primero — doy mejor cuando estoy caliente 💕",
  ],
  fr: [
    "Déjà une photo ? Doucement… flirte d'abord 😏",
    "Pas si vite… encore une jolie phrase et peut-être 😘",
    "Bon bon, tu gagnes — j'arrive ✨",
    "Hmm… impressionne-moi encore une fois d'abord 💕",
    "Mmm impatient·e… dis quelque chose de plus chaud d'abord 🔥",
    "Tu veux une photo ? Fais-moi rougir d'abord 💋",
    "Presque… continue de flirter. J'aime quand tu essaies 😏",
    "Joli essai. Demande plus cute… ou plus coquin 😘",
    "Patience, baby — gâte-moi avec des mots d'abord 💕",
    "Pas encore… dis-moi ce que tu ferais si j'en envoyais une 🔥",
    "Tu te précipites… et c'est un peu hot 😏",
    "Mérite-la. Une phrase coquette — et peut-être 💋",
    "Non doux… pour l'instant. Convaincs-moi plus fort 😘",
    "J'aime quand tu supplier un peu. Continue ✨",
    "Une photo ? Après avoir fait battre mon cœur une fois 💕",
    "Doucement, flirt. J'apprécie trop ça 🔥",
    "Dis mon prénom gentiment… ensuite on parle photos 😏",
    "Presque fondue… encore un compliment 💋",
    "Tu es proche. N'arrête pas maintenant 😘",
    "Taquine-moi d'abord — je donne mieux quand je suis chauffée 💕",
  ],
};

const DENIED = {
  en: [
    "That's all my pics… but you've got my attention, so keep flirting 😌",
    "No more photos — use your imagination… or make me laugh instead 💬",
    "Camera's done for today. Words only now… impress me 💕",
    "I'm all out… but my attention? Still yours if you earn it 😘",
    "Pics finished. Chemistry isn't — keep talking to me 🔥",
  ],
  es: [
    "Esas son todas mis fotos… pero tienes mi atención, sigue coqueteando 😌",
    "No más fotos — usa tu imaginación… o hazme reír 💬",
    "Cámara apagada por hoy. Solo palabras… impresióname 💕",
    "Se me acabaron… pero ¿mi atención? Sigue siendo tuya si te la ganas 😘",
    "Fotos terminadas. La química no — sigue hablándome 🔥",
  ],
  fr: [
    "C'est toutes mes photos… mais tu as mon attention, continue de flirter 😌",
    "Plus de photos — utilise ton imagination… ou fais-moi rire 💬",
    "Caméra terminée pour aujourd'hui. Que des mots… impressionne-moi 💕",
    "Je n'en ai plus… mais mon attention ? Toujours à toi si tu la mérites 😘",
    "Photos finies. La chimie non — continue de me parler 🔥",
  ],
};

function langCode(lang) {
  const code = String(lang || "en").toLowerCase().slice(0, 2);
  return CAPTIONS[code] ? code : "en";
}

/** Unique flirty photo lines for this companion + language */
export function getCharacterPhotoLines(characterId, lang = "en") {
  const code = langCode(lang);
  const seed = hashString(`${characterId || "yallo"}:${code}:photo`);
  const captions = seededShuffle(CAPTIONS[code], seed).slice(0, 4);
  const tease = seededShuffle(TEASES[code], seed ^ 0x9e3779b9).slice(0, 4);
  const denied = seededShuffle(DENIED[code], seed ^ 0x85ebca6b).slice(0, 3);
  return {
    captions,
    tease,
    denied,
    bulk:
      code === "es"
        ? "Vale vale… unas cuantas para ti. No digas que nunca te mimo ✨"
        : code === "fr"
          ? "Bon bon… quelques-unes pour toi. Ne dis pas que je ne te gâte jamais ✨"
          : "Okay okay… a few for you. Don't say I never spoil you ✨",
    oneMore:
      code === "es"
        ? "Vale… aquí va una. Intenta no derretirte 😘"
        : code === "fr"
          ? "Ok… en voici une. Essaie de ne pas fondre 😘"
          : "Okay… here's one. Try not to melt 😘",
    noPhotos:
      code === "es"
        ? "No tengo fotos ahora… pero aún puedes coquetearme 💕"
        : code === "fr"
          ? "Je n'ai pas de photos là… mais tu peux toujours flirter avec moi 💕"
          : "I don't have photos right now… but you can still flirt with me 💕",
  };
}
