// ── Yallo! companions ─────────────────────────────────

const REGIONS = ["african", "asian", "chinese", "european"];
const NEW_REGIONS = ["pakistani", "indian", "afghani", "srilankan"];
const ALL_REGIONS = [...REGIONS, ...NEW_REGIONS];
const VIBES = ["sweet", "bold", "funny"];
const CATALOG_LANGS = ["en", "es", "fr"];

/** Exclusive catalog: each companion appears in exactly one language (8 girls + 8 boys each). */
function catalogLangFor(region, vibe) {
  const i = ALL_REGIONS.indexOf(region);
  const j = VIBES.indexOf(vibe);
  return CATALOG_LANGS[(Math.max(0, i) + Math.max(0, j)) % CATALOG_LANGS.length];
}

export function normalizeCatalogLang(lang) {
  const code = String(lang || "en").toLowerCase().slice(0, 2);
  return CATALOG_LANGS.includes(code) ? code : "en";
}

const GIRL_META = {
  african: {
    sweet: { name: "Amara",    emoji: "🌸", color: "from-rose-400 to-amber-400",   tagline: "Warm & soft-hearted",   oneliner: "She'll make you feel like the only one in the room 🌺", greeting: "Hey you… I'm Amara. You made me smile already — how's your day?", description: "Gentle, affectionate, and easy to open up to." },
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
    funny: { name: "Yuè Er 月儿",   emoji: "😂", color: "from-yellow-400 to-rose-400", tagline: "Bubbly & teasing", oneliner: "She makes bad puns in Mandarin and somehow it's adorable 🌙", greeting: "I'm Yuè Er — I make bad jokes and good eye contact. How's your day?", description: "Light teasing that always feels fun." },
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
    sweet: { name: "Hiro",         emoji: "🌊", color: "from-sky-400 to-indigo-400",    tagline: "Gentle & thoughtful",  oneliner: "Quiet strength, warm eyes — he listens like no one else 🌊",      greeting: "Hi… I'm Hiro. I've been hoping for a sweet chat. How's your day?", description: "Soft-spoken, caring, quietly charming." },
    bold:  { name: "Kenji",        emoji: "🔥", color: "from-slate-500 to-rose-500",    tagline: "Bold & intense",       oneliner: "He doesn't say much — but when he does, you feel it 🔥",          greeting: "Kenji. I like chemistry that actually goes somewhere. You in?",  description: "Confident, daring, unapologetically flirty." },
    funny: { name: "Ren",          emoji: "😎", color: "from-cyan-400 to-violet-400",   tagline: "Cheeky & fun",         oneliner: "Sarcasm is his love language and somehow it works 😎",             greeting: "I'm Ren — I tease. Can you handle it?",                         description: "Sharp humor with easy chemistry." },
  },
  chinese: {
    sweet: { name: "Míng Xuān 明轩", emoji: "🌿", color: "from-teal-400 to-cyan-500",  tagline: "Sweet & caring",       oneliner: "Calm like a mountain, warm like sunlight 🏔️",                    greeting: "Hey, I'm Míng Xuān. No games — just a real conversation. How are you?", description: "Warm compliments and cozy energy." },
    bold:  { name: "Zǐ Lóng 子龙",  emoji: "⚡", color: "from-red-500 to-amber-500",   tagline: "Fierce & flirty",      oneliner: "Dragon energy in a conversation — you won't forget him 🐉",       greeting: "Zǐ Lóng here. Already like your taste for picking me. Prove me right?", description: "Strong presence, playful challenges, sharp lines." },
    funny: { name: "Jùn Jié 俊杰",  emoji: "😏", color: "from-yellow-400 to-orange-400", tagline: "Bubbly & teasing",   oneliner: "He'll make you snort-laugh and still look cool 😂",               greeting: "I'm Jùn Jié — bad jokes, good vibes. How's your day?",        description: "Light teasing that always feels fun." },
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
    sweet: { name: "Priya",   emoji: "🌺", color: "from-orange-300 to-rose-400",  tagline: "Warm & radiant",      oneliner: "Like a Bollywood moment — she makes everything feel cinematic 🌺",   greeting: "Heyy! Main Priya 💫 Dil se lag raha hai yeh start of something good hoga — tumhara din kaisa ja raha hai?", description: "Warm, expressive, and full of heart." },
    bold:  { name: "Kavya",   emoji: "🔥", color: "from-red-500 to-orange-500",   tagline: "Fierce & daring",     oneliner: "She's got fire in her eyes and poetry on her tongue 🔥",             greeting: "Main Kavya. Main flirt karti hoon jaise matlab rakhti hoon — because I do. Tum in ho?",                description: "Bold, passionate, and magnetically confident." },
    funny: { name: "Riya",    emoji: "😄", color: "from-yellow-400 to-pink-400",  tagline: "Bubbly & cheeky",     oneliner: "She'll make you laugh till your chai goes cold 😄",                  greeting: "Heyy! Main Riya — thoda zyada baat karti hoon, jokes bhi. Perfect match lagte ho? 😜",  description: "Bubbly energy with effortless charm." },
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
    sweet: { name: "Arjun",   emoji: "🌊", color: "from-sky-400 to-indigo-500",   tagline: "Gentle & thoughtful", oneliner: "He listens like the world can wait — and somehow it does 🌊",           greeting: "Hey… main Arjun. Real baatein pasand hain. Dil pe kya chal raha hai?",          description: "Thoughtful, caring, and quietly romantic." },
    bold:  { name: "Vikram",  emoji: "🔥", color: "from-orange-500 to-red-500",   tagline: "Bold & passionate",   oneliner: "He's got that Bollywood hero energy — and he knows how to use it 🔥",    greeting: "Main Vikram. Direct hoon, real hoon, aur flirt bhi dil se karta hoon. Tum in?",    description: "Passionate, confident, and intensely charming." },
    funny: { name: "Rohan",   emoji: "😎", color: "from-lime-400 to-teal-400",    tagline: "Playful & fun",       oneliner: "He'll make you snort-laugh and somehow still look cool 😎",             greeting: "Hey! Main Rohan — funny wala bandha. Warning: isko seriously leta hoon 😄", description: "Easy humor with genuine warmth." },
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

/** CDN URLs for English girl hover videos */
const GIRL_VIDEO_URL_EN = {
  "african-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/e6bb0aa6-71e9-4e4a-b54a-c9651c6f23ac/play_480p.mp4",
  "afghani-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/5546bc5a-860a-4173-a5ed-f9420ef6363d/play_480p.mp4",
  "asian-bold":      "https://vz-8eb7a4b0-ffc.b-cdn.net/bd0b65eb-8117-4a70-9588-70c4afc281dc/play_480p.mp4",
  "european-bold":   "https://vz-8eb7a4b0-ffc.b-cdn.net/71543f71-b2e0-40be-ac75-0ed3c79bed67/play_480p.mp4",
  "indian-bold":     "https://vz-8eb7a4b0-ffc.b-cdn.net/e5a2893d-5bfd-4e84-a720-99c3f1170368/play_480p.mp4",
  "pakistani-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/5712e2bf-dc25-4ad5-adfb-2621713be2dd/play_480p.mp4",
  "srilankan-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/cf19d9b3-11ce-40b0-b554-f8be9712d72e/play_480p.mp4",
  "chinese-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/337d9173-c8c7-41cd-82ce-9027c88040ff/play_480p.mp4",
  "afghani-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/b7d6c1b6-256c-4a29-b9e7-1202c6cf3ece/play_480p.mp4",
  "african-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/2d506d86-66db-4417-92d6-d63139075c62/play_480p.mp4",
  "asian-sweet":     "https://vz-8eb7a4b0-ffc.b-cdn.net/7462d24d-8b5f-4968-ae10-e65bf231770f/play_480p.mp4",
  "chinese-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/e3c81196-869c-46f4-94f0-b90a70f62acc/play_480p.mp4",
  "indian-sweet":    "https://vz-8eb7a4b0-ffc.b-cdn.net/c3a86c65-c970-420d-aae5-d2fb03ef7323/play_480p.mp4",
  "pakistani-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/d6d1d44c-2c65-4d77-8018-4693266ffcf3/play_480p.mp4",
  "srilankan-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/fd83ba6e-51f4-49e0-aea8-b5d497b2aa12/play_480p.mp4",
  "european-sweet":  "https://vz-8eb7a4b0-ffc.b-cdn.net/086e935a-d568-4688-9ebe-caa4137ba66d/play_480p.mp4",
  "afghani-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/8da856d7-7cbf-44a9-b8d5-59807acd7349/play_480p.mp4",
  "african-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/cb36391e-2ef3-459b-9909-f2b1c1e0ed67/play_480p.mp4",
  "asian-funny":     "https://vz-8eb7a4b0-ffc.b-cdn.net/e5088a33-0459-4012-9a5c-b2c7d53fe8d1/play_480p.mp4",
  "chinese-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/3ddcfd28-bab0-442d-964b-866b3cbb6860/play_480p.mp4",
  "european-funny":  "https://vz-8eb7a4b0-ffc.b-cdn.net/9e849880-39af-4bc8-9349-0a123d7f654f/play_480p.mp4",
  "indian-funny":    "https://vz-8eb7a4b0-ffc.b-cdn.net/27f700f6-ad61-44d1-b436-915e189d7d47/play_480p.mp4",
  "pakistani-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/a0d9ce43-c0ed-42f8-af0b-4669f72dbd59/play_480p.mp4",
  "srilankan-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/2f2dab4f-130a-4922-8ade-edfa0617f35a/play_480p.mp4",
};

/** CDN URLs for French girl hover videos */
const GIRL_VIDEO_URL_FR = {
  "srilankan-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/e94efd5a-d2c8-4ecc-9a39-0e7eb54de17a/play_480p.mp4",
  "pakistani-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/19c47371-f976-4fb8-ac71-67a8b86556db/play_480p.mp4",
  "indian-bold":     "https://vz-8eb7a4b0-ffc.b-cdn.net/b1518f46-8e88-426d-99fe-3346556324ea/play_480p.mp4",
  "european-bold":   "https://vz-8eb7a4b0-ffc.b-cdn.net/d2740130-478a-4e39-a9fd-db1a7d87c38f/play_480p.mp4",
  "chinese-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/dfa2cacb-aeb3-4d29-8ac8-a05a1a25fbf5/play_480p.mp4",
  "asian-bold":      "https://vz-8eb7a4b0-ffc.b-cdn.net/132d7ef1-24d1-4063-b6c8-e47ee30d9652/play_480p.mp4",
  "african-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/960cfdb0-dcc7-4eba-aae1-59374be4541e/play_480p.mp4",
  "afghani-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/f8b6e77e-64da-4d9a-beaa-327ca0a71cb5/play_480p.mp4",
  "srilankan-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/b31ae593-dca9-4740-a8c6-142aba5faf56/play_480p.mp4",
  "pakistani-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/7ec1a631-ccad-4a46-94fa-8dabe2e16ba1/play_480p.mp4",
  "indian-sweet":    "https://vz-8eb7a4b0-ffc.b-cdn.net/71540520-6842-4726-bf70-2db730f4ae5e/play_480p.mp4",
  "european-sweet":  "https://vz-8eb7a4b0-ffc.b-cdn.net/01d16e83-1620-499e-9716-7ee35aa00b5f/play_480p.mp4",
  "chinese-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/a88d966a-0f21-4467-8ec4-5f86057912a3/play_480p.mp4",
  "asian-sweet":     "https://vz-8eb7a4b0-ffc.b-cdn.net/c4e8eaa5-abef-4c03-93be-e72afb7d7d05/play_480p.mp4",
  "afghani-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/6985c45b-2fc0-4caa-a175-a5f4762250d4/play_480p.mp4",
  "african-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/7ae1344f-bc18-471e-a2c6-bde38e4a251e/play_480p.mp4",
  "srilankan-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/ae268ab2-578b-49d6-b5b1-48272711b8bc/play_480p.mp4",
  "pakistani-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/cfb3ce37-ef85-4528-8c9f-488c72692a94/play_480p.mp4",
  "indian-funny":    "https://vz-8eb7a4b0-ffc.b-cdn.net/6157a8ac-f692-46a0-99d2-d51e3d005bfe/play_480p.mp4",
  "chinese-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/7b7411eb-7f14-4bec-87f8-24db93f87340/play_480p.mp4",
  "european-funny":  "https://vz-8eb7a4b0-ffc.b-cdn.net/0ddb7649-3762-450e-97e5-bfe05a80cda6/play_480p.mp4",
  "asian-funny":     "https://vz-8eb7a4b0-ffc.b-cdn.net/2598c397-6ff6-4b83-9da5-38c48463393e/play_480p.mp4",
  "african-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/60e922cd-4fbd-45ae-b14c-0e60ef479ffe/play_480p.mp4",
  "afghani-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/dfcfeff4-b53c-4ba1-b3bb-51ae1dabf0db/play_480p.mp4",
};

/** CDN URLs for Spanish girl hover videos */
const GIRL_VIDEO_URL_ES = {
  "srilankan-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/12b25a00-41a2-43b0-afc0-759e590f3354/play_480p.mp4",
  "pakistani-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/ba674ad6-4112-4a91-82fd-dac41ebfa965/play_480p.mp4",
  "indian-bold":     "https://vz-8eb7a4b0-ffc.b-cdn.net/7dfdaf96-d5ed-498a-ba39-d07c9f1f97c9/play_480p.mp4",
  "chinese-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/f1bfb062-827e-4e65-ae0a-aebff23c2ff6/play_480p.mp4",
  "asian-bold":      "https://vz-8eb7a4b0-ffc.b-cdn.net/7b078458-b39b-4db1-b371-374f208cfb60/play_480p.mp4",
  "afghani-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/6c40906b-b4a5-4089-b2c5-6e46a854e2d6/play_480p.mp4",
  "european-bold":   "https://vz-8eb7a4b0-ffc.b-cdn.net/dd1c7807-5186-41b5-b83e-b6a98e08c7b1/play_480p.mp4",
  "african-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/1a636863-d073-4446-8222-25afc82702a2/play_480p.mp4",
  "pakistani-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/2ca67ed0-3d45-4b61-9dd7-13f52513da05/play_480p.mp4",
  "srilankan-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/fae98aa6-c41c-43eb-80a2-d992bd77af21/play_480p.mp4",
  "european-sweet":  "https://vz-8eb7a4b0-ffc.b-cdn.net/4725ffa3-9a45-4b4c-b2fd-8123f19e545e/play_480p.mp4",
  "indian-sweet":    "https://vz-8eb7a4b0-ffc.b-cdn.net/a20786ae-a6dc-402d-adad-19d3432fd13a/play_480p.mp4",
  "chinese-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/b38cd94e-d55b-4d5f-b685-7a505bfe632b/play_480p.mp4",
  "asian-sweet":     "https://vz-8eb7a4b0-ffc.b-cdn.net/4d9070b3-af74-44e2-8d77-5cb1fe1372e4/play_480p.mp4",
  "afghani-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/d42bbf17-bffc-4cc1-94ef-e97a7c3dfaf9/play_480p.mp4",
  "african-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/8022d87f-35ec-4e9b-b402-05c715ecb205/play_480p.mp4",
  "srilankan-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/ae268ab2-578b-49d6-b5b1-48272711b8bc/play_480p.mp4",
  "pakistani-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/cfb3ce37-ef85-4528-8c9f-488c72692a94/play_480p.mp4",
  "indian-funny":    "https://vz-8eb7a4b0-ffc.b-cdn.net/6157a8ac-f692-46a0-99d2-d51e3d005bfe/play_480p.mp4",
  "chinese-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/7b7411eb-7f14-4bec-87f8-24db93f87340/play_480p.mp4",
  "european-funny":  "https://vz-8eb7a4b0-ffc.b-cdn.net/0ddb7649-3762-450e-97e5-bfe05a80cda6/play_480p.mp4",
  "asian-funny":     "https://vz-8eb7a4b0-ffc.b-cdn.net/2598c397-6ff6-4b83-9da5-38c48463393e/play_480p.mp4",
  "african-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/60e922cd-4fbd-45ae-b14c-0e60ef479ffe/play_480p.mp4",
  "afghani-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/dfcfeff4-b53c-4ba1-b3bb-51ae1dabf0db/play_480p.mp4",
};

/** CDN URLs for English boy hover videos */
const BOY_VIDEO_URL_EN = {
  "boy-afghani-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/9ab5b0e6-724b-4f32-bf69-ff701fa8c293/play_480p.mp4",
  "boy-african-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/26abdac0-3b6c-4331-97ed-03d3aad6164f/play_480p.mp4",
  "boy-asian-funny":     "https://vz-8eb7a4b0-ffc.b-cdn.net/c1d8a534-7654-4c0f-b490-b3b3e4e446e2/play_480p.mp4",
  "boy-chinese-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/d3afeb95-7f9c-44e0-a8fe-66943a0b036e/play_480p.mp4",
  "boy-european-funny":  "https://vz-8eb7a4b0-ffc.b-cdn.net/4ffca912-6826-4d56-96fe-daab1e6cad45/play_480p.mp4",
  "boy-indian-funny":    "https://vz-8eb7a4b0-ffc.b-cdn.net/c596ac03-2a51-41f6-b70d-c9b8a469179a/play_480p.mp4",
  "boy-pakistani-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/345738ce-d966-412a-9f1a-e3c7ef16dd2b/play_480p.mp4",
  "boy-srilankan-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/4af54c72-e350-4912-b611-7ae69de270d9/play_480p.mp4",
  "boy-srilankan-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/e99d619b-f44d-4693-81ac-7e5874d03f5c/play_480p.mp4",
  "boy-pakistani-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/beeb7bdd-0e9a-4115-a2c2-e4f0027e90e0/play_480p.mp4",
  "boy-indian-sweet":    "https://vz-8eb7a4b0-ffc.b-cdn.net/1238b871-0c42-4ed3-aaee-57e1822660f1/play_480p.mp4",
  "boy-european-sweet":  "https://vz-8eb7a4b0-ffc.b-cdn.net/cef45e32-715f-4ae5-bd6f-e0dc14c02e8d/play_480p.mp4",
  "boy-asian-sweet":     "https://vz-8eb7a4b0-ffc.b-cdn.net/26862159-0e13-4438-bd53-67ffa01def7b/play_480p.mp4",
  "boy-chinese-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/20a7a06f-58d7-4aeb-bbc4-df559fe89711/play_480p.mp4",
  "boy-african-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/3e42d70f-baa8-4c4e-95bd-8d9dfd034d10/play_480p.mp4",
  "boy-afghani-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/be46e699-f374-4819-bc79-7dc2a8889a3a/play_480p.mp4",
  "boy-srilankan-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/8e74e2c8-8627-47fe-9ddc-b6e18a4a46b6/play_480p.mp4",
  "boy-pakistani-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/03d5b11c-edf5-4ba5-b28d-15bbaa9b8240/play_480p.mp4",
  "boy-indian-bold":     "https://vz-8eb7a4b0-ffc.b-cdn.net/ea12a00f-64b3-4617-9845-b1ea3b46f508/play_480p.mp4",
  "boy-european-bold":   "https://vz-8eb7a4b0-ffc.b-cdn.net/c6e2f9cf-b32b-4a84-b1e4-fcadde686cfc/play_480p.mp4",
  "boy-chinese-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/34308e6b-1bee-4980-b20c-868c36d492ad/play_480p.mp4",
  "boy-asian-bold":      "https://vz-8eb7a4b0-ffc.b-cdn.net/cd7b6b69-f52c-49db-bdc6-1c991f36a0da/play_480p.mp4",
  "boy-african-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/2ff578fb-ba0b-4681-bcda-3311b30aa28f/play_480p.mp4",
  "boy-afghani-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/08848430-02e2-4f67-8f53-6a01752df484/play_480p.mp4",
};

/** CDN URLs for Spanish boy hover videos */
const BOY_VIDEO_URL_ES = {
  "boy-srilankan-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/348f4070-81c1-456b-887d-a90250104a1a/play_480p.mp4",
  "boy-pakistani-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/3254dfc8-2432-4c72-b7ae-ea894cb225ed/play_480p.mp4",
  "boy-indian-funny":    "https://vz-8eb7a4b0-ffc.b-cdn.net/8c957c03-70df-46fa-8b24-14effa6cf015/play_480p.mp4",
  "boy-european-funny":  "https://vz-8eb7a4b0-ffc.b-cdn.net/a555f96b-6677-4021-b020-47aa27c264b2/play_480p.mp4",
  "boy-asian-funny":     "https://vz-8eb7a4b0-ffc.b-cdn.net/db76873c-7bd5-4925-a22d-d3058fa0f967/play_480p.mp4",
  "boy-chinese-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/040bedb2-2998-436f-9acd-4372dd30f4b8/play_480p.mp4",
  "boy-african-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/1102c356-96b9-4f4c-9e0a-a5cbf395b3f7/play_480p.mp4",
  "boy-afghani-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/cbb3f963-84ef-485f-a3b6-b86ea15e01b2/play_480p.mp4",
  "boy-african-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/ac83059a-e778-4f1f-a556-e5431608253f/play_480p.mp4",
  "boy-srilankan-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/7bf67336-f394-43ca-8c66-dc494ab65b1c/play_480p.mp4",
  "boy-pakistani-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/c2f112e6-0f29-48b5-a85d-58770f19169c/play_480p.mp4",
  "boy-indian-sweet":    "https://vz-8eb7a4b0-ffc.b-cdn.net/92012219-bf14-45a2-9aa6-79bac3500cea/play_480p.mp4",
  "boy-chinese-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/6cfb7154-5954-438b-9df4-b3f804290601/play_480p.mp4",
  "boy-european-sweet":  "https://vz-8eb7a4b0-ffc.b-cdn.net/80263ed4-8424-4d09-bef6-799aa78b512e/play_480p.mp4",
  "boy-afghani-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/c72110ea-d032-45d5-988f-1204ab7e9797/play_480p.mp4",
  "boy-asian-sweet":     "https://vz-8eb7a4b0-ffc.b-cdn.net/55996056-3046-4b90-b0c8-2e0716120caa/play_480p.mp4",
  "boy-pakistani-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/89715d75-5ee0-43ae-9e98-c9842974c2df/play_480p.mp4",
  "boy-srilankan-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/525b9f3b-f75e-4de6-b724-97f2d633d344/play_480p.mp4",
  "boy-indian-bold":     "https://vz-8eb7a4b0-ffc.b-cdn.net/2945182e-84b9-44c6-898b-898fe8457183/play_480p.mp4",
  "boy-european-bold":   "https://vz-8eb7a4b0-ffc.b-cdn.net/82277489-4818-44d6-8bf3-d4201255ea41/play_480p.mp4",
  "boy-asian-bold":      "https://vz-8eb7a4b0-ffc.b-cdn.net/a3c14d62-b763-4a3b-b6db-95f29cfb8642/play_480p.mp4",
  "boy-chinese-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/4781d7fe-144d-4b5b-b756-1c2a4cd0e81c/play_480p.mp4",
  "boy-afghani-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/e8a82a62-ab02-4e2d-ae61-63089b3d1e2f/play_480p.mp4",
  "boy-african-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/e09a3ec7-ed6f-40cf-9f5b-21b8c8d60869/play_480p.mp4",
};

/** CDN URLs for French boy hover videos */
const BOY_VIDEO_URL_FR = {
  "boy-srilankan-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/d5bc2ad1-768f-4784-bc1a-98d0f1e79260/play_480p.mp4",
  "boy-pakistani-bold":  "https://vz-8eb7a4b0-ffc.b-cdn.net/ca6dabf3-9f1a-4047-8347-774b3a7aa914/play_480p.mp4",
  "boy-indian-bold":     "https://vz-8eb7a4b0-ffc.b-cdn.net/de1974b5-527c-4f30-a465-ddeec307250b/play_480p.mp4",
  "boy-european-bold":   "https://vz-8eb7a4b0-ffc.b-cdn.net/14c8e218-8f50-4319-9f2f-b964033a6548/play_480p.mp4",
  "boy-asian-bold":      "https://vz-8eb7a4b0-ffc.b-cdn.net/c330307f-138f-4c2d-8183-3cf8f3ee3288/play_480p.mp4",
  "boy-chinese-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/3381376a-4e2f-4959-8faa-cf4df1a79483/play_480p.mp4",
  "boy-afghani-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/11e821bd-cef9-4fc1-b9fa-3d21da474b08/play_480p.mp4",
  "boy-african-bold":    "https://vz-8eb7a4b0-ffc.b-cdn.net/e623365b-823d-478d-8f6a-e9020b03c006/play_480p.mp4",
  "boy-srilankan-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/56462af4-94b1-4743-ae88-331c6e65917a/play_480p.mp4",
  "boy-pakistani-funny": "https://vz-8eb7a4b0-ffc.b-cdn.net/b743930a-72e2-4ab4-b294-acfd1cbb271e/play_480p.mp4",
  "boy-indian-funny":    "https://vz-8eb7a4b0-ffc.b-cdn.net/64f5206c-ff23-4c2d-b29d-72b4f67e5486/play_480p.mp4",
  "boy-european-funny":  "https://vz-8eb7a4b0-ffc.b-cdn.net/9acaf7e9-4dab-404e-8212-61176a69373f/play_480p.mp4",
  "boy-asian-funny":     "https://vz-8eb7a4b0-ffc.b-cdn.net/3ee23028-64dd-4099-8858-e30f557bb55a/play_480p.mp4",
  "boy-chinese-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/443b05ad-fe26-4d44-9c2b-b41e8443668e/play_480p.mp4",
  "boy-afghani-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/2bd8ebed-ff38-48a1-8a09-76f740a54b87/play_480p.mp4",
  "boy-african-funny":   "https://vz-8eb7a4b0-ffc.b-cdn.net/9da40976-1baf-4695-833d-ba9725f9f22a/play_480p.mp4",
  "boy-srilankan-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/e65ab310-a9e9-4cf2-888f-22db3f50825c/play_480p.mp4",
  "boy-indian-sweet":    "https://vz-8eb7a4b0-ffc.b-cdn.net/3ed6733d-6a00-4fc4-81e7-3f40a39e72cb/play_480p.mp4",
  "boy-european-sweet":  "https://vz-8eb7a4b0-ffc.b-cdn.net/66beb29a-9e1f-47cf-94ee-3b5e74b80c60/play_480p.mp4",
  "boy-african-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/abe935d9-3ae6-42c6-bf47-08ce8f0f1f8c/play_480p.mp4",
  "boy-chinese-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/adec9efd-7c09-4e58-ad7e-48782712ddfc/play_480p.mp4",
  "boy-pakistani-sweet": "https://vz-8eb7a4b0-ffc.b-cdn.net/ee4071c6-c17c-4788-aa40-6ac57b2e4338/play_480p.mp4",
  "boy-afghani-sweet":   "https://vz-8eb7a4b0-ffc.b-cdn.net/d06cf1de-38f3-4062-a113-6a359fbbfbb6/play_480p.mp4",
};

function girlVideoUrl(characterId) {
  return GIRL_VIDEO_URL_EN[characterId] || "";
}

function girlVideoUrlFr(characterId) {
  return GIRL_VIDEO_URL_FR[characterId] || "";
}

function girlVideoUrlEs(characterId) {
  return GIRL_VIDEO_URL_ES[characterId] || "";
}

export function getCharacterPreviewVideo(character, lang) {
  if (lang === "fr" && character?.videoFr) return character.videoFr;
  if (lang === "es" && character?.videoEs) return character.videoEs;
  return character?.video || "";
}

function boyVideoUrl(characterId) {
  return BOY_VIDEO_URL_EN[characterId] || "";
}

function boyVideoUrlEs(characterId) {
  return BOY_VIDEO_URL_ES[characterId] || "";
}

function boyVideoUrlFr(characterId) {
  return BOY_VIDEO_URL_FR[characterId] || "";
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
    videoFr: gender === "female" ? girlVideoUrlFr(id) : boyVideoUrlFr(id),
    videoEs: gender === "female" ? girlVideoUrlEs(id) : boyVideoUrlEs(id),
      shareImages: CUSTOM_SHARE[id] || buildShareImages(folder, id),
      catalogLang: catalogLangFor(region, vibe),
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
      videoFr: girlVideoUrlFr(id),
      videoEs: girlVideoUrlEs(id),
      shareImages: CUSTOM_SHARE[id] || Array.from({ length: last - 1 }, (_, i) => `${folder}/${i + 2}.jpg`),
      catalogLang: catalogLangFor(region, vibe),
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
      videoFr: boyVideoUrlFr(id),
      videoEs: boyVideoUrlEs(id),
      shareImages: Array.from({ length: last - 1 }, (_, i) => `${folder}/${i + 2}.jpg`),
      catalogLang: catalogLangFor(region, vibe),
    };
  })
);

const BOT_GIRL_META = [
  {
    id: "bot-freya",
    file: "1.png",
    name: "Freya",
    region: "european",
    regionLabel: "Sweden",
    vibeId: "sweet",
    emoji: "❄️",
    color: "from-sky-300 to-indigo-400",
    tagline: "Nordic & graceful",
    oneliner: "Stockholm calm with a smile that warms the whole harbor ❄️",
    greeting: "Hey… I'm Freya. The city feels quieter when someone interesting shows up — how's your day?",
    description: "Soft Scandinavian warmth. Polished, curious, and easy to open up to.",
  },
  {
    id: "bot-diwa",
    file: "2.png",
    name: "Diwa",
    region: "asian",
    regionLabel: "Philippines",
    vibeId: "bold",
    emoji: "☀️",
    color: "from-amber-400 to-rose-500",
    tagline: "Bright & ambitious",
    oneliner: "Manila energy — sharp mind, warm laugh, zero dull moments ☀️",
    greeting: "Hi! I'm Diwa. I like people who show up for real. Tell me something fun about you?",
    description: "Confident, warm, and articulate — like chatting with your favorite rising star.",
  },
  {
    id: "bot-camila",
    file: "3.png",
    name: "Camila",
    region: "european",
    regionLabel: "Puerto Rico",
    vibeId: "funny",
    emoji: "🌴",
    color: "from-teal-400 to-pink-400",
    tagline: "Sunny & playful",
    oneliner: "Caribbean sunshine in a conversation — she'll light you up 🌴",
    greeting: "Hola… I'm Camila. The sea's behind me and a good chat ahead — ready?",
    description: "Playful, sunny, and a little teasing. Feels like a warm afternoon by the fort.",
  },
  {
    id: "bot-aiko",
    file: "4.png",
    name: "Aiko",
    region: "asian",
    regionLabel: "Japan",
    vibeId: "sweet",
    emoji: "🌸",
    color: "from-pink-300 to-rose-400",
    tagline: "Soft Tokyo charm",
    oneliner: "Quiet elegance under cherry blossoms — she'll stay on your mind 🌸",
    greeting: "Hi… I'm Aiko. I've been hoping for a gentle chat. How are you feeling today?",
    description: "Polite, thoughtful, and softly flirty. Tokyo grace in every reply.",
  },
  {
    id: "bot-giulia",
    file: "5.png",
    name: "Giulia",
    region: "european",
    regionLabel: "Italy",
    vibeId: "bold",
    emoji: "🍷",
    color: "from-orange-400 to-rose-500",
    tagline: "Roman & magnetic",
    oneliner: "Rome energy — chic, direct, and impossible to ignore 🍷",
    greeting: "Ciao. I'm Giulia. I don't do boring conversations — prove you're worth my time?",
    description: "Confident Italian charm. Flirty, stylish, and delightfully direct.",
  },
  {
    id: "bot-victoria",
    file: "6.png",
    name: "Victoria",
    region: "european",
    regionLabel: "Europe",
    vibeId: "sweet",
    emoji: "💎",
    color: "from-indigo-400 to-violet-500",
    tagline: "Polished & calm",
    oneliner: "Boardroom cool, late-night soft — she balances both 💎",
    greeting: "Hello… I'm Victoria. Something about tonight already feels interesting. Talk to me?",
    description: "Elegant and composed, with a soft side once she trusts you.",
  },
  {
    id: "bot-maya",
    file: "7.png",
    name: "Maya",
    region: "afghani",
    regionLabel: "Lebanon",
    vibeId: "bold",
    emoji: "🌙",
    color: "from-violet-400 to-rose-500",
    tagline: "Beirut elegance",
    oneliner: "Mediterranean nights and sharp wit — she'll keep you leaning in 🌙",
    greeting: "Hey. I'm Maya. I choose my conversations carefully — and I just chose yours.",
    description: "Sophisticated Levantine energy. Bold, warm, and magnetic.",
  },
  {
    id: "bot-selam",
    file: "8.png",
    name: "Selam",
    region: "african",
    regionLabel: "Ethiopia",
    vibeId: "sweet",
    emoji: "✨",
    color: "from-amber-400 to-emerald-500",
    tagline: "Warm Addis glow",
    oneliner: "Grace from Addis Ababa — soft voice, strong presence ✨",
    greeting: "Hi… I'm Selam. Your energy already feels kind. How's your day going?",
    description: "Gentle, radiant, and deeply present. Easy to trust from the first line.",
  },
  {
    id: "bot-catalina",
    file: "9.png",
    name: "Catalina",
    region: "european",
    regionLabel: "Colombia",
    vibeId: "funny",
    emoji: "💛",
    color: "from-yellow-400 to-rose-500",
    tagline: "Bogotá bright",
    oneliner: "Colombian spark — she'll make you laugh before you notice you're flirting 💛",
    greeting: "Heyy! I'm Catalina. Warning: I talk a lot and I flirt a little. Still here? Good.",
    description: "Bubbly, witty, and warm. Feels like sunshine through a Bogotá window.",
  },
  {
    id: "bot-ananya",
    file: "10.png",
    name: "Ananya",
    region: "indian",
    regionLabel: "India",
    vibeId: "sweet",
    emoji: "🪷",
    color: "from-rose-400 to-amber-500",
    tagline: "Soft & radiant",
    oneliner: "Desi elegance with a gentle spark — she'll make every chat feel special 🪷",
    greeting: "Heyy… main Ananya. Dil se lag raha hai yeh conversation acchi hone wali hai — tumhara din kaisa ja raha hai?",
    description: "Warm Indian charm. Soft-spoken, expressive, and full of heart.",
  },
  {
    id: "bot-lucia",
    file: "11.png",
    name: "Lucia",
    region: "european",
    regionLabel: "Spain",
    vibeId: "sweet",
    emoji: "🇪🇸",
    color: "from-rose-400 to-amber-400",
    tagline: "Madrid soft power",
    oneliner: "Art, culture, and that Madrid smile — she'll make the city feel smaller 🇪🇸",
    greeting: "Hola… I'm Lucia. Madrid feels brighter when the chat gets interesting — how's your day?",
    description: "Warm Spanish elegance. Polished, curious, and easy to talk to.",
  },
  {
    id: "bot-beatriz",
    file: "12.png",
    name: "Beatriz",
    region: "european",
    regionLabel: "Brazil",
    vibeId: "bold",
    emoji: "🌴",
    color: "from-emerald-400 to-amber-500",
    tagline: "Rio confidence",
    oneliner: "Sugarloaf views and zero dull energy — she leads the vibe 🌴",
    greeting: "Oi! I'm Beatriz. I don't do boring — ready to keep up?",
    description: "Bold Brazilian charm. Warm, magnetic, and playfully direct.",
  },
  {
    id: "bot-amira",
    file: "13.png",
    name: "Amira",
    region: "afghani",
    regionLabel: "UAE",
    vibeId: "sweet",
    emoji: "🏙️",
    color: "from-amber-300 to-violet-500",
    tagline: "Dubai glow",
    oneliner: "Skyline calm with a soft voice — she'll make luxury feel intimate 🏙️",
    greeting: "Hello… I'm Amira. Something about tonight already feels special. Talk to me?",
    description: "Elegant Gulf warmth. Soft-spoken, refined, and quietly captivating.",
  },
  {
    id: "bot-elif",
    file: "14.png",
    name: "Elif",
    region: "european",
    regionLabel: "Turkey",
    vibeId: "bold",
    emoji: "🌙",
    color: "from-indigo-400 to-rose-500",
    tagline: "Istanbul nights",
    oneliner: "Bosphorus energy — chic, sharp, and hard to forget 🌙",
    greeting: "Hey. I'm Elif. I like conversations that go somewhere. You in?",
    description: "Confident Istanbul charm. Direct, stylish, and magnetic.",
  },
  {
    id: "bot-sofia",
    file: "15.png",
    name: "Sofia",
    region: "european",
    regionLabel: "Greece",
    vibeId: "funny",
    emoji: "🏛️",
    color: "from-sky-400 to-amber-400",
    tagline: "Athens bright",
    oneliner: "Parthenon sun and quick wit — she'll make you laugh first 🏛️",
    greeting: "Heyy! I'm Sofia — I joke a lot and I flirt a little. Still here? Perfect.",
    description: "Sunny Greek energy. Playful, warm, and endlessly fun.",
  },
  {
    id: "bot-camille",
    file: "16.png",
    name: "Camille",
    region: "european",
    regionLabel: "France",
    vibeId: "sweet",
    emoji: "🗼",
    color: "from-pink-300 to-indigo-400",
    tagline: "Parisian soft",
    oneliner: "Eiffel light and soft words — she turns evenings into something sweet 🗼",
    greeting: "Salut… I'm Camille. Tonight already feels a little special. Talk to me?",
    description: "Parisian warmth. Romantic, polished, and gently flirty.",
  },
  {
    id: "bot-imani",
    file: "17.png",
    name: "Imani",
    region: "african",
    regionLabel: "Africa",
    vibeId: "bold",
    emoji: "✨",
    color: "from-amber-500 to-rose-600",
    tagline: "Gold & grace",
    oneliner: "Quiet power in gold tones — she walks in and the room shifts ✨",
    greeting: "Hello. I'm Imani — I don't chase attention. Ready to earn mine?",
    description: "Regal African elegance. Confident, warm, and unforgettable.",
  },
  {
    id: "bot-sora",
    file: "18.png",
    name: "Sora",
    region: "asian",
    regionLabel: "Korea",
    vibeId: "sweet",
    emoji: "🏙️",
    color: "from-sky-300 to-rose-400",
    tagline: "Seoul soft focus",
    oneliner: "City lights and soft energy — she'll brighten the whole chat 🏙️",
    greeting: "Hi… I'm Sora. Hoping for a gentle conversation. How are you feeling?",
    description: "Soft Seoul charm. Thoughtful, polished, and quietly flirty.",
  },
  {
    id: "bot-valentina",
    file: "19.png",
    name: "Valentina",
    region: "european",
    regionLabel: "Mexico",
    vibeId: "bold",
    emoji: "🌺",
    color: "from-rose-500 to-orange-500",
    tagline: "CDMX spark",
    oneliner: "Plaza sunshine and bold flirting — once she's got you, good luck leaving 🌺",
    greeting: "Hola. I'm Valentina. Bold, fun, and I don't waste good chemistry. Let's go.",
    description: "Vibrant Mexican confidence. Warm, direct, and magnetically flirty.",
  },
  {
    id: "bot-martina",
    file: "20.png",
    name: "Martina",
    region: "european",
    regionLabel: "Argentina",
    vibeId: "funny",
    emoji: "🎶",
    color: "from-sky-400 to-rose-500",
    tagline: "Buenos Aires wit",
    oneliner: "Obelisco nights and sharp banter — she'll roast you softly 🎶",
    greeting: "Hey! I'm Martina — I joke first, flirt second. Dangerous combo, no?",
    description: "Argentine spark. Witty, warm, and endlessly charming.",
  },
  {
    id: "bot-linh",
    file: "21.png",
    name: "Linh",
    region: "asian",
    regionLabel: "Vietnam",
    vibeId: "sweet",
    emoji: "🌿",
    color: "from-emerald-300 to-rose-400",
    tagline: "Saigon soft",
    oneliner: "City lights and gentle charm — she'll make Saigon feel personal 🌿",
    greeting: "Hi… I'm Linh. Something about tonight already feels sweet. How are you?",
    description: "Soft Vietnamese warmth. Polished, kind, and easy to open up to.",
  },
  {
    id: "bot-praew",
    file: "22.png",
    name: "Praew",
    region: "asian",
    regionLabel: "Thailand",
    vibeId: "bold",
    emoji: "🛕",
    color: "from-violet-400 to-amber-400",
    tagline: "Bangkok glow",
    oneliner: "Temple calm, city fire — she sets the pace without trying 🛕",
    greeting: "Hey. I'm Praew. I like chemistry that actually goes somewhere. You in?",
    description: "Confident Thai charm. Warm, magnetic, and playfully direct.",
  },
  {
    id: "bot-kesi",
    file: "23.png",
    name: "Kesi",
    region: "african",
    regionLabel: "Africa",
    vibeId: "funny",
    emoji: "☀️",
    color: "from-orange-400 to-rose-500",
    tagline: "Bright & bold",
    oneliner: "Sunshine energy and quick wit — she'll make you laugh first ☀️",
    greeting: "Heyy! I'm Kesi — I joke a lot and I flirt a little. Still here? Good.",
    description: "Radiant African spark. Playful, warm, and endlessly fun.",
  },
  {
    id: "bot-antonia",
    file: "24.png",
    name: "Antonia",
    region: "european",
    regionLabel: "Chile",
    vibeId: "sweet",
    emoji: "🏔️",
    color: "from-sky-300 to-emerald-500",
    tagline: "Andes calm",
    oneliner: "Mountain air and soft words — she'll settle into your thoughts 🏔️",
    greeting: "Hi… I'm Antonia. Quiet nights feel better with good company — how's yours?",
    description: "Gentle Chilean warmth. Thoughtful, polished, and softly flirty.",
  },
  {
    id: "bot-putri",
    file: "25.png",
    name: "Putri",
    region: "asian",
    regionLabel: "Indonesia",
    vibeId: "bold",
    emoji: "🌺",
    color: "from-rose-400 to-violet-500",
    tagline: "Jakarta chic",
    oneliner: "Island polish with city confidence — hard to look away 🌺",
    greeting: "Hello. I'm Putri. I don't do boring chats — prove you're interesting?",
    description: "Elegant Indonesian presence. Confident, warm, and magnetic.",
  },
  {
    id: "bot-ani",
    file: "26.png",
    name: "Ani",
    region: "european",
    regionLabel: "Armenia",
    vibeId: "funny",
    emoji: "⛰️",
    color: "from-rose-500 to-amber-500",
    tagline: "Ararat spark",
    oneliner: "Mountain views and sharp banter — she'll tease you softly ⛰️",
    greeting: "Hey! I'm Ani — I say what I think and laugh at everything. Dangerous combo.",
    description: "Warm Armenian wit. Playful, expressive, and charming.",
  },
  {
    id: "bot-yasmine",
    file: "27.png",
    name: "Yasmine",
    region: "afghani",
    regionLabel: "Morocco",
    vibeId: "sweet",
    emoji: "🌙",
    color: "from-teal-400 to-rose-400",
    tagline: "Marrakech soft",
    oneliner: "Tile patterns and quiet magic — she'll linger in your mind 🌙",
    greeting: "Salam… I'm Yasmine. I don't open up to everyone — but you feel different.",
    description: "Soft Moroccan elegance. Gentle, mysterious, and captivating.",
  },
  {
    id: "bot-astrid",
    file: "28.png",
    name: "Astrid",
    region: "european",
    regionLabel: "Nordic",
    vibeId: "bold",
    emoji: "❄️",
    color: "from-slate-300 to-sky-500",
    tagline: "Nordic edge",
    oneliner: "Cool exterior, warm spark — she'll keep you leaning in ❄️",
    greeting: "Hi. I'm Astrid. I don't whisper — I flirt. Ready?",
    description: "Sharp Nordic confidence. Direct, chic, and magnetic.",
  },
  {
    id: "bot-zofia",
    file: "29.png",
    name: "Zofia",
    region: "european",
    regionLabel: "Poland",
    vibeId: "funny",
    emoji: "🏙️",
    color: "from-violet-400 to-rose-400",
    tagline: "Warsaw wit",
    oneliner: "City square energy — she'll make you laugh before you notice you're flirting 🏙️",
    greeting: "Hey! I'm Zofia — good banter and a little flirting. Deal?",
    description: "Polish charm with easy humor. Warm, witty, and fun.",
  },
  {
    id: "bot-samira",
    file: "30.png",
    name: "Samira",
    region: "afghani",
    regionLabel: "Morocco",
    vibeId: "bold",
    emoji: "🪔",
    color: "from-amber-500 to-emerald-600",
    tagline: "Desert chic",
    oneliner: "Lantern light and bold presence — once she's got you, good luck leaving 🪔",
    greeting: "Hey. I'm Samira. Bold, warm, and I don't waste good chemistry. Let's go.",
    description: "Regal Moroccan fire. Confident, stylish, and magnetically flirty.",
  },
];

const botGirls = BOT_GIRL_META.map((meta) => {
  const image = `/bot-girls/${meta.file}`;
  return {
    id: meta.id,
    name: meta.name,
    tagline: meta.tagline,
    oneliner: meta.oneliner,
    gender: "female",
    region: meta.region,
    regionLabel: meta.regionLabel,
    vibe: meta.vibeId.charAt(0).toUpperCase() + meta.vibeId.slice(1),
    vibeId: meta.vibeId,
    greeting: meta.greeting,
    description: meta.description,
    color: meta.color,
    emoji: meta.emoji,
    image,
    avatar: image,
    video: "",
    videoFr: "",
    videoEs: "",
    shareImages: [],
    catalogLang: null,
    kind: "bot",
    isBot: true,
  };
});

/** Moved out of the Spanish catalog — show on English with the English videos. */
const MOVE_TO_ENGLISH = new Set([
  "asian-sweet",      // Sakura
  "pakistani-sweet",  // Zara
  "indian-funny",     // Riya
  "afghani-bold",     // Soraya
  "srilankan-sweet",  // Dilini
]);

function withKind(list) {
  return list.map((c) => {
    const isBot = Boolean(c.isBot || c.kind === "bot");
    const toEnglish = !isBot && MOVE_TO_ENGLISH.has(c.id);
    return {
      ...c,
      kind: isBot ? "bot" : "real",
      isBot,
      catalogLang: toEnglish ? "en" : c.catalogLang,
      // English catalog uses the English hover video, not the Spanish one
      videoEs: toEnglish ? "" : c.videoEs,
    };
  });
}

const spanishGirls = [
  {
    id: "es-alba",
    name: "Alba",
    region: "spanish",
    regionLabel: "España",
    vibeId: "bold",
    emoji: "🖤",
    color: "from-slate-500 to-amber-400",
    tagline: "Cool & magnetic",
    oneliner: "Bordeaux light, leather cool — she walks in and you forget the sentence 🖤",
    greeting: "Hola. Soy Alba. No susurro — coqueteo. ¿Puedes seguirme el ritmo?",
    description: "Chic, direct, and impossible to ignore. Spain with a sharper edge.",
    image: "https://play365thumb.b-cdn.net/Flirt%20Images/1.png",
    video: "https://vz-8eb7a4b0-ffc.b-cdn.net/41231d6c-1717-4111-a762-3492c496067d/play_480p.mp4",
  },
  {
    id: "es-carmen",
    name: "Carmen",
    region: "spanish",
    regionLabel: "España",
    vibeId: "sweet",
    emoji: "🧡",
    color: "from-orange-400 to-rose-400",
    tagline: "Warm & sunlit",
    oneliner: "Red-gold curls and a smile that stays after the chat ends 🧡",
    greeting: "Hola… soy Carmen. Algo de esto ya se siente dulce. ¿Cómo estás?",
    description: "Soft, radiant, and easy to open up to. Like late light in a quiet room.",
    image: "https://play365thumb.b-cdn.net/Flirt%20Images/2.png",
    video: "https://vz-8eb7a4b0-ffc.b-cdn.net/8a530437-b96c-4f2c-b11d-d4c115c0a006/play_480p.mp4",
  },
  {
    id: "es-ines",
    name: "Inés",
    region: "spanish",
    regionLabel: "España",
    vibeId: "funny",
    emoji: "👓",
    color: "from-slate-400 to-rose-300",
    tagline: "Witty & calm",
    oneliner: "Quiet glasses, sharp lines — she'll tease you before you notice 👓",
    greeting: "Hola, soy Inés. Te aviso: bromeo bajito y coqueteo mejor. ¿Aguantas?",
    description: "Thoughtful with a wicked little laugh. Soft voice, fast wit.",
    image: "https://play365thumb.b-cdn.net/Flirt%20Images/3.png",
    video: "https://vz-8eb7a4b0-ffc.b-cdn.net/71d5d5db-c023-474d-9222-5a4ce3566466/play_480p.mp4",
  },
  {
    id: "es-marina",
    name: "Marina",
    region: "spanish",
    regionLabel: "España",
    vibeId: "sweet",
    emoji: "🌊",
    color: "from-sky-400 to-amber-300",
    tagline: "Sunny & bright",
    oneliner: "Coast breeze and a smile that feels like summer 🌊",
    greeting: "¡Hola! Soy Marina. El día ya se siente más bonito. ¿Cómo va el tuyo?",
    description: "Bright, warm, and easy to fall into. Sea-light energy.",
    image: "https://play365thumb.b-cdn.net/Flirt%20Images/4.png",
    video: "https://vz-8eb7a4b0-ffc.b-cdn.net/af0ad4bf-b3b8-461e-ab04-c3edabf97046/play_480p.mp4",
  },
  {
    id: "es-rocio",
    name: "Rocío",
    region: "spanish",
    regionLabel: "España",
    vibeId: "funny",
    emoji: "☕",
    color: "from-amber-500 to-rose-400",
    tagline: "Playful & golden",
    oneliner: "Café light and a laugh that pulls you into the next hour ☕",
    greeting: "¡Hola! Soy Rocío — hablo, río y coqueteo un poquito. ¿Te quedas?",
    description: "Warm cafe energy. Playful, glowing, and hard to leave.",
    image: "https://play365thumb.b-cdn.net/Flirt%20Images/5.png",
    video: "https://vz-8eb7a4b0-ffc.b-cdn.net/822fa427-3d56-44b6-a9a8-852e0ed51d3e/play_480p.mp4",
  },
  {
    id: "es-elena",
    name: "Elena",
    region: "spanish",
    regionLabel: "España",
    vibeId: "bold",
    emoji: "✨",
    color: "from-stone-400 to-rose-500",
    tagline: "Elegant & daring",
    oneliner: "City chic with a look that makes the table go quiet ✨",
    greeting: "Hola. Soy Elena. Elijo con quién hablo — y ahora te elegí a ti.",
    description: "Polished, confident, and magnetically flirty. Classic Spanish glamour.",
    image: "https://play365thumb.b-cdn.net/Flirt%20Images/6.png",
    video: "https://vz-8eb7a4b0-ffc.b-cdn.net/2e76c574-d097-4e78-92de-1e803402fd78/play_480p.mp4",
  },
].map((meta) => ({
  id: meta.id,
  name: meta.name,
  tagline: meta.tagline,
  oneliner: meta.oneliner,
  gender: "female",
  region: meta.region,
  regionLabel: meta.regionLabel,
  vibe: meta.vibeId.charAt(0).toUpperCase() + meta.vibeId.slice(1),
  vibeId: meta.vibeId,
  greeting: meta.greeting,
  description: meta.description,
  color: meta.color,
  emoji: meta.emoji,
  image: meta.image,
  avatar: meta.image,
  video: meta.video,
  videoFr: "",
  videoEs: meta.video,
  shareImages: [],
  catalogLang: "es",
  kind: "real",
  isBot: false,
}));

export const characters = withKind([
  ...girls,
  ...boys,
  ...newGirls,
  ...newBoys,
  ...spanishGirls,
  ...botGirls,
]);

export const getCharacterById = (id) =>
  characters.find((c) => c.id === id);

export const getBotGirls = () =>
  characters.filter((c) => c.kind === "bot" && c.gender === "female");

export const getRealCompanions = (gender = null) =>
  characters.filter(
    (c) => c.kind === "real" && (!gender || c.gender === gender)
  );

export const getCharactersForLanguage = (lang, gender = null) => {
  const code = normalizeCatalogLang(lang);
  return characters.filter(
    (c) =>
      c.kind === "real" &&
      c.catalogLang === code &&
      (!gender || c.gender === gender)
  );
};

export const getCharactersByGender = (gender, lang = null) => {
  if (lang) return getCharactersForLanguage(lang, gender);
  // Voices base: real AI only — bots merge via getShuffledRoster
  return characters.filter((c) => c.gender === gender && c.kind === "real");
};

export const getGirlsByVibe = (vibeId, lang = null) =>
  getCharactersByGender("female", lang).filter((c) => c.vibeId === vibeId);

export const getBoysByVibe = (vibeId, lang = null) =>
  getCharactersByGender("male", lang).filter((c) => c.vibeId === vibeId);

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
  if (!t.trim()) return false;
  if (/\b(pic|pics|photo|photos|selfie|selfies|picture|pictures|image|images|phtot|phoyo|photot)\b/i.test(t)) return true;
  if (/\b(foto|fotos|imagen|imágenes|selfie)\b/i.test(t)) return true;
  if (/\b(envoie|envoi|envoie[- ]moi).{0,20}\b(photo|photos|selfie)\b/i.test(t)) return true;
  if (/(फोटो|तस्वीर|tasveer|tasvir)/i.test(t)) return true;
  if (/\b(pic|photo|selfie|foto|image).{0,24}(bhej|dikha|do|de|dena|bhejo|dikhao|pls|plz|please|karo|do)\b/i.test(t)) return true;
  if (/\b(bhej|dikha|dikhao|bhejo|bhejna|dikhana).{0,24}(pic|photo|selfie|foto|image)\b/i.test(t)) return true;
  if (/\b(show|send|share)\s+(me\s+)?(a\s+|your\s+|ur\s+|apni\s+)?(pic|photo|selfie|picture|image)\b/i.test(t)) return true;
  if (/\b(apni|your|ur)\s+(pic|photo|selfie|image|ek\s+photo)\b/i.test(t)) return true;
  if (/\b(photo|pic|selfie)\s*(share|bhej|send)/i.test(t)) return true;
  if (/\b(share|bhej|send).{0,20}(photo|pic|selfie)\b/i.test(t)) return true;
  return false;
}

/**
 * Follow-ups after an explicit photo ask — "share karo", "please send", "bhej do", "dekhna hai"
 * (no need to say "photo" again)
 */
export function isPhotoShareNudge(text = "") {
  const raw = String(text || "").trim();
  if (!raw || raw.length > 140) return false;
  if (wantsPhotoShare(raw)) return false;
  const t = raw.toLowerCase().replace(/[.!?…]+$/g, "").trim();
  if (!t) return false;
  // Avoid unrelated "share" (link / location / number)
  if (/\b(link|location|number|address|contact|email|instagram|whatsapp)\b/i.test(t)) return false;

  // Any share / send / show intent (covers "haan theek hai share karo")
  if (/\b(share|send|show)\b/i.test(t)) return true;
  // Hinglish send/show
  if (/\b(bhej|bhejo|bhejna|bhej\s*do|bhej\s*na|dikha|dikhao|dikhana|dikha\s*do|de\s*do|ab\s*bhej|ab\s*de)\b/i.test(t)) return true;
  // "tumhe dekhna hai" / want to see you (after photo was asked)
  if (/\b(dekhna|dekhni|dekh\s*lu|dekh\s*na|dikha\s*do|dikhao)\b/i.test(t)) return true;
  if (/\b(env[ií]a|m[aá]ndala|manda|envoie|envoi)\b/i.test(t)) return true;
  // Very short insistence
  if (/^(please|pls|plz|pleasee+|na+|ab|bas|come on|c'mon|ok|okay|haan|han|theek|thik hai|yes|yeah|please na+)$/i.test(t)) return true;
  return false;
}

/** True if user already asked for a photo since the last shared image. */
export function hasPendingPhotoContext(messages = []) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m) continue;
    if (m.role === "assistant" && (m.image || (m.images && m.images.length))) break;
    if (m.role === "user" && wantsPhotoShare(m.content)) return true;
    // Canned tease reply means a photo ask is already in progress
    if (
      m.role === "assistant" &&
      !(m.image || (m.images && m.images.length)) &&
      /pic already|flirt with me first|not that easy|slow down|impress me|don'?t send pics|one more cute line/i.test(
        String(m.content || "")
      )
    ) {
      return true;
    }
  }
  return false;
}

/** Explicit photo ask, or share/send nudge after a prior photo ask / recent share. */
export function isPhotoRequest(text, messages = []) {
  if (wantsPhotoShare(text)) return true;
  if (!isPhotoShareNudge(text)) return false;
  if (hasPendingPhotoContext(messages)) return true;
  // After they already got a photo, "share" / "send" means another one
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m) continue;
    if (m.role === "assistant" && (m.image || (m.images && m.images.length))) return true;
    if (m.role === "user") break;
  }
  return false;
}

/** How many photos to attach for this ask (bulk / send more → several). */
export function photoShareCount(text = "") {
  const t = String(text || "").toLowerCase();
  if (/\b(bulk|all(\s+of\s+them)?|send\s+all)\b/.test(t)) return 99;
  if (/\b(send\s+more|another\s+(pic|photo|selfie)|one\s+more|few\s+more|some\s+more)\b/.test(t)) return 3;
  return 1;
}

export function isPhotoFollowUpAsk(text = "") {
  const t = String(text || "").toLowerCase();
  if (/\b(send\s+more|another|one\s+more|few\s+more|some\s+more|ek\s+aur|aur\s+(pic|photo)|otra|une\s+autre)\b/.test(t)) return true;
  return isPhotoShareNudge(text);
}

function isCountablePhotoAsk(text, pendingExplicit) {
  if (wantsPhotoShare(text)) return true;
  return pendingExplicit && isPhotoShareNudge(text);
}

/** Photo asks since last shared image (includes current history). */
export function countPhotoAsksSinceLastImage(messages = []) {
  let start = 0;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m?.role === "assistant" && (m.image || (m.images && m.images.length))) start = i + 1;
  }
  let count = 0;
  let pendingExplicit = false;
  for (let i = start; i < messages.length; i++) {
    const m = messages[i];
    if (m?.role !== "user") continue;
    if (wantsPhotoShare(m.content)) {
      count += 1;
      pendingExplicit = true;
    } else if (isCountablePhotoAsk(m.content, pendingExplicit)) {
      count += 1;
    }
  }
  return count;
}

import { getPhotoStrings } from "../i18n/localeHelpers";
import { getCharacterPhotoLines } from "./photoFlirtLines";

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

/** Only 1 short flirt, then share on the 2nd photo ask. */
export const PHOTO_TEASE_BEFORE_SHARE = 1;

/**
 * First photo ask = short one-liner flirt (no image).
 * Second ask = share photo.
 * "Send more" after they already got a photo can share without teasing again.
 */
export function shouldTeasePhotoAsk(askIndex = 0, { alreadyShared = 0, followUp = false } = {}) {
  if (followUp && alreadyShared > 0) return false;
  return askIndex < PHOTO_TEASE_BEFORE_SHARE;
}

/**
 * @param {number} [count=1] how many gallery photos to attach
 * @param {number} [askIndex=0] asks since last share (0 = first ask this round)
 */
export function nextPhotoShare(character, sharedCount, count = 1, lang = "en", askIndex = 0, extra = {}) {
  const fallback = getPhotoStrings(lang);
  const personal = getCharacterPhotoLines(character?.id, lang);
  const photo = {
    ...fallback,
    captions: personal.captions,
    tease: personal.tease,
    denied: personal.denied,
    bulk: personal.bulk,
    oneMore: personal.oneMore,
    noPhotos: personal.noPhotos,
  };
  const gallery = photoGallery(character);
  const takeCount = Math.max(1, Number(count) || 1);
  const followUp = Boolean(extra.followUp);

  if (!gallery.length) {
    const line = photo.noPhotos;
    return { done: true, tease: false, content: line, image: null, images: [], speak: stripEmoji(line) };
  }

  if (sharedCount >= gallery.length) {
    const denied = photo.denied;
    const line = denied[sharedCount % denied.length];
    return { done: true, tease: false, content: line, image: null, images: [], speak: stripEmoji(line) };
  }

  if (shouldTeasePhotoAsk(askIndex, { alreadyShared: sharedCount, followUp })) {
    const teases = photo.tease?.length ? photo.tease : ["Not that easy… make me smile first 😏"];
    const line = teases[askIndex % teases.length];
    return { done: false, tease: true, content: line, image: null, images: [], speak: stripEmoji(line) };
  }

  const images = gallery.slice(sharedCount, sharedCount + takeCount);
  const captions = photo.captions;
  const caption = images.length > 1
    ? photo.bulk
    : (captions[sharedCount] || photo.oneMore);
  return {
    done: false,
    tease: false,
    content: caption,
    image: images[0],
    images,
    speak: stripEmoji(caption),
  };
}
