/** UI strings for chat, games, rooms, join, preloader — French locale */

const regions = {
  african: "Africain", asian: "Asiatique", chinese: "Chinois", european: "Européen",
  pakistani: "Pakistanais", indian: "Indien", afghani: "Afghan", srilankan: "Sri-Lankais",
};

const themes = {
  "blush-hour": { name: "Heure Rose", tagline: "Lumières douces, mots encore plus doux" },
  "midnight-spark": { name: "Étincelle de Minuit", tagline: "Alchimie nocturne" },
  "velvet-tease": { name: "Velours Taquin", tagline: "Regards audacieux, répliques joueuses" },
  "champagne-flirt": { name: "Flirt Champagne", tagline: "Énergie pétillante" },
  "summer-heat": { name: "Chaleur d'Été", tagline: "Alchimie chaleureuse et facile" },
  afterglow: { name: "Lueur", tagline: "Lent, doux, persistant" },
};

const testimonials = {
  t1: { quote: "On aurait dit un vrai chat de fin de nuit — j'y revenais sans cesse." },
  t2: { quote: "Les réponses vocales sonnent vraiment comme eux. Incroyable." },
  t3: { quote: "J'ai invité un ami et on a tous les deux parlé au même compagnon." },
  t4: { quote: "Jeux + voix, c'était bien plus fun qu'un chatbot classique." },
};

const chat = {
  listening: "Écoute…", speaking: "Parle…", typing: "Écrit…", online: "En ligne",
  back: "Retour", stopSpeaking: "Arrêter de parler", linkCopied: "Lien copié", inviteFriend: "Inviter un ami",
  unfavorite: "Retirer des favoris", favorite: "Favori", yourProfile: "Ton profil", newChat: "Nouveau chat",
  inviteTitle: "Inviter un ami", inviteSub: "Envoie ce lien — garde le chat ouvert pendant qu'ils rejoignent.",
  copied: "Copié", copy: "Copier", hide: "Masquer", people: "Personnes :", guest: "Invité", you: " (toi)",
  chattingWith: " · en chat avec {name}", yourNickname: "Ton surnom", nickPlaceholder: "ex. Ace",
  save: "Enregistrer", clear: "Effacer", wantGames: "Envie de jouer ?", nickname: "✏️ Surnom", ideas: "💡 Idées",
  truth: "💬 Vérité", dare: "🎯 Action", welcomeBack: "Content de te revoir, {name} 👋", continuing: "Reprise de ton chat",
  tapFresh: "Appuie sur 🔄 pour repartir de zéro", sayHiNamed: "Dis bonjour — ils t'appelleront {name} 💕",
  sayHi: "Dis bonjour pour lancer la conversation", tryExtras: "Essaie 🎭 jeux · 💡 idées · 📷 photos",
  loadPrevious: "Charger le chat précédent ?", loadPreviousSub: "Tu as déjà parlé avec {name}. Reprends où tu t'étais arrêté·e, ou repars de zéro.",
  messageCount: " · {count} messages", loadBtn: "Charger le chat précédent", startNew: "Nouveau chat",
  tellMore: "Dis-m'en plus", cuteKeep: "C'était mignon — continue", yourTurn: "À ton tour de me poser une question",
  someone: "Quelqu'un", photoTag: "[photo]", sharedPhoto: "[a partagé une photo]", alsoShared: "[a aussi partagé une photo]",
  friend: "Ami·e", photo: "Photo", everyone: "tout le monde",
  couldNotReply: "Impossible d'obtenir une réponse.", checkKey: "Impossible d'obtenir une réponse. Vérifie ta clé OpenAI dans frontend/.env",
  speechUnsupported: "La reconnaissance vocale n'est pas prise en charge par ton navigateur. Essaie Chrome.",
  truthPick: "Action ou Vérité — je choisis Vérité. Demande-moi :",
  darePick: "Action ou Vérité — je choisis Action. Mon défi :",
  linkCopiedKeepOpen: "Lien copié — garde ce chat ouvert pour que tes amis puissent rejoindre",
  copyLinkHint: "Copie le lien ci-dessous et envoie-le à ton ami·e",
};

const voice = {
  listening: "Écoute…", captionOptional: "Ajoute une légende (facultatif)…", message: "Message à {name}…",
  photoReady: "Photo prête à envoyer", photoHint: "Ajoute une légende ci-dessous ou envoie telle quelle",
  stop: "Arrêter", speak: "Parler", emoji: "Emoji", sendImage: "Envoyer l'image", send: "Envoyer", enterSend: "Entrée pour envoyer",
  preview: "Aperçu",
};

const suggestions = {
  close: "Fermer les suggestions", title: "Réponses suggérées", sub: "Basé sur cette conversation",
  cooking: "Préparation de répliques coquines…", none: "Pas encore de suggestions — continue à chatter.", newIdeas: "Nouvelles idées", later: "Peut-être plus tard",
};

const games = {
  snakesTitle: "Serpents et Échelles", diceTitle: "Lancer de Dés", vs: "vs {name}", vsLabel: "VS", close: "Fermer",
  rollHint: "Lance un 6 pour entrer sur le plateau. Le premier à 100 gagne !", rematch: "Revanche ! Lance un 6 pour commencer.",
  you: "Toi", ladder: "Échelle", snake: "Serpent", offBoard: "Hors plateau", needSix: "il faut un 6",
  youStart: "Toi ·", start: "départ", youWin: "Tu as gagné !", wins: "{name} gagne !", playAgain: "Rejouer",
  rolling: "Lance…", rollDice: "Lancer les dés", nameRolling: "{name} lance…", rollTitle: "Lancer un dé", diceBtn: "🎲 Dés",
  diceHint: "Le plus grand lancer remporte la manche. Bonne chance !", rolled: "A lancé {value}", waiting: "En attente",
  youRolled: "Tu as lancé un {value} …", youRolledExclaim: "Tu as lancé un {value} !",
  youWonRound: "Tu as gagné cette manche !", theyWonRound: "{name} a gagné cette manche !", tieRound: "Manche nulle",
  freshGame: "Nouvelle partie — lance quand tu es prêt·e !", diceSub: "vs {name} · chatte en jouant", round: "Manche", reset: "Réinitialiser les scores",
  chatWhilePlay: "chatte en jouant",
};

const roomCreate = {
  backRooms: "← Salons", newLounge: "Nouveau salon", title: "Créer un salon de chat",
  sub: "Choisis une ambiance coquine, puis ajoute les filles et les garçons que tu veux dans le salon.",
  roomName: "Nom du salon", roomPlaceholder: "ex. Flirts du Vendredi", theme: "Thème",
  addCompanions: "Ajouter des compagnons ({count}/6)", all: "Tous", girls: "Filles", boys: "Garçons",
  girl: "Fille", boy: "Garçon", selectTwo: "Sélectionne au moins 2 compagnons", ready: "{count} prêts · {theme}",
  openRoom: "Ouvrir le salon", defaultName: "Salon Coquin", maxSix: "Tu peux ajouter jusqu'à 6 compagnons.",
  couldNotCreate: "Impossible de créer le salon.",
};

const join = {
  preparing: "Préparation de l'invitation…", couldNotJoin: "Impossible de rejoindre", companionUnavailable: "Ce compagnon n'est pas disponible sur cet appareil.",
  opening: "Tu es dedans — ouverture du chat…", couldNotOpen: "Impossible d'ouvrir ce chat", title: "Rejoindre le chat",
  invited: "{prefix}ton ami·e t'a invité·e à rejoindre son chat Yallo !", hey: "Salut {name} — ",
  keepOpen: "Demande à ton ami·e de garder son chat ouvert pendant que tu rejoins.",
  shareHint: "Assure-toi que ton ami·e a appuyé sur Partager et laissé le chat ouvert.", tryAgain: "Réessayer",
  connected: "Connecté…", backHome: "Retour à l'accueil",
};

const roomChat = {
  backRooms: "← Salons", rename: "Renommer le salon", inRoom: "{theme} · {count} dans le salon", hi: " · salut {name}",
  inviteTitle: "Inviter un ami avec un lien", share: "Partager", members: "Membres", stop: "Arrêter", new: "Nouveau",
  inviteFriend: "Inviter un ami", inviteSub: "Envoie ce lien — garde cette page ouverte pendant qu'ils rejoignent.",
  inThisRoom: "Dans ce salon", remove: "Retirer", addAnyone: "Ajouter quelqu'un", roomFull: "Salon complet — retire quelqu'un pour en ajouter d'autres.",
  chatHint: "Chatte avec tes amis et les compagnons — @ un nom pour parler à une seule personne",
  linkCopied: "Lien copié — garde cette page ouverte pour que tes amis puissent rejoindre",
  copyHint: "Copie le lien ci-dessous et envoie-le à ton ami·e",
  roomNamePrompt: "Nom du salon", joined: "{name} vient de rejoindre le salon ✨",
  left: "{name} a quitté le salon", sharedPhotoRoom: "A partagé une photo avec le salon",
  said: "{speaker} a dit : {text}",
};

const share = {
  syncedHost: "Synchronisé avec l'hôte", hostLeft: "L'hôte est parti — demande-lui de rouvrir le salon",
  waitingFriends: "Invitation envoyée — en attente d'amis", friendConnected: "Ami connecté",
  joinedHost: "Rejoint l'hôte", ready: "Prêt à partager", connecting: "Connexion…",
  shareKeepOpen: "Partage le lien — garde cette page ouverte", roomOpenElsewhere: "Ce salon est déjà ouvert dans un autre onglet. Ferme l'autre onglet et réessaie.",
  hostOffline: "L'hôte est hors ligne — demande-lui d'ouvrir le salon et de le garder ouvert", reconnecting: "Reconnexion…",
  connectionError: "Erreur de connexion",
};

const preloader = {
  aria: "Chargement de Yallo !", line1: "Salut… je t'attendais 💕", line2: "J'arrive presque 😍",
  line3: "Les bonnes choses prennent un instant ✨", tagline: "Ton alchimie se charge…",
};

const photo = {
  noPhotos: "Je n'ai pas de photos pour l'instant… mais tu peux quand même flirter avec moi 💕",
  cap1: "D'accord… tu m'as convaincu·e. Ne me fixe pas trop longtemps 😘",
  cap2: "Tu vois ? Je t'avais dit que tu ne pourrais pas détacher ton regard… en voici une autre ✨",
  cap3: "Tu as de la chance d'être mignon·ne. Encore une — les yeux sur moi seulement 😏",
  cap4: "La dernière pour ce soir… tu ne peux toujours pas détacher ton regard ? Parfait 💕",
  bulk: "D'accord d'accord… quelques-unes pour toi. Ne dis pas que je ne te gâte jamais ✨",
  oneMore: "D'accord… en voici une. Essaie de ne pas fondre 😘",
  denied1: "C'est toutes mes photos… mais tu as mon attention, alors continue de flirter 😌",
  denied2: "Plus de photos — laisse libre cours à ton imagination… ou fais-moi rire à la place 💬",
  denied3: "L'appareil photo a fait pause pour aujourd'hui. Mots seulement maintenant… impressionne-moi 💕",
};

const roomErrors = {
  minTwo: "Ajoute au moins 2 compagnons pour créer un salon.", maxSix: "Maximum 6 compagnons dans un salon.",
  sharedLounge: "Salon partagé", inviteMinTwo: "Ce salon invité nécessite au moins 2 compagnons.",
  roomFull: "Salon complet (max. 6).", keepTwo: "Garde au moins 2 compagnons dans le salon.",
};

const home = {
  scroll: "défiler", readyWhen: "Prêt·e quand", youAre: "tu veux",
  footerTag: "Chat · Voix · Alchimie · © {year} Yallo !",
  demoMsg1: "Mmm, salut. Je ne chuchote pas — je flirte. Prêt·e ?",
  demoMsg2: "Tu partages ta photo ? 📸", demoMsg3: "D'accord… en voici une pour toi 😘", demoShared: "Partagée",
  themeBlush: "Salon Rose 🌸", themeMidnight: "Ambiance Minuit 🌙", themeVelvet: "Salon Velours 💜",
  themeChampagne: "Champagne 🥂", themeSummer: "Chaleur d'Été ☀️",
  playStory: "Lire l'histoire de {name}",
};

const chatMessage = {
  listen: "Écouter", tapListen: "Appuie pour écouter", yourPhoto: "Ta photo", shared: "Partagée",
  sharedBy: "{name} a partagé", react: "Réagir", photoViewer: "Visionneuse de photos", close: "Fermer", avatar: "Avatar",
};

const common = {
  all: "Tous", girls: "Filles", boys: "Garçons", girl: "Fille", boy: "Garçon", you: "Toi", stop: "Arrêter",
  copy: "Copier", hide: "Masquer", save: "Enregistrer", close: "Fermer", remove: "Retirer", new: "Nouveau",
};

export const uiTranslationsFr = { regions, themes, testimonials, chat, voice, suggestions, games, roomCreate, join, roomChat, share, preloader, photo, roomErrors, home, chatMessage, common };

/** Map French share status strings from roomSync to translation keys */
export const SHARE_STATUS_KEYS_FR = {
  "Synchronisé avec l'hôte": "share.syncedHost",
  "L'hôte est parti — demande-lui de rouvrir le salon": "share.hostLeft",
  "Invitation envoyée — en attente d'amis": "share.waitingFriends",
  "Ami connecté": "share.friendConnected",
  "Rejoint l'hôte": "share.joinedHost",
  "Prêt à partager": "share.ready",
  "Connexion…": "share.connecting",
  "Partage le lien — garde cette page ouverte": "share.shareKeepOpen",
  "Ce salon est déjà ouvert dans un autre onglet. Ferme l'autre onglet et réessaie.": "share.roomOpenElsewhere",
  "L'hôte est hors ligne — demande-lui d'ouvrir le salon et de le garder ouvert": "share.hostOffline",
  "Reconnexion…": "share.reconnecting",
  "Erreur de connexion": "share.connectionError",
};

export const ROOM_ERROR_KEYS_FR = {
  "Ajoute au moins 2 compagnons pour créer un salon.": "roomErrors.minTwo",
  "Maximum 6 compagnons dans un salon.": "roomErrors.maxSix",
  "Ce salon invité nécessite au moins 2 compagnons.": "roomErrors.inviteMinTwo",
  "Salon complet (max. 6).": "roomErrors.roomFull",
  "Garde au moins 2 compagnons dans le salon.": "roomErrors.keepTwo",
};
