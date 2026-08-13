import { useState, useEffect, useRef } from "react";
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
  getUserVoiceRegion,
} from "../services/api";
import {
  createRoomSync,
  inviteUrlForRoom,
  chatShareId,
  getMyHuman,
  mergeById,
  mergeHumans,
} from "../services/roomSync";
import { playSendSound, playReceiveSound, playTypingSound } from "../utils/sounds";

export default function ChatPage() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const character = getCharacterById(characterId);
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

  const userRegion = getUserVoiceRegion(userProfile?.place || "");
  // Companion voice follows HER/HIS country + vibe (not the user's place)
  const voiceOpts = {
    gender: character?.gender || "male",
    region: character?.region || userRegion || "european",
    vibe: character?.vibeId || "sweet",
  };

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
      onStatus: (_s, detail) => setShareStatus(detail || ""),
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
      setShareStatus("Link copied — keep this chat open so friends can join");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareStatus("Copy the link below and send it to your friend");
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
      photosSharedRef.current = saved.photosShared || 0;
      setMessages(saved.messages);
      setResumed(true);
      hasGreetedRef.current = true;
      setIsTyping(false);
      readyToSaveRef.current = true;
      if (saved.shared && saved.shareId) {
        startSync("host", saved.shareId);
        setInviteLink(inviteUrlForRoom(saved.shareId));
      }
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

      const greetingText = buildIntroGreeting(character.name, getUserProfile());
      const greeting = {
        id: Date.now(),
        role: "assistant",
        content: greetingText,
        timestamp: new Date().toISOString(),
      };
      readyToSaveRef.current = true;

      speakText(
        greetingText,
        () => setIsSpeaking(false),
        voiceOpts,
        {
          onStart: () => {
            clearInterval(typingSoundRef.current);
            setIsTyping(false);
            setMessages([greeting]);
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

  const loadPopupSuggestions = async (history) => {
    setPopupLoading(true);
    setPopupOpen(true);
    try {
      const list = await fetchConversationSuggestions(character.name, history, mood);
      setPopupSuggestions(list);
    } catch {
      setPopupSuggestions([
        "Tell me more",
        "That was cute — keep going",
        "Your turn to ask me something",
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
      const reveal = () => {
        if (revealed) return;
        revealed = true;
        onReveal?.();
        setIsSpeaking(true);
        resolve();
      };
      speakText(
        fullText,
        () => setIsSpeaking(false),
        opts || voiceOpts,
        { onStart: reveal }
      );
      // Don't leave typing forever if TTS hangs
      const safety = setTimeout(reveal, 10000);
      chunkTimersRef.current.push(safety);
    });

  const appendAssistantReply = async (userText, nextHistory, { imageNote = false } = {}) => {
    if (character && wantsPhotoShare(userText) && !imageNote) {
      await new Promise((r) => setTimeout(r, 700));

      const share = nextPhotoShare(character, photosSharedRef.current, photoShareCount(userText));
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

    const history = nextHistory
      .slice(-10)
      .filter((m) => m.content)
      .map((m) => ({
        role: m.role,
        content: m.image && !m.content
          ? "[User shared a photo]"
          : m.image
          ? `${m.content}\n[User also shared a photo]`
          : m.content,
      }));

    const prompt = imageNote
      ? userText || "I just shared a photo with you. React to it in a flirty, warm way — keep it short."
      : userText;

    const data = await sendChatMessage(prompt, characterId, history.slice(0, -1), {
      mood,
      truthOrDare: todMode,
      userProfile: getUserProfile(),
    });
    const claimedPhoto = /\[image attached\]|image attached|here's (a |my )?(pic|photo|selfie)|sending (you )?(a )?(pic|photo)|check this (pic|photo)/i.test(data.reply || "");
    let attached;
    if (claimedPhoto && character) {
      attached = nextPhotoShare(character, photosSharedRef.current, 1);
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

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;
    setError(null);
    setPopupOpen(false);
    setResumed(false);
    playSendSound();
    applyProfileHints(msg);

    const me = getMyHuman();
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: msg,
      senderId: me.id,
      senderName: me.name,
      senderAvatar: me.avatar,
      timestamp: new Date().toISOString(),
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 300 + Math.random() * 200);

    try {
      await appendAssistantReply(msg, nextHistory);
    } catch (err) {
      setError(err.message || "Couldn't get a reply. Check your OpenAI key in frontend/.env");
    } finally {
      clearInterval(typingSoundRef.current);
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSendImage = async (imageDataUrl, caption = "") => {
    if (!imageDataUrl || isTyping) return;
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
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 300 + Math.random() * 200);

    try {
      const note = caption.trim()
        ? `I shared a photo and said: "${caption.trim()}". React warmly.`
        : "I just shared a photo with you. React to it in a flirty, warm way — keep it short.";
      await appendAssistantReply(note, nextHistory, { imageNote: true });
    } catch (err) {
      setError(err.message || "Couldn't get a reply. Check your OpenAI key in frontend/.env");
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
    const recognition = createSpeechRecognition();
    if (!recognition) {
      setError("Speech recognition is not supported in your browser. Try Chrome.");
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

  const handleClear = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setPopupOpen(false);
    setResumed(false);
    photosSharedRef.current = 0;
    clearChat(character.id);
    const greetingText = buildIntroGreeting(character.name, getUserProfile());
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
        ? `Truth or Dare — I pick Truth. Ask me: "${randomTruth()}"`
        : `Truth or Dare — I pick Dare. My dare is: "${randomDare()}" — react and keep the game going!`;
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
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden hero-bg">
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
    </div>
  );
}
