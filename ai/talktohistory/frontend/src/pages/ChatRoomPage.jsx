import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ChatMessage from "../components/ChatMessage";
import TypingIndicator from "../components/TypingIndicator";
import VoiceControls from "../components/VoiceControls";
import {
  getRoom,
  getRoomTheme,
  saveRoomMessages,
  addRoomMember,
  removeRoomMember,
  updateRoom,
  setRoomHumans,
  markRoomShared,
  ROOM_THEMES,
} from "../data/chatRooms";
import { characters, getCharacterById, wantsPhotoShare, photoShareCount, nextPhotoShare, isPhotoFollowUpAsk } from "../data/characters";
import {
  getUserProfile,
  getDisplayName,
  extractProfileHints,
  setUserProfile,
} from "../data/userProfile";
import { getActiveUserId } from "../data/accounts";
import {
  sendRoomChatMessage,
  pickRoomResponders,
  createSpeechRecognition,
  stopSpeaking,
  speakText,
  unlockAudioPlayback,
} from "../services/api";
import { getCharacterVoiceOpts } from "../data/voiceTone";
import { stopAllPreviewVideos } from "../utils/previewMedia";
import {
  createRoomSync,
  inviteUrlForRoom,
  getMyHuman,
  mergeById,
  mergeHumans,
} from "../services/roomSync";
import { playSendSound, playReceiveSound, playTypingSound } from "../utils/sounds";
import { pickIdleGameNudge, IDLE_NUDGE_MS } from "../data/idleNudges";
import { useVisibleIdleTimer } from "../hooks/useVisibleIdleTimer";
import { useVisualViewportHeight } from "../hooks/useVisualViewportHeight";
import { buildRoomGreetingForLanguage, getPhotoReactPrompt, getRoomJoinIntroPrompt, getRoomJoinFallback } from "../data/chatLanguage";
import { useI18n } from "../i18n/LanguageContext";
import { localizeCharacter, localizeTheme, translateShareStatus } from "../i18n/localeHelpers";

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Drop marketing slogans the model sometimes copies from the room theme */
function naturalizeRoomText(text = "") {
  let t = String(text);
  for (const theme of ROOM_THEMES) {
    if (!theme.tagline) continue;
    t = t.replace(new RegExp(`\\s*[—–-]\\s*${escapeRegExp(theme.tagline)}\\.?`, "ig"), "");
    t = t.replace(new RegExp(escapeRegExp(theme.tagline), "ig"), "");
  }
  t = t.replace(/\s*what's the vibe tonight\??/gi, "");
  return t.replace(/\s{2,}/g, " ").replace(/\s+([,.!?])/g, "$1").trim();
}

function buildRoomGreeting(members, _theme, displayName, lang = "en") {
  const localized = buildRoomGreetingForLanguage(members, displayName, lang);
  if (localized) return localized;

  const host = members[0]?.name || "us";
  const other = members[1]?.name;
  const who = displayName || "";
  if (who && other) return `Hey ${who} — I'm ${host}. ${other}'s here too. How's your night going?`;
  if (who) return `Hey ${who}! I'm ${host}. Glad you walked in — how's it going?`;
  if (other) return `Hey! I'm ${host}. ${other}'s here too. How's your night going?`;
  return `Hey! I'm ${host}. Come sit with us — how's it going?`;
}

export default function ChatRoomPage() {
  useVisualViewportHeight(true);
  const { t, lang } = useI18n();
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isGuest = searchParams.get("guest") === "1";
  const [room, setRoom] = useState(() => getRoom(roomId));
  const [messages, setMessages] = useState(() => room?.messages || []);
  const [humans, setHumans] = useState(() => room?.humans || []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingAs, setTypingAs] = useState(null);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [addFilter, setAddFilter] = useState("all");
  const [userProfile, setUserProfileState] = useState(() => getUserProfile());
  const [shareOpen, setShareOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const endRef = useRef(null);
  const listRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const readySaveRef = useRef(false);
  const greetedRef = useRef(false);
  const spokeOnOpenRef = useRef(false);
  const typingSoundRef = useRef(null);
  const chunkTimersRef = useRef([]);
  const syncRef = useRef(null);
  const messagesRef = useRef(messages);
  const humansRef = useRef(humans);
  const roomRef = useRef(room);
  const applyingRemoteRef = useRef(false);
  const myId = getActiveUserId();
  const busyRef = useRef(false);
  const pendingQueueRef = useRef([]);
  const lastRepliedUserMsgIdRef = useRef("");
  const isGuestRef = useRef(isGuest);
  const runRoomTurnRef = useRef(null);
  const idleNudgedForRef = useRef(null);
  const liveRef = useRef(true);
  const photoAsksSinceShareRef = useRef(0);
  const photosSharedRef = useRef(0);
  isGuestRef.current = isGuest;

  const theme = localizeTheme(getRoomTheme(room?.themeId), lang);
  const members = useMemo(
    () => (room?.memberIds || []).map((id) => localizeCharacter(getCharacterById(id), lang, t)).filter(Boolean),
    [room, lang, t]
  );
  const displayName = getDisplayName(userProfile);
  const { arm: armIdleNudge, disarm: disarmIdleNudge } = useVisibleIdleTimer();

  useEffect(() => {
    stopAllPreviewVideos();
  }, []);

  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
      disarmIdleNudge();
      stopSpeaking();
      clearInterval(typingSoundRef.current);
      chunkTimersRef.current.forEach(clearTimeout);
      chunkTimersRef.current = [];
      recognitionRef.current?.abort();
    };
  }, [disarmIdleNudge]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    humansRef.current = humans;
  }, [humans]);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

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
    const r = getRoom(roomId);
    if (!r) {
      navigate("/rooms", { replace: true });
      return;
    }
    setRoom(r);
    setHumans(r.humans || []);
    const cleaned = (r.messages || []).map((m) =>
      m.role === "assistant" && m.content
        ? { ...m, content: naturalizeRoomText(m.content) || m.content }
        : m
    );
    setMessages(cleaned);
    readySaveRef.current = true;
    greetedRef.current = cleaned.length > 0;
    spokeOnOpenRef.current = false;
    const lastUser = [...cleaned].reverse().find((m) => m.role === "user");
    if (lastUser?.id) lastRepliedUserMsgIdRef.current = lastUser.id;
    stopSpeaking();
  }, [roomId, navigate]);

  const applyRemoteSnapshot = ({ room: remoteRoom, messages: remoteMsgs, humans: remoteHumans }) => {
    applyingRemoteRef.current = true;
    if (remoteRoom?.id) {
      const nextRoom = {
        ...roomRef.current,
        ...remoteRoom,
        id: roomId,
      };
      setRoom(nextRoom);
      updateRoom(roomId, {
        name: nextRoom.name,
        themeId: nextRoom.themeId,
        memberIds: nextRoom.memberIds,
        humans: remoteHumans || nextRoom.humans,
        shared: true,
        hostId: nextRoom.hostId || roomRef.current?.hostId,
      });
    }
    if (Array.isArray(remoteMsgs)) {
      const merged = mergeById(messagesRef.current, remoteMsgs).map((m) =>
        m.role === "assistant" && m.content
          ? { ...m, content: naturalizeRoomText(m.content) || m.content }
          : m
      );
      setMessages(merged);
      saveRoomMessages(roomId, merged);
    }
    if (Array.isArray(remoteHumans)) {
      const mergedH = mergeHumans(humansRef.current, remoteHumans);
      setHumans(mergedH);
      setRoomHumans(roomId, mergedH);
    }
    queueMicrotask(() => {
      applyingRemoteRef.current = false;
    });
  };

  const startSync = (role) => {
    syncRef.current?.destroy();
    const me = getMyHuman();
    const seedHumans = mergeHumans(humansRef.current || roomRef.current?.humans || [], [me]);
    setHumans(seedHumans);
    setRoomHumans(roomId, seedHumans);
    if (role === "host") {
      markRoomShared(roomId, myId);
      setRoom((prev) => (prev ? { ...prev, shared: true, hostId: myId } : prev));
    }

    syncRef.current = createRoomSync({
      roomId,
      role,
      getSnapshot: () => ({
        room: {
          id: roomId,
          name: roomRef.current?.name,
          themeId: roomRef.current?.themeId,
          memberIds: roomRef.current?.memberIds,
          hostId: roomRef.current?.hostId || myId,
          createdAt: roomRef.current?.createdAt,
        },
        messages: messagesRef.current,
        humans: humansRef.current,
      }),
      onSnapshot: applyRemoteSnapshot,
      onStatus: (_s, detail) => setShareStatus(translateShareStatus(detail, lang) || detail || ""),
    });
  };

  useEffect(() => {
    if (!roomId || !room) return undefined;
    const role =
      isGuest || (room.shared && room.hostId && room.hostId !== myId)
        ? "guest"
        : room.shared
          ? "host"
          : null;
    if (role) {
      startSync(role);
      if (role === "host") {
        setInviteLink(inviteUrlForRoom(roomId));
        setShareOpen(true);
      }
    }
    return () => {
      syncRef.current?.destroy();
      syncRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, isGuest]);

  const handleShare = async () => {
    setShareOpen(true);
    setInviteLink(inviteUrlForRoom(roomId));
    setCopied(false);
    if (!syncRef.current) startSync("host");
    try {
      await navigator.clipboard.writeText(inviteUrlForRoom(roomId));
      setCopied(true);
      setShareStatus(t("roomChat.linkCopied"));
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareStatus(t("roomChat.copyHint"));
    }
  };

  const speakLine = (fullText, opts) => {
    if (!fullText?.trim()) return;
    chunkTimersRef.current.forEach(clearTimeout);
    chunkTimersRef.current = [];
    setIsSpeaking(true);
    unlockAudioPlayback();
    speakText(fullText, () => setIsSpeaking(false), opts);
  };

  useEffect(() => {
    if (!room || !readySaveRef.current) return;
    if (members.length < 2) return;
    if (spokeOnOpenRef.current) return;
    // Guests don't re-trigger host greeting
    if (isGuest || (room.hostId && room.hostId !== myId)) {
      spokeOnOpenRef.current = true;
      return;
    }

    // New room — host greets and speaks (show bubble when voice starts)
    if (!greetedRef.current) {
      greetedRef.current = true;
      spokeOnOpenRef.current = true;
      const host = members[0];
      const text = buildRoomGreeting(members, theme, displayName, lang);
      const greeting = {
        id: Date.now(),
        role: "assistant",
        characterId: host.id,
        speakerName: host.name,
        content: text,
        timestamp: new Date().toISOString(),
      };
      setIsTyping(true);
      setTypingAs(host);
      speakText(
        text,
        () => {
          setIsSpeaking(false);
          setIsTyping(false);
          setTypingAs(null);
        },
        getCharacterVoiceOpts(host, lang),
        {
          onStart: () => {
            if (!liveRef.current) {
              stopSpeaking();
              return;
            }
            setTypingAs(null);
            setIsTyping(false);
            setMessages([greeting]);
            playReceiveSound();
            setIsSpeaking(true);
            syncRef.current?.publishMessage(greeting);
          },
        }
      );
      return;
    }

    // Re-opening — speak the last companion line
    const lastAi = [...(room.messages || [])].reverse().find(
      (m) => m.role === "assistant" && m.content?.trim()
    );
    if (!lastAi) return;
    spokeOnOpenRef.current = true;
    const speaker = getCharacterById(lastAi.characterId) || members[0];
    const spoken = naturalizeRoomText(lastAi.content) || lastAi.content;
    speakLine(spoken, getCharacterVoiceOpts(speaker, lang));
  }, [room, members, theme, displayName, isGuest, myId]);

  useEffect(() => {
    if (!roomId || !readySaveRef.current || !messages.length) return;
    saveRoomMessages(roomId, messages);
    if (!applyingRemoteRef.current) {
      syncRef.current?.publishMessages(messages, humansRef.current);
    }
  }, [messages, roomId]);

  useEffect(() => {
    const guestOfShared =
      isGuest || Boolean(room?.shared && room?.hostId && room.hostId !== myId);
    if (guestOfShared || !messages.length || members.length < 2) return;
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
    runRoomTurnRef.current?.(text, messages, speakerName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isGuest, room?.shared, room?.hostId, myId]);

  useEffect(() => {
    const guestOfShared =
      isGuest || Boolean(room?.shared && room?.hostId && room.hostId !== myId);
    if (!guestOfShared) return;
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") setIsTyping(false);
  }, [messages, isGuest, room?.shared, room?.hostId, myId]);

  const isRoomGuest = () => {
    const r = roomRef.current;
    return isGuestRef.current || Boolean(r?.shared && r?.hostId && r.hostId !== myId);
  };

  const deliverIdleGameNudge = async () => {
    if (!liveRef.current) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    if (isRoomGuest()) return;
    if (busyRef.current) return;

    const mems = (roomRef.current?.memberIds || [])
      .map((id) => getCharacterById(id))
      .filter(Boolean);
    if (mems.length < 2) return;

    const msgs = messagesRef.current;
    const last = msgs[msgs.length - 1];
    if (!last || last.role !== "assistant") return;
    if (idleNudgedForRef.current === last.id) return;
    idleNudgedForRef.current = last.id;

    const speaker = getCharacterById(last.characterId) || mems[0];
    const text = pickIdleGameNudge(lang);
    const aiMsg = {
      id: Date.now(),
      role: "assistant",
      characterId: speaker.id,
      speakerName: speaker.name,
      content: text,
      timestamp: new Date().toISOString(),
    };

    busyRef.current = true;
    setIsTyping(true);
    setTypingAs(speaker);
    typingSoundRef.current = setInterval(playTypingSound, 320);
    try {
      await new Promise((resolve) => {
        let shown = false;
        const show = () => {
          if (shown) return;
          shown = true;
          if (!liveRef.current) {
            stopSpeaking();
            resolve();
            return;
          }
          clearInterval(typingSoundRef.current);
          setIsTyping(false);
          setTypingAs(null);
          setMessages((prev) => [...prev, aiMsg]);
          playReceiveSound();
          setIsSpeaking(true);
          resolve();
        };
        speakText(
          text,
          () => {
            if (liveRef.current) setIsSpeaking(false);
            show();
          },
          getCharacterVoiceOpts(speaker, lang),
          { onStart: show }
        );
      });
    } finally {
      clearInterval(typingSoundRef.current);
      setIsTyping(false);
      setTypingAs(null);
      busyRef.current = false;
    }
  };

  useEffect(() => {
    disarmIdleNudge();
    if (!liveRef.current || isRoomGuest()) return disarmIdleNudge;
    if (busyRef.current || isTyping || isSpeaking) return disarmIdleNudge;
    if ((room?.memberIds || []).length < 2) return disarmIdleNudge;

    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") {
      idleNudgedForRef.current = null;
      return disarmIdleNudge;
    }
    if (idleNudgedForRef.current === last.id) return disarmIdleNudge;

    armIdleNudge(IDLE_NUDGE_MS, deliverIdleGameNudge);
    return disarmIdleNudge;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isTyping, isSpeaking, isGuest, room?.shared, room?.hostId, room?.memberIds, myId]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const last = messages[messages.length - 1];
    if (last?.role === "user" && (!last.senderId || last.senderId === myId)) {
      stickToBottomRef.current = true;
    }
    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isTyping, myId]);

  const speakInChunks = speakLine;

  const handleStopSpeaking = () => {
    stopSpeaking();
    chunkTimersRef.current.forEach(clearTimeout);
    chunkTimersRef.current = [];
    setIsSpeaking(false);
  };

  const applyProfileHints = (text) => {
    const hints = extractProfileHints(text);
    if (!hints.name && !hints.nickname && !hints.place) return;
    setUserProfileState(setUserProfile(hints));
  };

  const appendReplies = async (userText, history, speakerName = "") => {
    const lastSpeakers = history
      .filter((m) => m.role === "assistant" && m.characterId)
      .slice(-4)
      .map((m) => m.characterId);

    const responders = pickRoomResponders(userText, members, lastSpeakers);

    if (wantsPhotoShare(userText) && responders[0]) {
      const speaker = responders[0];
      const askIndex = photoAsksSinceShareRef.current;
      const share = nextPhotoShare(
        speaker,
        photosSharedRef.current,
        photoShareCount(userText),
        lang,
        askIndex,
        { followUp: isPhotoFollowUpAsk(userText) }
      );
      photoAsksSinceShareRef.current = askIndex + 1;
      const attached = share.images?.length || (share.image ? 1 : 0);
      if (attached) {
        photosSharedRef.current += attached;
        photoAsksSinceShareRef.current = 0;
      }
      const spoken = share.speak || share.content;
      setTypingAs(speaker);
      await new Promise((resolve) => {
        let shown = false;
        const show = () => {
          if (shown) return;
          shown = true;
          if (!liveRef.current) {
            stopSpeaking();
            resolve();
            return;
          }
          setTypingAs(null);
          const aiMsg = {
            id: Date.now() + Math.random(),
            role: "assistant",
            characterId: speaker.id,
            speakerName: speaker.name,
            content: share.content,
            image: share.image || undefined,
            images: share.images?.length ? share.images : undefined,
            timestamp: new Date().toISOString(),
          };
          setMessages([...history, aiMsg]);
          playReceiveSound();
          setIsSpeaking(true);
          resolve();
        };
        speakText(
          spoken,
          () => {
            if (liveRef.current) setIsSpeaking(false);
            show();
          },
          getCharacterVoiceOpts(speaker, lang),
          { onStart: show }
        );
      });
      return;
    }

    // Fetch all replies first (in parallel) so there's no wait between speakers
    const replies = await Promise.all(
      responders.map((speaker) => {
        const apiHistory = [...history]
          .filter((m) => m.content)
          .slice(-14)
          .map((m) => ({
            role: m.role,
            content: m.content,
            speakerName: m.speakerName,
            senderName: m.senderName,
          }));
        return sendRoomChatMessage(userText, speaker, members, apiHistory, {
          themeName: `${room.name} · ${theme.name}`,
          userProfile: getUserProfile(),
          people: humansRef.current || [],
          speakerName: speakerName || getMyHuman().name,
          chatLanguage: lang,
        }).then(({ reply }) => ({ speaker, reply }));
      })
    );

    // Now show + speak one by one — bubble appears when voice actually starts
    let running = [...history];
    for (const { speaker, reply } of replies) {
      const spoken = naturalizeRoomText(reply) || reply;
      setTypingAs(speaker);
      await new Promise((resolve) => {
        let shown = false;
        const show = () => {
          if (shown) return;
          shown = true;
          setTypingAs(null);
          const aiMsg = {
            id: Date.now() + Math.random(),
            role: "assistant",
            characterId: speaker.id,
            speakerName: speaker.name,
            content: spoken,
            timestamp: new Date().toISOString(),
          };
          running = [...running, aiMsg];
          setMessages(running);
          playReceiveSound();
          setIsSpeaking(true);
        };
        speakText(
          spoken,
          () => {
            show();
            setIsSpeaking(false);
            resolve();
          },
          getCharacterVoiceOpts(speaker, lang),
          { onStart: show }
        );
      });
      await new Promise((r) => setTimeout(r, 280));
    }
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || members.length < 2) return;
    idleNudgedForRef.current = null;
    disarmIdleNudge();
    setError(null);
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
    const next = [...messagesRef.current, userMsg];
    messagesRef.current = next;
    setMessages(next);
    setInput("");
    lastRepliedUserMsgIdRef.current = userMsg.id;

    const guestOfShared =
      isGuestRef.current || Boolean(roomRef.current?.shared && roomRef.current?.hostId && roomRef.current.hostId !== myId);
    if (guestOfShared) {
      setIsTyping(true);
      return;
    }

    if (busyRef.current) {
      pendingQueueRef.current.push({ text: msg, speakerName: me.name });
      return;
    }

    await runRoomTurn(msg, next, me.name);
  };

  const runRoomTurn = async (msg, history, speakerName = "") => {
    busyRef.current = true;
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 300 + Math.random() * 150);
    try {
      await appendReplies(msg, history, speakerName);
    } catch (err) {
      setError(err.message || t("chat.checkKey"));
    } finally {
      clearInterval(typingSoundRef.current);
      setIsTyping(false);
      setTypingAs(null);
      busyRef.current = false;
      const rest = pendingQueueRef.current.splice(0);
      if (rest.length) {
        const combined = rest
          .map((q) => (q.speakerName ? `${q.speakerName} said: ${q.text}` : q.text))
          .join("\n");
        const who = rest[rest.length - 1]?.speakerName || "";
        await runRoomTurn(combined, messagesRef.current, who);
      } else {
        setTimeout(() => inputRef.current?.focus(), 80);
      }
    }
  };
  runRoomTurnRef.current = runRoomTurn;

  const handleSendImage = async (imageDataUrl, caption = "") => {
    if (!imageDataUrl) return;
    idleNudgedForRef.current = null;
    disarmIdleNudge();
    setError(null);
    playSendSound();

    const me = getMyHuman();
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: caption.trim() || t("roomChat.sharedPhotoRoom"),
      image: imageDataUrl,
      senderId: me.id,
      senderName: me.name,
      senderAvatar: me.avatar,
      timestamp: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    setMessages(next);

    const guestOfShared =
      isGuestRef.current || Boolean(roomRef.current?.shared && roomRef.current?.hostId && roomRef.current.hostId !== myId);
    if (guestOfShared) {
      setIsTyping(true);
      return;
    }

    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 300 + Math.random() * 150);

    try {
      const note = getPhotoReactPrompt(lang, { room: true, caption });
      await appendReplies(note, next);
    } catch (err) {
      setError(err.message || t("chat.couldNotReply"));
    } finally {
      clearInterval(typingSoundRef.current);
      setIsTyping(false);
      setTypingAs(null);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = createSpeechRecognition(userProfile, lang);
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
      setTimeout(() => handleSend(transcript), 250);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleClear = () => {
    handleStopSpeaking();
    setMessages([]);
    greetedRef.current = false;
    photoAsksSinceShareRef.current = 0;
    photosSharedRef.current = 0;
    saveRoomMessages(roomId, []);
    const host = members[0];
    if (!host) return;
    const text = buildRoomGreeting(members, theme, getDisplayName(getUserProfile()), lang);
    const greeting = {
      id: Date.now(),
      role: "assistant",
      characterId: host.id,
      speakerName: host.name,
      content: text,
      timestamp: new Date().toISOString(),
    };
    greetedRef.current = true;
    setIsTyping(true);
    setTypingAs(host);
    speakText(
      text,
      () => {
        setIsSpeaking(false);
        setIsTyping(false);
        setTypingAs(null);
      },
      getCharacterVoiceOpts(host, lang),
      {
        onStart: () => {
          setTypingAs(null);
          setIsTyping(false);
          setMessages([greeting]);
          playReceiveSound();
          setIsSpeaking(true);
        },
      }
    );
  };

  const tryAddMember = async (characterId) => {
    if (isTyping) return;
    try {
      setError(null);
      const next = addRoomMember(roomId, characterId);
      if (!next) return;

      setRoom(next);
      const joiner = getCharacterById(characterId);
      if (!joiner) return;

      const allMembers = (next.memberIds || [])
        .map((id) => getCharacterById(id))
        .filter(Boolean);

      const joinLine = {
        id: Date.now(),
        role: "system",
        content: `${joiner.name} just joined the room ✨`,
        timestamp: new Date().toISOString(),
      };

      const historyAfterJoin = [...messages, joinLine];
      setMessages(historyAfterJoin);
      setMembersOpen(false);
      setIsTyping(true);
      setTypingAs(joiner);
      typingSoundRef.current = setInterval(playTypingSound, 300 + Math.random() * 150);

      try {
        const display = getDisplayName(getUserProfile()) || t("chat.everyone");
        const others = allMembers
          .filter((m) => m.id !== joiner.id)
          .map((m) => m.name)
          .join(", ");

        const introPrompt = getRoomJoinIntroPrompt(lang, {
          themeName: theme.name,
          others,
          displayName: display,
        });

        const apiHistory = historyAfterJoin
          .filter((m) => m.content && m.role !== "system")
          .slice(-12)
          .map((m) => ({
            role: m.role,
            content: m.content,
            speakerName: m.speakerName,
          }));

        const { reply } = await sendRoomChatMessage(
          introPrompt,
          joiner,
          allMembers,
          apiHistory,
          {
            themeName: `${next.name} · ${theme.name}`,
            userProfile: getUserProfile(),
            chatLanguage: lang,
          }
        );

        const spoken = naturalizeRoomText(reply) || reply;
        const aiMsg = {
          id: Date.now() + 1,
          role: "assistant",
          characterId: joiner.id,
          speakerName: joiner.name,
          content: spoken,
          timestamp: new Date().toISOString(),
        };
        await new Promise((resolve) => {
          let shown = false;
          const show = () => {
            if (shown) return;
            shown = true;
            clearInterval(typingSoundRef.current);
            setTypingAs(null);
            setIsTyping(false);
            setMessages((prev) => [...prev, aiMsg]);
            playReceiveSound();
            setIsSpeaking(true);
            resolve();
          };
          speakText(
            spoken,
            () => setIsSpeaking(false),
            getCharacterVoiceOpts(joiner, lang),
            { onStart: show }
          );
          setTimeout(show, 10000);
        });
      } catch (err) {
        // Fallback intro if API fails
        const fallback = getRoomJoinFallback(lang, joiner.name);
        await new Promise((resolve) => {
          let shown = false;
          const show = () => {
            if (shown) return;
            shown = true;
            clearInterval(typingSoundRef.current);
            setTypingAs(null);
            setIsTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now() + 1,
                role: "assistant",
                characterId: joiner.id,
                speakerName: joiner.name,
                content: fallback,
                timestamp: new Date().toISOString(),
              },
            ]);
            playReceiveSound();
            setIsSpeaking(true);
            resolve();
          };
          speakText(
            fallback,
            () => setIsSpeaking(false),
            getCharacterVoiceOpts(joiner, lang),
            { onStart: show }
          );
          setTimeout(show, 10000);
        });
      } finally {
        clearInterval(typingSoundRef.current);
        setIsTyping(false);
        setTypingAs(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const tryRemoveMember = (characterId) => {
    try {
      setError(null);
      const next = removeRoomMember(roomId, characterId);
      if (next) {
        setRoom(next);
        const c = getCharacterById(characterId);
        if (c) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              role: "system",
              content: `${c.name} left the room`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const renameRoom = () => {
    const next = window.prompt(t("roomChat.roomNamePrompt"), room?.name || "");
    if (next == null) return;
    const updated = updateRoom(roomId, { name: next.trim().slice(0, 40) || room.name });
    if (updated) setRoom(updated);
  };

  const addable = useMemo(() => {
    const taken = new Set(room?.memberIds || []);
    let list = characters.filter((c) => !taken.has(c.id));
    if (addFilter === "girls") list = list.filter((c) => c.gender === "female");
    if (addFilter === "boys") list = list.filter((c) => c.gender === "male");
    return list;
  }, [room, addFilter]);

  if (!room) return null;

  return (
    <div
      className={`chat-vv-shell flex flex-col overflow-hidden ${theme.bgClass}`}
      style={{
        height: "var(--vv-height, 100dvh)",
        maxHeight: "var(--vv-height, 100dvh)",
        top: "var(--vv-offset-top, 0px)",
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
      }}
    >
      <div className="flex-1 min-h-0 w-full max-w-3xl mx-auto flex flex-col border-x border-primary/10 bg-white/55 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 pt-3 pb-2.5 border-b border-primary/10 gap-2 flex-shrink-0 bg-white/75">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                liveRef.current = false;
                disarmIdleNudge();
                stopSpeaking();
                recognitionRef.current?.abort();
                navigate("/rooms");
              }}
              className="text-muted hover:text-primary text-sm flex-shrink-0"
            >
              ← {t("roomChat.backRooms").replace("← ", "")}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-bold text-sm text-dark truncate">{room.name}</h1>
                <button type="button" onClick={renameRoom}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-colors"
                  title={t("roomChat.rename")}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <p className="text-[11px] text-muted truncate">
                {t("roomChat.inRoom", { theme: theme.name, count: members.length })}
                {displayName ? t("roomChat.hi", { name: displayName }) : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary/10"
              title={t("roomChat.inviteTitle")}
            >
              {copied ? t("chat.copied") : t("roomChat.share")}
            </button>
            <button
              type="button"
              onClick={() => setMembersOpen((v) => !v)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary/10"
            >
              {t("roomChat.members")}
            </button>
            {isSpeaking && (
              <button
                type="button"
                onClick={handleStopSpeaking}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-primary/20 text-primary"
              >
                {t("roomChat.stop")}
              </button>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-dark/10 text-muted hover:text-dark"
            >
              {t("roomChat.new")}
            </button>
          </div>
        </div>

        {shareOpen && (
          <div className="px-3 py-2.5 border-b border-primary/10 bg-white/80 flex-shrink-0">
            <p className="text-xs font-semibold text-dark mb-1">{t("roomChat.inviteFriend")}</p>
            <p className="text-[11px] text-muted mb-2">
              {translateShareStatus(shareStatus, lang) || t("roomChat.inviteSub")}
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteLink || inviteUrlForRoom(roomId)}
                className="flex-1 min-w-0 text-[11px] px-2.5 py-1.5 rounded-lg border border-dark/10 bg-white text-dark"
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={handleShare}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white"
              >
                {t("chat.copy")}
              </button>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="text-xs px-2 py-1.5 rounded-lg text-muted hover:text-dark"
              >
                {t("chat.hide")}
              </button>
            </div>
            {humans.length > 0 && (
              <p className="text-[11px] text-muted mt-2">
                {t("chat.people")} {humans.map((h) => h.name || t("chat.guest")).join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Member strip */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/10 overflow-x-auto flex-shrink-0 bg-white/40">
          {humans.map((h) => (
            <div key={h.id} className="flex items-center gap-1.5 flex-shrink-0 rounded-full bg-primary/10 border border-primary/20 pl-0.5 pr-2.5 py-0.5">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary text-white text-[10px] font-bold flex items-center justify-center">
                {h.avatar
                  ? <img src={h.avatar} alt="" className="w-full h-full object-cover" draggable={false} />
                  : (h.name || "?").charAt(0).toUpperCase()}
              </div>
              <span className="text-[11px] font-semibold text-dark">{h.name}{h.id === myId ? t("chat.you") : ""}</span>
            </div>
          ))}
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-1.5 flex-shrink-0 rounded-full bg-white border border-dark/8 pl-0.5 pr-2.5 py-0.5">
              <div className="w-7 h-7 rounded-full overflow-hidden">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover object-top" draggable={false} />
              </div>
              <span className="text-[11px] font-semibold text-dark">{m.name}</span>
            </div>
          ))}
        </div>

        {membersOpen && (
          <div className="border-b border-primary/10 bg-white/90 px-3 py-3 max-h-[42%] overflow-y-auto flex-shrink-0">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{t("roomChat.inThisRoom")}</p>
            <div className="space-y-2 mb-4">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <img src={m.image} alt="" className="w-8 h-8 rounded-full object-cover object-top" draggable={false} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">{m.name}</p>
                    <p className="text-[11px] text-muted">{m.gender === "female" ? t("roomCreate.girl") : t("roomCreate.boy")} · {m.vibe}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => tryRemoveMember(m.id)}
                    className="text-[11px] text-muted hover:text-primary"
                  >
                    {t("roomChat.remove")}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-2">
              {[
                { id: "all", label: t("roomChat.addAnyone") },
                { id: "girls", label: t("roomCreate.girls") },
                { id: "boys", label: t("roomCreate.boys") },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setAddFilter(f.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                    addFilter === f.id
                      ? "bg-primary text-white border-primary"
                      : "border-dark/10 text-muted"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {addable.slice(0, 12).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => tryAddMember(c.id)}
                  disabled={members.length >= 6}
                  className="rounded-xl border border-dark/8 overflow-hidden text-left disabled:opacity-40 hover:border-primary/40"
                >
                  <div className="aspect-square overflow-hidden">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover object-top" draggable={false} />
                  </div>
                  <p className="text-[10px] font-semibold px-1.5 py-1 truncate">{c.name}</p>
                </button>
              ))}
            </div>
            {members.length >= 6 && (
              <p className="text-[11px] text-muted mt-2">{t("roomChat.roomFull")}</p>
            )}
          </div>
        )}

        {/* Messages */}
        <div
          ref={listRef}
          onScroll={() => {
            const el = listRef.current;
            if (!el) return;
            stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          }}
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y px-4 py-4 space-y-4 scrollbar-thin"
          style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", touchAction: "pan-y" }}
        >
          {messages.length <= 1 && (
            <div className="text-center pb-2">
              <p className="text-muted text-xs">{t("roomChat.chatHint")}</p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === "system") {
              return (
                <p key={msg.id} className="text-center text-[11px] text-muted py-1">
                  {msg.content}
                </p>
              );
            }
            const speaker =
              msg.role === "assistant"
                ? getCharacterById(msg.characterId) || members[0]
                : null;
            return (
              <ChatMessage key={msg.id} message={msg} character={speaker} myUserId={myId} />
            );
          })}

          {isTyping && (
            <TypingIndicator character={typingAs || members[0]} />
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-500 text-xs">
              {error}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex-shrink-0">
        <VoiceControls
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onSendImage={handleSendImage}
          onMicClick={handleVoiceInput}
          onStopSpeaking={handleStopSpeaking}
          isListening={isListening}
          isTyping={isTyping}
          isSpeaking={isSpeaking}
          characterFirstName={t("chat.everyone")}
          inputRef={inputRef}
          lang={lang}
        />
        </div>
      </div>
    </div>
  );
}
