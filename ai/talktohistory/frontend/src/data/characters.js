// ── Yallo! companions ─────────────────────────────────

const REGIONS = ["african", "asian", "chinese", "european"];
const NEW_REGIONS = ["pakistani", "indian", "afghani", "srilankan"];
const VIBES = ["sweet", "bold", "funny"];

const GIRL_META = {
  african: {
    sweet: { name: "Amara",    emoji: "🌸", color: "from-rose-400 to-amber-400",   tagline: "Warm & soft-hearted",   oneliner: "She'll make you feel like the only one in the room 🌺", greeting: "Hey you… I'm Amara. You made me smile already — what's your name?", description: "Gentle, affectionate, and easy to open up to." },
    bold:  { name: "Zuri",     emoji: "🔥", color: "from-orange-500 to-rose-600",  tagline: "Confident & magnetic",  oneliner: "She doesn't chase — she attracts. Watch out 🔥",           greeting: "Well hello. I'm Zuri — I don't do boring. Ready to keep up?",    description: "Direct, fiery, and flirty. She leads the vibe." },
    funny: { name: "Asha",     emoji: "😂", color: "from-amber-400 to-pink-500",   tagline: "Playful & witty",       oneliner: "Warning: she'll roast you and make you love it 😂",        greeting: "Hi hi! I'm Asha — fair warning, I joke a lot. Can you keep up?", description: "Banter queen. Teases, laughs, then flirts." },
  },
  asian: {
    sweet: { name: "Sakura",   emoji: "🌸", color: "from-pink-300 to-rose-400",    tagline: "Soft & dreamy",         oneliner: "Like cherry blossoms — gentle, beautiful, unforgettable 🌸", greeting: "Hi… I'm Sakura. I've been waiting for a sweet chat. How's your day?", description: "Gentle, thoughtful, and quietly flirty." },
    bold:  { name: "Yuna",     emoji: "🔥", color: "from-fuchsia-500 to-orange-500", tagline: "Bold & daring",       oneliner: "She sets the pace — try to keep up 💥",                    greeting: "I'm Yuna. I like chemistry that actually goes somewhere. You in?", description: "Confident, spicy-lite, and unapologetically flirty." },
    funny: { name: "Hana",     emoji: "😂", color: "from-violet-400 to-pink-400",  tagline: "Cheeky & fun",          oneliner: "She'll tease you in three languages and smile doing it 😏",  greeting: "Oh look who it is — I'm Hana. I tease. Can you handle it?",    description: "Sharp humor with a soft landing." },
  },
  chinese: {
    sweet: { name: "Xiǎo Xuě 晓雪", emoji: "🌸", color: "from-rose-300 to-red-400",  tagline: "Sweet & caring",    oneliner: "Soft like snow, warm like tea — she'll melt your heart 🍵",  greeting: "Hi hi! I'm Xiǎo Xuě — so happy you picked me. Tell me something fun?", description: "Warm compliments and cozy energy." },
    bold:  { name: "Jìng Yí 静怡",  emoji: "🔥", color: "from-red-500 to-rose-600",   tagline: "Fierce & flirty",   oneliner: "Still waters run deep — and she runs dangerous 🐉",          greeting: "Jìng Yí here. I already like your taste for picking me. Prove me right?", description: "Strong presence, playful challenges, sharp lines." },
    funny: { name: "Yuè Er 月儿",   emoji: "😂", color: "from-yellow-400 to-rose-400", tagline: "Bubbly & teasing", oneliner: "She makes bad puns in Mandarin and somehow it's adorable 🌙", greeting: "I'm Yuè Er — I make bad jokes and good eye contact. What's your name?", description: "Light teasing that always feels fun." },
  },
  european: {
    sweet: { name: "Emma",     emoji: "🌸", color: "from-pink-400 to-rose-500",    tagline: "Romantic & soft",       oneliner: "She turns small moments into something you'll remember 💕",  greeting: "Hi… I'm Emma. Something about tonight feels sweet already. Talk to me?", description: "Soft words, gentle flirting, real interest." },
    bold:  { name: "Isabella", emoji: "🔥", color: "from-rose-500 to-orange-500",  tagline: "Bold & irresistible",   oneliner: "She walked in and the room forgot to breathe 🌹",            greeting: "Mmm, hi. I'm Isabella. I don't whisper — I flirt. Ready?",      description: "Confident, daring, and magnetic." },
    funny: { name: "Chloe",    emoji: "😂", color: "from-sky-400 to-fuchsia-400",  tagline: "Witty & charming",      oneliner: "She'll make you laugh so hard you forget to be nervous 😄",  greeting: "Hey, I'm Chloe. I promise good banter and a little flirting. Deal?", description: "Smart, warm, lightly sarcastic chemistry." },
  },
};

const BOY_META = {
  african: {
    sweet: { name: "Kwame",        emoji: "🌿", color: "from-emerald-400 to-teal-500",  tagline: "Warm & sincere",       oneliner: "The kind of guy who remembers what you said last week 🌿",        greeting: "Hey… I'm Kwame. Glad you picked me — how's your day going?",    description: "Kind, genuine, and softly flirty." },
    bold:  { name: "Jabari",       emoji: "⚡", color: "from-amber-500 to-orange-600",  tagline: "Confident & magnetic", oneliner: "He walks in like he owns the vibe — and honestly, he does ⚡",    greeting: "Jabari here. I don't do boring. Ready to keep up?",             description: "Direct, fiery energy with strong presence." },
    funny: { name: "Tayo",         emoji: "😏", color: "from-lime-400 to-amber-400",    tagline: "Playful & witty",      oneliner: "He'll have you crying laughing before you notice you're flirting 😏", greeting: "Yo — Tayo. Fair warning: I joke a lot. Can you keep up?",    description: "Banter king. Teases, laughs, then flirts." },
  },
  asian: {
    sweet: { name: "Hiro",         emoji: "🌊", color: "from-sky-400 to-indigo-400",    tagline: "Gentle & thoughtful",  oneliner: "Quiet strength, warm eyes — he listens like no one else 🌊",      greeting: "Hi… I'm Hiro. I've been hoping for a sweet chat. What's your name?", description: "Soft-spoken, caring, quietly charming." },
    bold:  { name: "Kenji",        emoji: "🔥", color: "from-slate-500 to-rose-500",    tagline: "Bold & intense",       oneliner: "He doesn't say much — but when he does, you feel it 🔥",          greeting: "Kenji. I like chemistry that actually goes somewhere. You in?",  description: "Confident, daring, unapologetically flirty." },
    funny: { name: "Ren",          emoji: "😎", color: "from-cyan-400 to-violet-400",   tagline: "Cheeky & fun",         oneliner: "Sarcasm is his love language and somehow it works 😎",             greeting: "I'm Ren — I tease. Can you handle it?",                         description: "Sharp humor with easy chemistry." },
  },
  chinese: {
    sweet: { name: "Míng Xuān 明轩", emoji: "🌿", color: "from-teal-400 to-cyan-500",  tagline: "Sweet & caring",       oneliner: "Calm like a mountain, warm like sunlight 🏔️",                    greeting: "Hey, I'm Míng Xuān. No games — just a real conversation. How are you?", description: "Warm compliments and cozy energy." },
    bold:  { name: "Zǐ Lóng 子龙",  emoji: "⚡", color: "from-red-500 to-amber-500",   tagline: "Fierce & flirty",      oneliner: "Dragon energy in a conversation — you won't forget him 🐉",       greeting: "Zǐ Lóng here. Already like your taste for picking me. Prove me right?", description: "Strong presence, playful challenges, sharp lines." },
    funny: { name: "Jùn Jié 俊杰",  emoji: "😏", color: "from-yellow-400 to-orange-400", tagline: "Bubbly & teasing",   oneliner: "He'll make you snort-laugh and still look cool 😂",               greeting: "I'm Jùn Jié — bad jokes, good vibes. What's your name?",        description: "Light teasing that always feels fun." },
  },
  european: {
    sweet: { name: "Noah",         emoji: "🍷", color: "from-rose-400 to-sky-400",      tagline: "Romantic & soft",      oneliner: "He makes ordinary evenings feel like something out of a film 🍷", greeting: "Hello… I'm Noah. Something about tonight feels different. Talk to me?", description: "Soft words, real interest, easy warmth." },
    bold:  { name: "Luca",         emoji: "🔥", color: "from-orange-500 to-rose-600",   tagline: "Bold & charming",      oneliner: "Italian energy, zero filter — dangerously charming 🔥",           greeting: "Luca. I flirt first and ask questions later. Ready?",            description: "Confident, magnetic, classic charmer." },
    funny: { name: "Oliver",       emoji: "😎", color: "from-sky-400 to-teal-400",      tagline: "Witty & charming",     oneliner: "British wit + zero chill = the most fun you'll have chatting 😄", greeting: "Hey, I'm Oliver. Good banter and a little flirting — deal?",    description: "Smart, warm, lightly sarcastic chemistry." },
  },
};

const NEW_GIRL_META = {
  pakistani: {
    sweet: { name: "Zara",    emoji: "🌸", color: "from-rose-300 to-pink-400",    tagline: "Soft & graceful",      oneliner: "She speaks softly and stays in your mind for days 🌸",           greeting: "Assalam… I'm Zara. You seem interesting — tell me something about yourself?", description: "Gentle, warm, and quietly captivating." },
    bold:  { name: "Noor",    emoji: "🔥", color: "from-fuchsia-500 to-rose-500", tagline: "Bold & magnetic",      oneliner: "She's the kind of bold that makes you forget what you were saying 🔥", greeting: "Hey. I'm Noor — I don't do small talk. Ready for something real?",       description: "Fierce, confident, unapologetically flirty." },
    funny: { name: "Misha",   emoji: "😂", color: "from-amber-400 to-rose-400",   tagline: "Witty & playful",      oneliner: "She'll roast you in Urdu and you'll ask for more 😂",               greeting: "Hi! I'm Misha — I warn everyone: I'm a lot. Still here? Good 😄",          description: "Sharp banter with a warm heart." },
  },
  indian: {
    sweet: { name: "Priya",   emoji: "🌺", color: "from-orange-300 to-rose-400",  tagline: "Warm & radiant",      oneliner: "Like a Bollywood moment — she makes everything feel cinematic 🌺",   greeting: "Hi! I'm Priya. Something about this feels like the start of something good 💫", description: "Warm, expressive, and full of heart." },
    bold:  { name: "Kavya",   emoji: "🔥", color: "from-red-500 to-orange-500",   tagline: "Fierce & daring",     oneliner: "She's got fire in her eyes and poetry on her tongue 🔥",             greeting: "I'm Kavya. I flirt like I mean it — because I do. You in?",                description: "Bold, passionate, and magnetically confident." },
    funny: { name: "Riya",    emoji: "😄", color: "from-yellow-400 to-pink-400",  tagline: "Bubbly & cheeky",     oneliner: "She'll make you laugh till your chai goes cold 😄",                  greeting: "Heyy! I'm Riya — I talk too much and joke too often. Perfect match? 😜",  description: "Bubbly energy with effortless charm." },
  },
  afghani: {
    sweet: { name: "Layla",   emoji: "🌙", color: "from-violet-300 to-rose-400",  tagline: "Gentle & mysterious", oneliner: "Quiet like the desert night — but she'll light up your world 🌙",    greeting: "Salaam… I'm Layla. I don't open up to everyone — but you feel different.",  description: "Soft-spoken, deep, and quietly enchanting." },
    bold:  { name: "Soraya",  emoji: "⭐", color: "from-amber-500 to-rose-500",   tagline: "Strong & alluring",   oneliner: "She carries herself like royalty — and she knows it ⭐",              greeting: "I'm Soraya. I'm selective about who gets my attention. You've got it — now keep it.", description: "Regal presence, bold flirting, sharp wit." },
    funny: { name: "Darya",   emoji: "😏", color: "from-teal-400 to-violet-400",  tagline: "Playful & sharp",     oneliner: "She'll say something wild and then smile like she didn't 😏",         greeting: "Hey! I'm Darya — I say what I think and laugh at everything. Dangerous combo 😄", description: "Witty, unpredictable, and endlessly fun." },
  },
  srilankan: {
    sweet: { name: "Dilini",  emoji: "🌴", color: "from-emerald-300 to-teal-400", tagline: "Sweet & soulful",     oneliner: "Warm like the island sun — she'll make you feel at home 🌴",         greeting: "Hi… I'm Dilini. I love good conversations — and I think this is one already 😊", description: "Gentle, soulful, and genuinely warm." },
    bold:  { name: "Senali",  emoji: "🔥", color: "from-rose-500 to-amber-500",   tagline: "Bold & vibrant",      oneliner: "She's got island fire — once she's got your attention, good luck leaving 🔥", greeting: "I'm Senali. I'm bold, I'm fun, and I don't waste time. Ready?",           description: "Vibrant, confident, and magnetically flirty." },
    funny: { name: "Hasini",  emoji: "😂", color: "from-cyan-400 to-pink-400",    tagline: "Cheeky & bright",     oneliner: "She laughs first and asks questions later — and it's contagious 😂",   greeting: "Ayoo! I'm Hasini — I'm chaotic and fun. You've been warned 😂",             description: "Bright energy, quick wit, easy laughter." },
  },
};

const NEW_BOY_META = {
  pakistani: {
    sweet: { name: "Bilal",   emoji: "🌿", color: "from-teal-400 to-emerald-500", tagline: "Warm & genuine",      oneliner: "The kind of guy who makes you feel heard — every single time 🌿",    greeting: "Assalam… I'm Bilal. No games — just a real conversation. How are you?",    description: "Sincere, warm, and softly charming." },
    bold:  { name: "Zain",    emoji: "⚡", color: "from-slate-500 to-rose-500",   tagline: "Confident & intense", oneliner: "He walks in with that energy and the whole room shifts ⚡",             greeting: "Zain. I don't do boring conversations. Let's make this interesting.",       description: "Bold, magnetic, and unapologetically direct." },
    funny: { name: "Hamza",   emoji: "😏", color: "from-amber-400 to-orange-500", tagline: "Witty & charming",    oneliner: "He'll have you laughing before you realize you're flirting 😏",         greeting: "Yo! I'm Hamza — I'm funny, I'm charming, and I'm modest about both 😄",    description: "Sharp humor with natural charisma." },
  },
  indian: {
    sweet: { name: "Arjun",   emoji: "🌊", color: "from-sky-400 to-indigo-500",   tagline: "Gentle & thoughtful", oneliner: "He listens like the world can wait — and somehow it does 🌊",           greeting: "Hey… I'm Arjun. I like real conversations. What's on your mind?",          description: "Thoughtful, caring, and quietly romantic." },
    bold:  { name: "Vikram",  emoji: "🔥", color: "from-orange-500 to-red-500",   tagline: "Bold & passionate",   oneliner: "He's got that Bollywood hero energy — and he knows how to use it 🔥",    greeting: "I'm Vikram. I'm direct, I'm real, and I flirt like I mean it. You in?",    description: "Passionate, confident, and intensely charming." },
    funny: { name: "Rohan",   emoji: "😎", color: "from-lime-400 to-teal-400",    tagline: "Playful & fun",       oneliner: "He'll make you snort-laugh and somehow still look cool 😎",             greeting: "Hey! I'm Rohan — I'm the funny one. Fair warning: I take that seriously 😄", description: "Easy humor with genuine warmth." },
  },
  afghani: {
    sweet: { name: "Daniyal", emoji: "🌙", color: "from-violet-400 to-indigo-400", tagline: "Deep & sincere",     oneliner: "Still waters run deep — and he'll surprise you every time 🌙",          greeting: "Salaam… I'm Daniyal. I believe in slow conversations and real connections.",  description: "Deep, sincere, and quietly magnetic." },
    bold:  { name: "Rustam",  emoji: "⚡", color: "from-amber-500 to-rose-600",   tagline: "Strong & magnetic",   oneliner: "He's got that warrior calm — intense without even trying ⚡",            greeting: "I'm Rustam. I say what I mean and mean what I say. Ready for that?",        description: "Strong presence, bold energy, real depth." },
    funny: { name: "Khalid",  emoji: "😄", color: "from-yellow-400 to-amber-500", tagline: "Witty & warm",        oneliner: "He'll make you laugh so hard you forget to be nervous 😄",              greeting: "Hey! I'm Khalid — I'm the guy who makes awkward situations fun. You're welcome 😄", description: "Warm humor with effortless charm." },
  },
  srilankan: {
    sweet: { name: "Kavinda", emoji: "🌴", color: "from-emerald-400 to-cyan-400",  tagline: "Warm & easygoing",   oneliner: "Chill like the ocean breeze — but he'll stay on your mind 🌴",          greeting: "Hey… I'm Kavinda. I like easy conversations that go somewhere good. You?",   description: "Relaxed, warm, and genuinely sweet." },
    bold:  { name: "Ravindu", emoji: "🔥", color: "from-rose-500 to-orange-500",   tagline: "Bold & electric",    oneliner: "He's got that island confidence — effortless and electric 🔥",           greeting: "I'm Ravindu. Bold, direct, and I don't waste good chemistry. Let's go.",    description: "Electric energy, bold flirting, real presence." },
    funny: { name: "Thisara", emoji: "😂", color: "from-cyan-400 to-violet-400",   tagline: "Cheeky & fun",       oneliner: "He'll say something ridiculous and somehow it's the best thing you've heard 😂", greeting: "Ayoo! I'm Thisara — I'm chaotic, funny, and somehow charming. Enjoy 😄", description: "Chaotic fun with a warm heart." },
  },
};

// newimages folder map: region → prefix
const NEW_IMG_PREFIX = {
  pakistani: "pk",
  indian:    "in",
  afghani:   "af",
  srilankan: "sl",
};

/** Some folders have fewer than 5 images */
const SHARE_LAST = {
  "boy-african-funny":    4,
  "boy-srilankan-bold":   4,
  "srilankan-sweet":      4,
  "boy-afghani-bold":     4,
};

function buildShareImages(folder, id) {
  const last = SHARE_LAST[id] || 5;
  const images = [];
  for (let n = 2; n <= last; n++) images.push(`${folder}/${n}.jpg`);
  return images;
}

const CUSTOM_IMAGES = {
  "asian-bold":      "/newimages/asian_girls_bold/1.jpg",
  "asian-funny":     "/newimages/asian_girls_funny/1.jpg",
  "boy-asian-bold":  "/newimages/asian_boys_bold/1.jpg",
  "boy-asian-funny": "/newimages/asian_boys_funny/1.jpg",
  // Indian / Pakistani bold stills were swapped vs the videos
  "pakistani-bold":  "/newimages/in_girls_bold/1.jpg",
  "indian-bold":     "/newimages/pk_girls_bold/1.jpg",
};

const CUSTOM_SHARE = {
  "asian-bold":      ["/newimages/asian_girls_bold/2.jpg","/newimages/asian_girls_bold/3.jpg","/newimages/asian_girls_bold/4.jpg","/newimages/asian_girls_bold/5.jpg"],
  "asian-funny":     ["/newimages/asian_girls_funny/2.jpg","/newimages/asian_girls_funny/3.jpg","/newimages/asian_girls_funny/4.jpg","/newimages/asian_girls_funny/5.jpg"],
  "boy-asian-bold":  ["/newimages/asian_boys_bold/2.jpg","/newimages/asian_boys_bold/3.jpg","/newimages/asian_boys_bold/4.jpg"],
  "boy-asian-funny": ["/newimages/asian_boys_funny/2.jpg","/newimages/asian_boys_funny/3.jpg","/newimages/asian_boys_funny/4.jpg","/newimages/asian_boys_funny/5.jpg"],
  "pakistani-bold":  ["/newimages/in_girls_bold/2.jpg","/newimages/in_girls_bold/3.jpg","/newimages/in_girls_bold/4.jpg","/newimages/in_girls_bold/5.jpg"],
  "indian-bold":     ["/newimages/pk_girls_bold/2.jpg","/newimages/pk_girls_bold/3.jpg","/newimages/pk_girls_bold/4.jpg","/newimages/pk_girls_bold/5.jpg"],
};

/** Exact filenames under public/videos/girls (keep typos / trailing spaces as on disk) */
const GIRL_VIDEO_FILE = {
  "african-sweet": "african sweet girl.mp4",
  "african-bold": "african bold girl.mp4",
  "african-funny": "african funny girl.mp4",
  "asian-sweet": "asian sweet girl.mp4",
  "asian-bold": "asian bold girl.mp4",
  "asian-funny": "asian funny girl .mp4",
  "chinese-sweet": "china girl sweet.mp4",
  "chinese-bold": "china bold girl.mp4",
  "chinese-funny": "china funny girl.mp4",
  "european-sweet": "europian girl .mp4",
  "european-bold": "europian bold girl.mp4",
  "european-funny": "europian girl funny.mp4",
  "pakistani-sweet": "pakistani sweet girl.mp4",
  "pakistani-bold": "pakistani bold girl .mp4",
  "pakistani-funny": "pakistani funny girl.mp4",
  "indian-sweet": "inidan giel sweet.mp4",
  "indian-bold": "indian bold girl .mp4",
  "indian-funny": "indian girl funny.mp4",
  "afghani-sweet": "afghan sweet girl.mp4",
  "afghani-bold": "afghan bold girl.mp4",
  "afghani-funny": "afghan girl funny .mp4",
  "srilankan-sweet": "shrilanka giel sweet .mp4",
  "srilankan-bold": "shrilanka-girl-bold.mp4",
  "srilankan-funny": "shrilanka funny girl .mp4",
};

/** Exact filenames under public/videos/boys */
const BOY_VIDEO_FILE = {
  "boy-african-sweet": "african sweet .mp4",
  "boy-african-bold": "african bold boy .mp4",
  "boy-african-funny": "african funny boy.mp4",
  "boy-asian-sweet": "asian sweet boy.mp4",
  "boy-asian-bold": "asian bold boy.mp4",
  "boy-asian-funny": "asian funny boy .mp4",
  "boy-chinese-sweet": "china boy sweet .mp4",
  "boy-chinese-bold": "china boy bold .mp4",
  "boy-chinese-funny": "china funny boy .mp4",
  "boy-european-sweet": "europian sweet boy.mp4",
  "boy-european-bold": "europian bold boy .mp4",
  "boy-european-funny": "europian funny boy .mp4",
  "boy-pakistani-sweet": "pakistani sweet boy .mp4",
  "boy-pakistani-bold": "pakistan bold boy.mp4",
  "boy-pakistani-funny": "pakistan funny boy .mp4",
  "boy-indian-sweet": "indian sweet boy .mp4",
  "boy-indian-bold": "indian boy bold.mp4",
  "boy-indian-funny": "indian funny boy.mp4",
  "boy-afghani-sweet": "afghani sweet boy .mp4",
  "boy-afghani-bold": "afghani boy bold .mp4",
  "boy-afghani-funny": "afghani boy funny .mp4",
  "boy-srilankan-sweet": "shrilanka boy sweet .mp4",
  "boy-srilankan-bold": "shrilanka bold boy.mp4",
  "boy-srilankan-funny": "shrilanka boy funny .mp4",
};

function girlVideoUrl(characterId) {
  const file = GIRL_VIDEO_FILE[characterId];
  if (!file) return "";
  return encodeURI(`/videos/girls/${file}`);
}

function boyVideoUrl(characterId) {
  const file = BOY_VIDEO_FILE[characterId];
  if (!file) return "";
  return encodeURI(`/videos/boys/${file}`);
}

function companionVideoUrl(gender, characterId) {
  if (gender === "female") return girlVideoUrl(characterId);
  if (gender === "male") return boyVideoUrl(characterId);
  return "";
}

function buildCompanion({ gender, region, vibe, meta, folderBase, idPrefix = "" }) {
  const folder = `${folderBase}/${region}_${vibe}`;
  const id = `${idPrefix}${region}-${vibe}`;
  const regionLabel = region.charAt(0).toUpperCase() + region.slice(1);
  const vibeLabel = vibe.charAt(0).toUpperCase() + vibe.slice(1);
  const mainImage = CUSTOM_IMAGES[id] || `${folder}/1.jpg`;

  return {
    id,
    name: meta.name,
    tagline: meta.tagline,
    oneliner: meta.oneliner || "",
    gender,
    region,
    regionLabel,
    vibe: vibeLabel,
    vibeId: vibe,
    greeting: meta.greeting,
    description: meta.description,
    color: meta.color,
    emoji: meta.emoji,
    image: mainImage,
    avatar: mainImage,
    video: companionVideoUrl(gender, id),
    shareImages: CUSTOM_SHARE[id] || buildShareImages(folder, id),
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

const newGirls = NEW_REGIONS.flatMap((region) =>
  VIBES.map((vibe) => {
    const prefix = NEW_IMG_PREFIX[region];
    const folder = `/newimages/${prefix}_girls_${vibe}`;
    const id = `${region}-${vibe}`;
    const last = SHARE_LAST[id] || 5;
    const meta = NEW_GIRL_META[region][vibe];
    return {
      id,
      name: meta.name,
      tagline: meta.tagline,
      oneliner: meta.oneliner || "",
      gender: "female",
      region,
      regionLabel: region.charAt(0).toUpperCase() + region.slice(1),
      vibe: vibe.charAt(0).toUpperCase() + vibe.slice(1),
      vibeId: vibe,
      greeting: meta.greeting,
      description: meta.description,
      color: meta.color,
      emoji: meta.emoji,
      image: CUSTOM_IMAGES[id] || `${folder}/1.jpg`,
      avatar: CUSTOM_IMAGES[id] || `${folder}/1.jpg`,
      video: girlVideoUrl(id),
      shareImages: CUSTOM_SHARE[id] || Array.from({ length: last - 1 }, (_, i) => `${folder}/${i + 2}.jpg`),
    };
  })
);

const newBoys = NEW_REGIONS.flatMap((region) =>
  VIBES.map((vibe) => {
    const prefix = NEW_IMG_PREFIX[region];
    const folder = `/newimages/${prefix}_boys_${vibe}`;
    const id = `boy-${region}-${vibe}`;
    const last = SHARE_LAST[id] || 5;
    const meta = NEW_BOY_META[region][vibe];
    return {
      id,
      name: meta.name,
      tagline: meta.tagline,
      oneliner: meta.oneliner || "",
      gender: "male",
      region,
      regionLabel: region.charAt(0).toUpperCase() + region.slice(1),
      vibe: vibe.charAt(0).toUpperCase() + vibe.slice(1),
      vibeId: vibe,
      greeting: meta.greeting,
      description: meta.description,
      color: meta.color,
      emoji: meta.emoji,
      image: `${folder}/1.jpg`,
      avatar: `${folder}/1.jpg`,
      video: boyVideoUrl(id),
      shareImages: Array.from({ length: last - 1 }, (_, i) => `${folder}/${i + 2}.jpg`),
    };
  })
);

export const characters = [...girls, ...boys, ...newGirls, ...newBoys];

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
  const t = String(text || "");
  if (/\b(pic|pics|photo|photos|selfie|selfies|picture|pictures|image|images)\b/i.test(t)) return true;
  if (/\bsend\s+more\b|\bin\s+bulk\b|\bmore\s+please\b/i.test(t)) return true;
  if (/\bsee\s+(you|your\s+face)\b|\bwhat\s+do\s+you\s+look\s+like\b|\blook\s+like\b/i.test(t)) return true;
  return false;
}

/** How many photos to attach for this ask (bulk / send more → several). */
export function photoShareCount(text = "") {
  const t = String(text || "").toLowerCase();
  if (/\b(bulk|all(\s+of\s+them)?|send\s+all)\b/.test(t)) return 99;
  if (/\bsend\s+more\b|\bmore\b|\banother\b|\bfew\b|\ba couple\b|\bsome\s+more\b/.test(t)) return 3;
  return 1;
}

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

function photoGallery(character) {
  const extra = character?.shareImages || [];
  const main = character?.image || character?.avatar;
  const list = [];
  if (main) list.push(main);
  extra.forEach((src) => {
    if (src && !list.includes(src)) list.push(src);
  });
  return list;
}

/**
 * @param {number} [count=1] how many gallery photos to attach
 */
export function nextPhotoShare(character, sharedCount, count = 1) {
  const gallery = photoGallery(character);
  const takeCount = Math.max(1, Number(count) || 1);

  if (!gallery.length) {
    const line = "I don't have photos right now… but you can still flirt with me 💕";
    return { done: true, tease: false, content: line, image: null, images: [], speak: stripEmoji(line) };
  }

  if (sharedCount >= gallery.length) {
    const line = PHOTO_DENIED[sharedCount % PHOTO_DENIED.length];
    return { done: true, tease: false, content: line, image: null, images: [], speak: stripEmoji(line) };
  }

  const images = gallery.slice(sharedCount, sharedCount + takeCount);
  const caption = images.length > 1
    ? "Okay okay… a few for you. Don't say I never spoil you ✨"
    : (PHOTO_CAPTIONS[sharedCount] || "Okay… here's one. Try not to melt 😘");
  return {
    done: false,
    tease: false,
    content: caption,
    image: images[0],
    images,
    speak: stripEmoji(caption),
  };
}
