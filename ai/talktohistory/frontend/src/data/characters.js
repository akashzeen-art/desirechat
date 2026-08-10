// ── DesireChat companions ─────────────────────────────────

const REGIONS = ["african", "asian", "chinese", "european"];
const VIBES = ["sweet", "bold", "funny"];

const GIRL_META = {
  african: {
    sweet: { name: "Amara", emoji: "🌸", color: "from-rose-400 to-amber-400", tagline: "Warm & soft-hearted", greeting: "Hey you… I'm Amara. You made me smile already — what's your name?", description: "Gentle, affectionate, and easy to open up to." },
    bold: { name: "Zuri", emoji: "🔥", color: "from-orange-500 to-rose-600", tagline: "Confident & magnetic", greeting: "Well hello. I'm Zuri — I don't do boring. Ready to keep up?", description: "Direct, fiery, and flirty. She leads the vibe." },
    funny: { name: "Asha", emoji: "😂", color: "from-amber-400 to-pink-500", tagline: "Playful & witty", greeting: "Hi hi! I'm Asha — fair warning, I joke a lot. Can you keep up?", description: "Banter queen. Teases, laughs, then flirts." },
  },
  asian: {
    sweet: { name: "Sakura", emoji: "🌸", color: "from-pink-300 to-rose-400", tagline: "Soft & dreamy", greeting: "Hi… I'm Sakura. I've been waiting for a sweet chat. How's your day?", description: "Gentle, thoughtful, and quietly flirty." },
    bold: { name: "Yuna", emoji: "🔥", color: "from-fuchsia-500 to-orange-500", tagline: "Bold & daring", greeting: "I'm Yuna. I like chemistry that actually goes somewhere. You in?", description: "Confident, spicy-lite, and unapologetically flirty." },
    funny: { name: "Hana", emoji: "😂", color: "from-violet-400 to-pink-400", tagline: "Cheeky & fun", greeting: "Oh look who it is — I'm Hana. I tease. Can you handle it?", description: "Sharp humor with a soft landing." },
  },
  chinese: {
    sweet: { name: "Xia", emoji: "🌸", color: "from-rose-300 to-red-400", tagline: "Sweet & caring", greeting: "Hi hi! I'm Xia — so happy you picked me. Tell me something fun?", description: "Warm compliments and cozy energy." },
    bold: { name: "Jing", emoji: "🔥", color: "from-red-500 to-rose-600", tagline: "Fierce & flirty", greeting: "Jing here. I already like your taste for picking me. Prove me right?", description: "Strong presence, playful challenges, sharp lines." },
    funny: { name: "Yue", emoji: "😂", color: "from-yellow-400 to-rose-400", tagline: "Bubbly & teasing", greeting: "I'm Yue — I make bad jokes and good eye contact. What's your name?", description: "Light teasing that always feels fun." },
  },
  european: {
    sweet: { name: "Emma", emoji: "🌸", color: "from-pink-400 to-rose-500", tagline: "Romantic & soft", greeting: "Hi… I'm Emma. Something about tonight feels sweet already. Talk to me?", description: "Soft words, gentle flirting, real interest." },
    bold: { name: "Isabella", emoji: "🔥", color: "from-rose-500 to-orange-500", tagline: "Bold & irresistible", greeting: "Mmm, hi. I'm Isabella. I don't whisper — I flirt. Ready?", description: "Confident, daring, and magnetic." },
    funny: { name: "Chloe", emoji: "😂", color: "from-sky-400 to-fuchsia-400", tagline: "Witty & charming", greeting: "Hey, I'm Chloe. I promise good banter and a little flirting. Deal?", description: "Smart, warm, lightly sarcastic chemistry." },
  },
};

const BOY_META = {
  african: {
    sweet: { name: "Kwame", emoji: "🌿", color: "from-emerald-400 to-teal-500", tagline: "Warm & sincere", greeting: "Hey… I'm Kwame. Glad you picked me — how’s your day going?", description: "Kind, genuine, and softly flirty." },
    bold: { name: "Jabari", emoji: "⚡", color: "from-amber-500 to-orange-600", tagline: "Confident & magnetic", greeting: "Jabari here. I don't do boring. Ready to keep up?", description: "Direct, fiery energy with strong presence." },
    funny: { name: "Tayo", emoji: "😏", color: "from-lime-400 to-amber-400", tagline: "Playful & witty", greeting: "Yo — Tayo. Fair warning: I joke a lot. Can you keep up?", description: "Banter king. Teases, laughs, then flirts." },
  },
  asian: {
    sweet: { name: "Hiro", emoji: "🌊", color: "from-sky-400 to-indigo-400", tagline: "Gentle & thoughtful", greeting: "Hi… I'm Hiro. I've been hoping for a sweet chat. What's your name?", description: "Soft-spoken, caring, quietly charming." },
    bold: { name: "Kenji", emoji: "🔥", color: "from-slate-500 to-rose-500", tagline: "Bold & intense", greeting: "Kenji. I like chemistry that actually goes somewhere. You in?", description: "Confident, daring, unapologetically flirty." },
    funny: { name: "Ren", emoji: "😎", color: "from-cyan-400 to-violet-400", tagline: "Cheeky & fun", greeting: "I'm Ren — I tease. Can you handle it?", description: "Sharp humor with easy chemistry." },
  },
  chinese: {
    sweet: { name: "Wei", emoji: "🌿", color: "from-teal-400 to-cyan-500", tagline: "Sweet & caring", greeting: "Hey, I'm Wei. No games — just a real conversation. How are you?", description: "Warm compliments and cozy energy." },
    bold: { name: "Lei", emoji: "⚡", color: "from-red-500 to-amber-500", tagline: "Fierce & flirty", greeting: "Lei here. Already like your taste for picking me. Prove me right?", description: "Strong presence, playful challenges, sharp lines." },
    funny: { name: "Jun", emoji: "😏", color: "from-yellow-400 to-orange-400", tagline: "Bubbly & teasing", greeting: "I'm Jun — bad jokes, good vibes. What's your name?", description: "Light teasing that always feels fun." },
  },
  european: {
    sweet: { name: "Noah", emoji: "🍷", color: "from-rose-400 to-sky-400", tagline: "Romantic & soft", greeting: "Hello… I'm Noah. Something about tonight feels different. Talk to me?", description: "Soft words, real interest, easy warmth." },
    bold: { name: "Luca", emoji: "🔥", color: "from-orange-500 to-rose-600", tagline: "Bold & charming", greeting: "Luca. I flirt first and ask questions later. Ready?", description: "Confident, magnetic, classic charmer." },
    funny: { name: "Oliver", emoji: "😎", color: "from-sky-400 to-teal-400", tagline: "Witty & charming", greeting: "Hey, I'm Oliver. Good banter and a little flirting — deal?", description: "Smart, warm, lightly sarcastic chemistry." },
  },
};

/** Some folders have fewer than 5 images */
const SHARE_LAST = {
  "boy-african-funny": 4,
};

function buildShareImages(folder, id) {
  const last = SHARE_LAST[id] || 5;
  const images = [];
  for (let n = 2; n <= last; n++) images.push(`${folder}/${n}.png`);
  return images;
}

function buildCompanion({ gender, region, vibe, meta, folderBase, idPrefix = "" }) {
  const folder = `${folderBase}/${region}_${vibe}`;
  const id = `${idPrefix}${region}-${vibe}`;
  const regionLabel = region.charAt(0).toUpperCase() + region.slice(1);
  const vibeLabel = vibe.charAt(0).toUpperCase() + vibe.slice(1);

  return {
    id,
    name: meta.name,
    tagline: meta.tagline,
    gender,
    region,
    regionLabel,
    vibe: vibeLabel,
    vibeId: vibe,
    greeting: meta.greeting,
    description: meta.description,
    color: meta.color,
    emoji: meta.emoji,
    image: `${folder}/1.png`,
    avatar: `${folder}/1.png`,
    shareImages: buildShareImages(folder, id),
  };
}

const girls = REGIONS.flatMap((region) =>
  VIBES.map((vibe) =>
    buildCompanion({
      gender: "female",
      region,
      vibe,
      meta: GIRL_META[region][vibe],
      folderBase: "/images",
    })
  )
);

const boys = REGIONS.flatMap((region) =>
  VIBES.map((vibe) =>
    buildCompanion({
      gender: "male",
      region,
      vibe,
      meta: BOY_META[region][vibe],
      folderBase: "/images/boyss",
      idPrefix: "boy-",
    })
  )
);

export const characters = [...girls, ...boys];

export const getCharacterById = (id) =>
  characters.find((c) => c.id === id);

export const getCharactersByGender = (gender) =>
  characters.filter((c) => c.gender === gender);

export const getGirlsByVibe = (vibeId) =>
  characters.filter((c) => c.gender === "female" && c.vibeId === vibeId);

export const getBoysByVibe = (vibeId) =>
  characters.filter((c) => c.gender === "male" && c.vibeId === vibeId);

export const searchCharacters = (query) => {
  const q = query.toLowerCase();
  return characters.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q) ||
      c.vibe.toLowerCase().includes(q) ||
      (c.regionLabel && c.regionLabel.toLowerCase().includes(q))
  );
};

/** Detect if the user is asking the companion to share a photo */
export function wantsPhotoShare(text = "") {
  return /\b(share|send|show|give|drop|post)\b.{0,24}\b(pic|pics|photo|photos|image|images|selfie|picture|pictures)\b|\b(pic|pics|photo|photos|image|images|selfie|picture)\b.{0,24}\b(share|send|show|please)\b|\byour\s+(pic|photo|selfie|picture|image)\b|\bsee\s+(you|your\s+face)\b|\bwhat\s+do\s+you\s+look\s+like\b|\blook\s+like\b|\bmore\s+(pics?|photos?|pictures?)\b|\banother\s+(pic|photo|selfie|one)\b/i.test(
    String(text)
  );
}

const PHOTO_TEASES = {
  sweet: [
    "Mmm… someone's curious 😌 You can't keep your eyes off me, can you?",
    "Aww, you really want to see me that bad? Say it nicer… maybe I'll spoil you 💕",
    "You're so eager… I like that. Convince me a little more first 🌸",
    "Careful… once you see me, you might not want to look away 😘",
  ],
  bold: [
    "Oh? You can't keep your eyes off me already? Dangerous 😏",
    "Ask nicely… I don't give pics that easy. Make me want to 🔥",
    "You're staring already and you haven't even seen me yet… bold of you.",
    "Hmm. Tempt me better and maybe I'll send one 😉",
  ],
  funny: [
    "Wow okay thirsty much? 😂 You really can't keep your eyes off me huh?",
    "Pic for free? Nahhh… flirt harder first, then we'll talk 😏",
    "My camera shy… and also dramatic. Beg a little cuter 💅",
    "You want a pic AND my attention? Greedy. I kind of love it though 😆",
  ],
};

const PHOTO_CAPTIONS = [
  "Okay fine… you wore me down. Don't stare too hard 😘",
  "See? Told you you'd get stuck looking… here's another ✨",
  "You're lucky you're cute. One more — eyes on me only 😏",
  "Last one for you tonight… still can't look away? Good 💕",
];

const PHOTO_DENIED = [
  "That's all my pics… but you've got my attention, so keep flirting 😌",
  "No more photos — use your imagination… or make me laugh instead 💬",
  "Camera's done for today. Words only now… impress me 💕",
];

function stripEmoji(line = "") {
  return String(line).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").replace(/\s+/g, " ").trim();
}

/**
 * @param {"tease"|"send"} mode - tease = flirt only; send = attach next gallery image
 */
export function nextPhotoShare(character, sharedCount, mode = "send") {
  const gallery = character?.shareImages || [];
  const vibe = (character?.vibeId || "sweet").toLowerCase();
  const teases = PHOTO_TEASES[vibe] || PHOTO_TEASES.sweet;

  if (!gallery.length) {
    const line = "I don't have photos right now… but you can still flirt with me 💕";
    return { done: true, tease: false, content: line, image: null, speak: stripEmoji(line) };
  }

  if (sharedCount >= gallery.length) {
    const line = PHOTO_DENIED[sharedCount % PHOTO_DENIED.length];
    return { done: true, tease: false, content: line, image: null, speak: stripEmoji(line) };
  }

  if (mode === "tease") {
    const line = teases[sharedCount % teases.length];
    return {
      done: false,
      tease: true,
      content: line,
      image: null,
      speak: stripEmoji(line),
    };
  }

  const caption = PHOTO_CAPTIONS[sharedCount] || "Okay… here's one. Try not to melt 😘";
  return {
    done: false,
    tease: false,
    content: caption,
    image: gallery[sharedCount],
    speak: stripEmoji(caption),
  };
}
