import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import SuggestionPopup from "../components/SuggestionPopup";
import SnakesLaddersGame from "../components/SnakesLaddersGame";
import DiceGame from "../components/DiceGame";
import { getCharacterById, wantsPhotoShare, photoShareCount, nextPhotoShare } from "../data/characters";
import { getMood } from "../data/moods";
import { isFavorite, toggleFavorite } from "../data/favorites";
import { randomTruth, randomDare } from "../data/truthOrDare";
import { loadChat, saveChat, clearChat, saveChatShare } from "../data/chatHistory";
import {
  getUserProfile,
  setUserProfile,
  getDisplayName,
  extractProfileHints,
  buildIntroGreeting,
} from "../data/userProfile";
import { getActiveUserId } from "../data/accounts";
import {
  sendChatMessage,
  fetchConversationSuggestions,
  createSpeechRecognition,
  stopSpeaking,
  speakText,
} from "../services/api";
import { getCharacterVoiceOpts } from "../data/voiceTone";
import {
  createRoomSync,
  inviteUrlForRoom,
  chatShareId,
  getMyHuman,
  mergeById,
  mergeHumans,
} from "../services/roomSync";
import { playSendSound, playReceiveSound, playTypingSound } from "../utils/sounds";
import { pickIdleGameNudge, IDLE_NUDGE_MS } from "../data/idleNudges";
import { useVisibleIdleTimer } from "../hooks/useVisibleIdleTimer";
import { useVisualViewportHeight } from "../hooks/useVisualViewportHeight";
import { useI18n } from "../i18n/LanguageContext";
import { localizeCharacter, translateShareStatus } from "../i18n/localeHelpers";

export default function ChatPage() {
  const { setLanguage, lang, t } = useI18n();
  useVisualViewportHeight(true);
  const { characterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const rawCharacter = getCharacterById(characterId);
  const character = useMemo(
    () => (rawCharacter ? localizeCharacter(rawCharacter, lang, t) : null),
    [rawCharacter, lang, t]
  );
  const mood = getMood();
  const isGuest = searchParams.get("guest") === "1";
  const guestShareId = searchParams.get("sid") || "";
  const myId = getActiveUserId();

  const handleBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/pick");
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fav, setFav] = useState(() => (character ? isFavorite(character.id) : false));
  const [todMode, setTodMode] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupSuggestions, setPopupSuggestions] = useState([]);
  const [resumed, setResumed] = useState(false);
  const [askResume, setAskResume] = useState(false);
  const [resumePreview, setResumePreview] = useState(null);
  const [snakesOpen, setSnakesOpen] = useState(false);
  const [diceOpen, setDiceOpen] = useState(false);
  const [userProfile, setUserProfileState] = useState(() => getUserProfile());
  const [shareOpen, setShareOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [humans, setHumans] = useState([]);

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const hasGreetedRef = useRef(false);
  const chunkTimersRef = useRef([]);
  const typingSoundRef = useRef(null);
  const photosSharedRef = useRef(0);
  const readyToSaveRef = useRef(false);
  const syncRef = useRef(null);
  const messagesRef = useRef(messages);
  const humansRef = useRef(humans);
  const applyingRemoteRef = useRef(false);
  const shareIdRef = useRef("");
  const busyRef = useRef(false);
  const pendingQueueRef = useRef([]);
  const pendingSavedRef = useRef(null);
  const lastRepliedUserMsgIdRef = useRef("");
  const isGuestRef = useRef(isGuest);
  const runAssistantTurnRef = useRef(null);
  const idleNudgedForRef = useRef(null);
  const askResumeRef = useRef(false);
  const snakesOpenRef = useRef(false);
  const diceOpenRef = useRef(false);
  isGuestRef.current = isGuest;
  askResumeRef.current = askResume;
  snakesOpenRef.current = snakesOpen;
  diceOpenRef.current = diceOpen;

  const voiceOpts = useMemo(
    () => getCharacterVoiceOpts(character, lang),
    [character, lang]
  );
  const { arm: armIdleNudge, disarm: disarmIdleNudge } = useVisibleIdleTimer();

  useEffect(() => {
    const onSpeechStop = () => {
      setIsSpeaking(false);
      chunkTimersRef.current.forEach(clearTimeout);
      chunkTimersRef.current = [];
    };
    window.addEventListener("yallo:speech-stop", onSpeechStop);
    return () => window.removeEventListener("yallo:speech-stop", onSpeechStop);
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    humansRef.current = humans;
  }, [humans]);

  const applyRemoteSnapshot = ({ messages: remoteMsgs, humans: remoteHumans }) => {
    applyingRemoteRef.current = true;
    if (Array.isArray(remoteMsgs)) {
      const merged = mergeById(messagesRef.current, remoteMsgs);
      setMessages(merged);
      if (character?.id) saveChat(character.id, merged, photosSharedRef.current);
    }
    if (Array.isArray(remoteHumans)) {
      const mergedH = mergeHumans(humansRef.current, remoteHumans);
      setHumans(mergedH);
      if (character?.id) saveChatShare(character.id, { humans: mergedH });
    }
    queueMicrotask(() => {
      applyingRemoteRef.current = false;
    });
  };

  const startSync = (role, shareId) => {
    if (!shareId || !character) return;
    syncRef.current?.destroy();
    shareIdRef.current = shareId;
    const me = getMyHuman();
    const seedHumans = mergeHumans(humansRef.current, [me]);
    setHumans(seedHumans);
    saveChatShare(character.id, {
      shareId,
      ...(role === "host" ? { hostId: myId } : {}),
      humans: seedHumans,
      shared: true,
    });

    syncRef.current = createRoomSync({
      roomId: shareId,
      role,
      getSnapshot: () => ({
        room: {
          id: shareId,
          kind: "chat",
          characterId: character.id,
          name: character.name,
          hostId: role === "host" ? myId : "",
        },
        messages: messagesRef.current,
        humans: humansRef.current,
      }),
      onSnapshot: applyRemoteSnapshot,
      onStatus: (_s, detail) => setShareStatus(translateShareStatus(detail, lang) || detail || ""),
    });
  };

  const handleShare = async () => {
    if (!character) return;
    const shareId = shareIdRef.current || chatShareId(character.id, myId);
    shareIdRef.current = shareId;
    const link = inviteUrlForRoom(shareId);
    setInviteLink(link);
    setShareOpen(true);
    setCopied(false);
    if (!syncRef.current) startSync("host", shareId);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setShareStatus(t("chat.linkCopiedKeepOpen"));
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareStatus(t("chat.copyLinkHint"));
    }
  };

  useEffect(() => {
    if (!character) { navigate("/pick"); return; }

    readyToSaveRef.current = false;
    hasGreetedRef.current = false;
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);
    setFav(isFavorite(character.id));
    setTodMode(false);
    setPopupOpen(false);

    const saved = loadChat(character.id);
    if (saved?.shareId) shareIdRef.current = saved.shareId;
    if (saved?.humans?.length) setHumans(saved.humans);

    if (isGuest) {
      const sid = guestShareId || saved?.shareId;
      if (sid) shareIdRef.current = sid;
      if (saved?.messages?.length) {
        photosSharedRef.current = saved.photosShared || 0;
        setMessages(saved.messages);
        setResumed(true);
        const lastUser = [...saved.messages].reverse().find((m) => m.role === "user");
        if (lastUser?.id) lastRepliedUserMsgIdRef.current = lastUser.id;
      } else {
        setMessages([]);
        setResumed(false);
      }
      hasGreetedRef.current = true;
      setIsTyping(false);
      readyToSaveRef.current = true;
      if (sid) startSync("guest", sid);
      setTimeout(() => inputRef.current?.focus(), 100);
      return () => {
        syncRef.current?.destroy();
        syncRef.current = null;
        stopSpeaking();
        setIsSpeaking(false);
        chunkTimersRef.current.forEach(clearTimeout);
        chunkTimersRef.current = [];
        recognitionRef.current?.abort();
      };
    }

    if (saved?.messages?.length) {
      pendingSavedRef.current = saved;
      const last = [...saved.messages].reverse().find((m) => String(m.content || "").trim());
      setResumePreview({
        text: String(last?.content || "Photo").replace(/\s+/g, " ").trim().slice(0, 90),
        count: saved.messages.length,
        updatedAt: saved.updatedAt || "",
      });
      setAskResume(true);
      setMessages([]);
      setResumed(false);
      hasGreetedRef.current = true;
      setIsTyping(false);
      readyToSaveRef.current = false;
      return () => {
        syncRef.current?.destroy();
        syncRef.current = null;
        stopSpeaking();
        setIsSpeaking(false);
        chunkTimersRef.current.forEach(clearTimeout);
        chunkTimersRef.current = [];
        recognitionRef.current?.abort();
      };
    }

    pendingSavedRef.current = null;
    setAskResume(false);
    setResumePreview(null);
    setResumed(false);
    photosSharedRef.current = 0;
    setMessages([]);
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 280);

    // Human-like delay: 2.5–4.5s before first message
    const greetDelay = 2500 + Math.random() * 2000;
    const greetingTimer = setTimeout(() => {
      if (hasGreetedRef.current) return;
      hasGreetedRef.current = true;

      const greetingText = buildIntroGreeting(character, getUserProfile());
      const greeting = {
        id: Date.now(),
        role: "assistant",
        content: greetingText,
        timestamp: new Date().toISOString(),
      };
      readyToSaveRef.current = true;
      busyRef.current = true;

      speakText(
        greetingText,
        () => {
          setIsSpeaking(false);
          busyRef.current = false;
          const rest = pendingQueueRef.current.splice(0);
          if (rest.length) {
            const combined = rest
              .map((q) => (q.speakerName ? `${q.speakerName} said: ${q.text}` : q.text))
              .join("\n");
            const who = rest[rest.length - 1]?.speakerName || "";
            runAssistantTurnRef.current?.(combined, messagesRef.current, who);
          }
        },
        voiceOpts,
        {
          onStart: () => {
            clearInterval(typingSoundRef.current);
            setIsTyping(false);
            setMessages((prev) => {
              if (prev.some((m) => m.id === greeting.id)) return prev;
              return [...prev, greeting];
            });
            playReceiveSound();
            setIsSpeaking(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          },
        }
      );
    }, greetDelay);

    return () => {
      clearTimeout(greetingTimer);
      clearInterval(typingSoundRef.current);
      syncRef.current?.destroy();
      syncRef.current = null;
      stopSpeaking();
      setIsSpeaking(false);
      chunkTimersRef.current.forEach(clearTimeout);
      chunkTimersRef.current = [];
      recognitionRef.current?.abort();
    };
  }, [characterId, isGuest, guestShareId]);

  useEffect(() => {
    if (!character || !readyToSaveRef.current || !messages.length) return;
    saveChat(character.id, messages, photosSharedRef.current);
    if (!applyingRemoteRef.current) {
      syncRef.current?.publishMessages(messages, humansRef.current);
    }
  }, [messages, character]);

  // Host answers a friend's line after the current voice finishes — never two AIs at once
  useEffect(() => {
    if (isGuest || !character || !messages.length) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user") return;
    if (!last.senderId || last.senderId === myId) return;
    if (last.id === lastRepliedUserMsgIdRef.current) return;
    lastRepliedUserMsgIdRef.current = last.id;
    const text = String(last.content || "").trim() || (last.image ? "[photo]" : "");
    if (!text) return;
    const speakerName = last.senderName || "Friend";
    if (busyRef.current) {
      pendingQueueRef.current.push({ text, speakerName });
      return;
    }
    runAssistantTurnRef.current?.(text, messages, speakerName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isGuest, character, myId]);

  useEffect(() => {
    if (!isGuest) return;
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") setIsTyping(false);
  }, [messages, isGuest]);

  const loadPopupSuggestions = async (history) => {
    setPopupLoading(true);
    setPopupOpen(true);
    try {
      const list = await fetchConversationSuggestions(character.name, history, mood);
      setPopupSuggestions(list);
    } catch {
      setPopupSuggestions([
        t("chat.tellMore"),
        t("chat.cuteKeep"),
        t("chat.yourTurn"),
      ]);
    } finally {
      setPopupLoading(false);
    }
  };

  const speakSynced = (fullText, opts, { onReveal } = {}) =>
    new Promise((resolve) => {
      if (!fullText?.trim()) {
        onReveal?.();
        resolve();
        return;
      }
      chunkTimersRef.current.forEach(clearTimeout);
      chunkTimersRef.current = [];
      let revealed = false;
      let settled = false;
      const reveal = () => {
        if (revealed) return;
        revealed = true;
        onReveal?.();
        setIsSpeaking(true);
      };
      const finish = () => {
        if (settled) return;
        settled = true;
        setIsSpeaking(false);
        reveal();
        resolve();
      };
      speakText(
        fullText,
        finish,
        opts || voiceOpts,
        { onStart: reveal }
      );
      // Reveal text if TTS is slow to start; never start the next line until speech ends
      const safetyReveal = setTimeout(reveal, 10000);
      const hang = setTimeout(finish, 45000);
      chunkTimersRef.current.push(safetyReveal, hang);
    });

  const deliverIdleGameNudge = async () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    if (isGuestRef.current || !character) return;
    if (busyRef.current || askResumeRef.current) return;
    if (snakesOpenRef.current || diceOpenRef.current) return;

    const msgs = messagesRef.current;
    const last = msgs[msgs.length - 1];
    if (!last || last.role !== "assistant") return;
    if (idleNudgedForRef.current === last.id) return;
    idleNudgedForRef.current = last.id;

    const text = pickIdleGameNudge(lang);
    const aiMsg = {
      id: Date.now(),
      role: "assistant",
      content: text,
      timestamp: new Date().toISOString(),
    };

    busyRef.current = true;
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 320);
    try {
      await speakSynced(text, voiceOpts, {
        onReveal: () => {
          clearInterval(typingSoundRef.current);
          setIsTyping(false);
          setMessages((prev) => [...prev, aiMsg]);
          playReceiveSound();
        },
      });
    } catch {
      clearInterval(typingSoundRef.current);
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      clearInterval(typingSoundRef.current);
      setIsTyping(false);
      busyRef.current = false;
    }
  };

  useEffect(() => {
    disarmIdleNudge();
    if (isGuest || askResume || !character) return;
    if (snakesOpen || diceOpen) return;
    if (busyRef.current || isTyping || isSpeaking) return;

    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") {
      idleNudgedForRef.current = null;
      return;
    }
    if (idleNudgedForRef.current === last.id) return;

    armIdleNudge(IDLE_NUDGE_MS, deliverIdleGameNudge);
    return disarmIdleNudge;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isTyping, isSpeaking, isGuest, askResume, snakesOpen, diceOpen, character]);

  const appendAssistantReply = async (userText, nextHistory, { imageNote = false, speakerName = "" } = {}) => {
    if (character && wantsPhotoShare(userText) && !imageNote) {
      await new Promise((r) => setTimeout(r, 700));

      const share = nextPhotoShare(character, photosSharedRef.current, photoShareCount(userText), lang);
      const attached = share.images?.length || (share.image ? 1 : 0);
      if (attached) photosSharedRef.current += attached;

      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: share.content,
        image: share.image || undefined,
        images: share.images?.length ? share.images : undefined,
        timestamp: new Date().toISOString(),
      };
      await speakSynced(share.speak || share.content, voiceOpts, {
        onReveal: () => {
          clearInterval(typingSoundRef.current);
          setIsTyping(false);
          setMessages([...nextHistory, aiMsg]);
          playReceiveSound();
        },
      });
      return;
    }

    const me = getMyHuman();
    const fromMsgs = nextHistory
      .filter((m) => m.role === "user" && (m.senderName || m.senderId))
      .map((m) => ({ id: m.senderId || m.senderName, name: m.senderName || "Someone" }));
    const people = mergeHumans(humansRef.current?.length ? humansRef.current : [me], fromMsgs);

    const history = nextHistory
      .slice(-10)
      .filter((m) => m.content)
      .map((m) => ({
        role: m.role,
        content: m.role === "user"
          ? `[${m.senderName || me.name || "Someone"}]: ${m.image && !m.content ? "[shared a photo]" : m.image ? `${m.content} [also shared a photo]` : m.content}`
          : m.content,
      }));

    const prompt = imageNote
      ? userText || "I just shared a photo with you. React to it in a flirty, warm way — keep it short."
      : userText;

    const data = await sendChatMessage(prompt, characterId, history.slice(0, -1), {
      mood,
      truthOrDare: todMode,
      userProfile: getUserProfile(),
      people,
      speakerName: speakerName || me.name,
    });
    const claimedPhoto = /\[image attached\]|image attached|here's (a |my )?(pic|photo|selfie)|sending (you )?(a )?(pic|photo)|check this (pic|photo)/i.test(data.reply || "");
    let attached;
    if (claimedPhoto && character) {
      attached = nextPhotoShare(character, photosSharedRef.current, 1, lang);
      if (attached.image) photosSharedRef.current += attached.images?.length || 1;
    }
    const aiMsg = {
      id: Date.now() + 1,
      role: "assistant",
      content: data.reply,
      image: attached?.image || undefined,
      images: attached?.images?.length ? attached.images : undefined,
      timestamp: new Date().toISOString(),
    };
    await speakSynced(data.reply, voiceOpts, {
      onReveal: () => {
        clearInterval(typingSoundRef.current);
        setIsTyping(false);
        setMessages([...nextHistory, aiMsg]);
        playReceiveSound();
      },
    });
  };

  const applyProfileHints = (text) => {
    const hints = extractProfileHints(text);
    if (!hints.name && !hints.nickname && !hints.place) return;
    const next = setUserProfile(hints);
    setUserProfileState(next);
  };

  const handleNicknameSave = (nickname) => {
    const next = setUserProfile({ nickname: String(nickname || "").trim() });
    setUserProfileState(next);
  };

  const handleLanguageChange = (nextLang) => {
    setLanguage(nextLang);
    setUserProfileState(getUserProfile());
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    idleNudgedForRef.current = null;
    disarmIdleNudge();
    setError(null);
    setPopupOpen(false);
    setResumed(false);
    playSendSound();
    applyProfileHints(msg);

    const me = getMyHuman();
    const userMsg = {
      id: Date.now() + Math.random(),
      role: "user",
      content: msg,
      senderId: me.id,
      senderName: me.name,
      senderAvatar: me.avatar,
      timestamp: new Date().toISOString(),
    };
    const nextHistory = [...messagesRef.current, userMsg];
    messagesRef.current = nextHistory;
    setMessages(nextHistory);
    setInput("");
    lastRepliedUserMsgIdRef.current = userMsg.id;

    // Friend's device only sends the line — host AI replies so two voices don't overlap
    if (isGuestRef.current) {
      setIsTyping(true);
      return;
    }

    if (busyRef.current) {
      pendingQueueRef.current.push({ text: msg, speakerName: me.name });
      return;
    }

    await runAssistantTurn(msg, nextHistory, me.name);
  };

  const runAssistantTurn = async (msg, history, speakerName = "") => {
    busyRef.current = true;
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 300 + Math.random() * 200);
    try {
      await appendAssistantReply(msg, history, { speakerName });
    } catch (err) {
      setError(err.message || t("chat.checkKey"));
    } finally {
      clearInterval(typingSoundRef.current);
      setIsTyping(false);
      busyRef.current = false;
      const rest = pendingQueueRef.current.splice(0);
      if (rest.length) {
        const combined = rest
          .map((q) => (q.speakerName ? `${q.speakerName} said: ${q.text}` : q.text))
          .join("\n");
        const who = rest[rest.length - 1]?.speakerName || "";
        await runAssistantTurn(combined, messagesRef.current, who);
      } else {
        setTimeout(() => inputRef.current?.focus(), 80);
      }
    }
  };
  runAssistantTurnRef.current = runAssistantTurn;

  const handleSendImage = async (imageDataUrl, caption = "") => {
    if (!imageDataUrl) return;
    idleNudgedForRef.current = null;
    disarmIdleNudge();
    setError(null);
    setPopupOpen(false);
    setResumed(false);
    playSendSound();

    const me = getMyHuman();
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: caption.trim(),
      image: imageDataUrl,
      senderId: me.id,
      senderName: me.name,
      senderAvatar: me.avatar,
      timestamp: new Date().toISOString(),
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);

    if (isGuestRef.current) {
      setIsTyping(true);
      return;
    }

    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 300 + Math.random() * 200);

    try {
      const note = caption.trim()
        ? `I shared a photo and said: "${caption.trim()}". React warmly.`
        : "I just shared a photo with you. React to it in a flirty, warm way — keep it short.";
      await appendAssistantReply(note, nextHistory, { imageNote: true });
    } catch (err) {
      setError(err.message || t("chat.checkKey"));
    } finally {
      clearInterval(typingSoundRef.current);
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = createSpeechRecognition(getUserProfile());
    if (!recognition) {
      setError(t("chat.speechUnsupported"));
      return;
    }
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => handleSend(transcript), 300);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const loadPreviousChat = () => {
    const saved = pendingSavedRef.current;
    setAskResume(false);
    setResumePreview(null);
    if (!saved?.messages?.length || !character) return;
    photosSharedRef.current = saved.photosShared || 0;
    setMessages(saved.messages);
    setResumed(true);
    hasGreetedRef.current = true;
    setIsTyping(false);
    readyToSaveRef.current = true;
    const lastUser = [...saved.messages].reverse().find((m) => m.role === "user");
    if (lastUser?.id) lastRepliedUserMsgIdRef.current = lastUser.id;
    if (saved.humans?.length) setHumans(saved.humans);
    if (saved.shared && saved.shareId) {
      startSync("host", saved.shareId);
      setInviteLink(inviteUrlForRoom(saved.shareId));
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClear = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setPopupOpen(false);
    setResumed(false);
    setAskResume(false);
    idleNudgedForRef.current = null;
    disarmIdleNudge();
    photosSharedRef.current = 0;
    hasGreetedRef.current = true;
    readyToSaveRef.current = true;
    clearChat(character.id);
    const greetingText = buildIntroGreeting(character, getUserProfile());
    const greeting = {
      id: Date.now(),
      role: "assistant",
      content: greetingText,
      timestamp: new Date().toISOString(),
    };
    setIsTyping(true);
    setError(null);
    speakText(
      greetingText,
      () => {
        setIsSpeaking(false);
        setIsTyping(false);
      },
      voiceOpts,
      {
        onStart: () => {
          setIsTyping(false);
          setMessages([greeting]);
          playReceiveSound();
          setIsSpeaking(true);
        },
      }
    );
  };

  const startFreshFromChoice = () => {
    pendingSavedRef.current = null;
    setAskResume(false);
    setResumePreview(null);
    handleClear();
  };

  const speakInChunks = (fullText, opts) => {
    speakSynced(fullText, opts);
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    chunkTimersRef.current.forEach(clearTimeout);
    chunkTimersRef.current = [];
    setIsSpeaking(false);
  };

  const toggleFav = () => {
    const next = toggleFavorite(character.id);
    setFav(next.includes(character.id));
  };

  const startTruthOrDare = (type) => {
    setTodMode(true);
    const prompt =
      type === "truth"
        ? `${t("chat.truthPick")} "${randomTruth(lang)}"`
        : `${t("chat.darePick")} "${randomDare(lang)}" — react and keep the game going!`;
    handleSend(prompt);
  };

  const openIdeas = () => {
    if (messages.length < 1) return;
    loadPopupSuggestions(messages.map((m) => ({ role: m.role, content: m.content || "[photo]" })));
  };

  const addSystemLine = (content, { speak = false } = {}) => {
    const msg = {
      id: Date.now() + Math.random(),
      role: "system",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    if (speak) speakInChunks(content.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim(), voiceOpts);
  };

  const openSnakes = () => {
    setDiceOpen(false);
    setSnakesOpen(true);
  };

  const openDice = () => {
    setSnakesOpen(false);
    setDiceOpen(true);
  };

  const gameOpen = snakesOpen || diceOpen;

  if (!character) return null;

  return (
    <div
      className="chat-vv-shell flex flex-col overflow-hidden hero-bg"
      style={{
        height: "var(--vv-height, 100dvh)",
        maxHeight: "var(--vv-height, 100dvh)",
        top: "var(--vv-offset-top, 0px)",
      }}
    >
      <div
        className={`flex-1 min-h-0 w-full mx-auto flex ${
          gameOpen
            ? "max-w-6xl flex-col lg:flex-row"
            : "max-w-3xl flex-col"
        }`}
      >
        {snakesOpen && (
          <div className="w-full lg:w-[46%] xl:w-[42%] h-[42%] lg:h-full min-h-0 flex-shrink-0 border-b lg:border-b-0 border-primary/10">
            <SnakesLaddersGame
              open={snakesOpen}
              character={character}
              onClose={() => setSnakesOpen(false)}
              disabled={isTyping}
              onAnnounce={(line, { speak } = {}) => addSystemLine(line, { speak })}
            />
          </div>
        )}

        {diceOpen && (
          <div className="w-full lg:w-[46%] xl:w-[42%] h-[42%] lg:h-full min-h-0 flex-shrink-0 border-b lg:border-b-0 border-primary/10">
            <DiceGame
              open={diceOpen}
              character={character}
              onClose={() => setDiceOpen(false)}
              disabled={isTyping}
              onAnnounce={(line, { speak } = {}) => addSystemLine(line, { speak })}
            />
          </div>
        )}

        <div className={`min-h-0 min-w-0 flex-1 ${gameOpen ? "h-[58%] lg:h-full" : "h-full"}`}>
          <ChatPanel
            character={character}
            messages={messages}
            isTyping={isTyping}
            isSpeaking={isSpeaking}
            isListening={isListening}
            error={error}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            onSendImage={handleSendImage}
            onMicClick={handleVoiceInput}
            onStopSpeaking={handleStopSpeaking}
            onClear={handleClear}
            onBack={handleBack}
            inputRef={inputRef}
            isFavorite={fav}
            onToggleFavorite={toggleFav}
            mood={mood}
            todMode={todMode}
            onToggleTod={() => setTodMode((v) => !v)}
            onTruth={() => startTruthOrDare("truth")}
            onDare={() => startTruthOrDare("dare")}
            onOpenIdeas={openIdeas}
            resumed={resumed}
            onOpenSnakes={openSnakes}
            onOpenDice={openDice}
            split={gameOpen}
            snakesActive={snakesOpen}
            diceActive={diceOpen}
            userProfile={userProfile}
            displayName={getDisplayName(userProfile)}
            onSaveNickname={handleNicknameSave}
            chatLanguage={lang}
            onLanguageChange={handleLanguageChange}
            myUserId={myId}
            onShare={handleShare}
            shareOpen={shareOpen}
            onCloseShare={() => setShareOpen(false)}
            inviteLink={inviteLink}
            shareStatus={shareStatus}
            copied={copied}
            humans={humans}
          />
        </div>
      </div>

      <SuggestionPopup
        open={popupOpen}
        suggestions={popupSuggestions}
        loading={popupLoading}
        onPick={(q) => {
          setPopupOpen(false);
          handleSend(q);
        }}
        onClose={() => setPopupOpen(false)}
        onShuffle={() =>
          loadPopupSuggestions(messages.map((m) => ({ role: m.role, content: m.content || "[photo]" })))
        }
      />

      {askResume && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-dark/45 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden animate-slide-up">
            <div className={`h-28 bg-gradient-to-br ${character.color} relative`}>
              {(character.avatar || character.image) && (
                <img
                  src={character.avatar || character.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  draggable={false}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent" />
              <p className="absolute bottom-3 left-4 right-4 font-display font-bold text-white text-lg">
                {character.name}
              </p>
            </div>
            <div className="p-5">
              <p className="font-display font-bold text-dark text-lg">{t("chat.loadPrevious")}</p>
              <p className="text-muted text-sm mt-1">
                {t("chat.loadPreviousSub", { name: character.name.split(" ")[0] })}
              </p>
              {resumePreview?.text && (
                <p className="mt-3 text-xs text-dark/60 bg-primary/6 rounded-2xl px-3 py-2 leading-snug italic">
                  “{resumePreview.text}{resumePreview.text.length >= 90 ? "…" : ""}”
                  {resumePreview.count > 1 && (
                    <span className="not-italic text-muted">{t("chat.messageCount", { count: resumePreview.count })}</span>
                  )}
                </p>
              )}
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={loadPreviousChat}
                  className="w-full py-3 rounded-2xl bg-primary text-white font-semibold text-sm shadow-sm hover:opacity-95"
                >
                  {t("chat.loadBtn")}
                </button>
                <button
                  type="button"
                  onClick={startFreshFromChoice}
                  className="w-full py-3 rounded-2xl bg-white border border-dark/10 text-dark font-semibold text-sm hover:bg-dark/4"
                >
                  {t("chat.startNew")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
