import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "../data/chatRooms";
import { characters, getCharacterById } from "../data/characters";
import {
  getUserProfile,
  getDisplayName,
  extractProfileHints,
  setUserProfile,
} from "../data/userProfile";
import {
  sendRoomChatMessage,
  pickRoomResponders,
  createSpeechRecognition,
  stopSpeaking,
  speakText,
} from "../services/api";
import { playSendSound, playReceiveSound, playTypingSound } from "../utils/sounds";

function buildRoomGreeting(members, theme, displayName) {
  const names = members.map((m) => m.name);
  const host = names[0] || "us";
  const rest = names.slice(1);
  const who = displayName || "you";
  if (rest.length === 0) {
    return `Hey ${who}… welcome to ${theme.name}. I'm ${host} — pull up a seat.`;
  }
  if (rest.length === 1) {
    return `Hey ${who}! ${host} here with ${rest[0]} — ${theme.tagline.toLowerCase()}. What's the vibe tonight?`;
  }
  return `Hey ${who}! It's ${host}, plus ${rest.slice(0, -1).join(", ")} and ${rest[rest.length - 1]}. ${theme.name} is open — who's talking first?`;
}

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(() => getRoom(roomId));
  const [messages, setMessages] = useState(() => room?.messages || []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingAs, setTypingAs] = useState(null);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [addFilter, setAddFilter] = useState("all");
  const [userProfile, setUserProfileState] = useState(() => getUserProfile());

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const endRef = useRef(null);
  const readySaveRef = useRef(false);
  const greetedRef = useRef(false);
  const typingSoundRef = useRef(null);
  const chunkTimersRef = useRef([]);

  const theme = getRoomTheme(room?.themeId);
  const members = useMemo(
    () => (room?.memberIds || []).map((id) => getCharacterById(id)).filter(Boolean),
    [room]
  );
  const displayName = getDisplayName(userProfile);

  useEffect(() => {
    const r = getRoom(roomId);
    if (!r) {
      navigate("/rooms", { replace: true });
      return;
    }
    setRoom(r);
    setMessages(r.messages || []);
    readySaveRef.current = true;
    greetedRef.current = (r.messages || []).length > 0;
  }, [roomId, navigate]);

  useEffect(() => {
    if (!room || !readySaveRef.current) return;
    if (greetedRef.current) return;
    if (members.length < 2) return;

    greetedRef.current = true;
    const host = members[0];
    const text = buildRoomGreeting(members, theme, displayName);
    const greeting = {
      id: Date.now(),
      role: "assistant",
      characterId: host.id,
      speakerName: host.name,
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages([greeting]);
    playReceiveSound();
    speakInChunks(text, { gender: host.gender, region: host.region });
  }, [room, members, theme, displayName]);

  useEffect(() => {
    if (!roomId || !readySaveRef.current || !messages.length) return;
    saveRoomMessages(roomId, messages);
  }, [messages, roomId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const speakInChunks = (fullText, opts) => {
    if (!fullText?.trim()) return;
    chunkTimersRef.current.forEach(clearTimeout);
    chunkTimersRef.current = [];
    setIsSpeaking(true);
    speakText(
      fullText,
      () => setIsSpeaking(false),
      opts
    );
  };

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

  const appendReplies = async (userText, history) => {
    const lastSpeakers = history
      .filter((m) => m.role === "assistant" && m.characterId)
      .slice(-4)
      .map((m) => m.characterId);

    const responders = pickRoomResponders(userText, members, lastSpeakers);
    let running = [...history];

    for (const speaker of responders) {
      setTypingAs(speaker);
      const apiHistory = running
        .filter((m) => m.content)
        .slice(-14)
        .map((m) => ({
          role: m.role,
          content: m.content,
          speakerName: m.speakerName,
        }));

      const { reply } = await sendRoomChatMessage(
        userText,
        speaker,
        members,
        apiHistory.slice(0, -1),
        {
          themeName: `${room.name} · ${theme.name}`,
          userProfile: getUserProfile(),
        }
      );

      const aiMsg = {
        id: Date.now() + Math.random(),
        role: "assistant",
        characterId: speaker.id,
        speakerName: speaker.name,
        content: reply,
        timestamp: new Date().toISOString(),
      };
      running = [...running, aiMsg];
      setMessages(running);
      playReceiveSound();
      speakInChunks(reply, { gender: speaker.gender, region: speaker.region });
      await new Promise((r) => setTimeout(r, 350));
    }
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isTyping || members.length < 2) return;
    setError(null);
    playSendSound();
    applyProfileHints(msg);

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: msg,
      timestamp: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 180);

    try {
      await appendReplies(msg, next);
    } catch (err) {
      setError(err.message || "Couldn't get a reply. Check your OpenAI key.");
    } finally {
      clearInterval(typingSoundRef.current);
      setIsTyping(false);
      setTypingAs(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const handleSendImage = async (imageDataUrl, caption = "") => {
    if (!imageDataUrl || isTyping) return;
    setError(null);
    playSendSound();

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: caption.trim() || "Shared a photo with the room",
      image: imageDataUrl,
      timestamp: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 180);

    try {
      const note = caption.trim()
        ? `I shared a photo and said: "${caption.trim()}". React as a group — keep it flirty and short.`
        : "I just shared a photo with the room. React warmly and flirty — keep it short.";
      await appendReplies(note, next);
    } catch (err) {
      setError(err.message || "Couldn't get a reply.");
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
    const recognition = createSpeechRecognition();
    if (!recognition) {
      setError("Speech recognition needs Chrome.");
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
    saveRoomMessages(roomId, []);
    const host = members[0];
    if (!host) return;
    const text = buildRoomGreeting(members, theme, getDisplayName(getUserProfile()));
    const greeting = {
      id: Date.now(),
      role: "assistant",
      characterId: host.id,
      speakerName: host.name,
      content: text,
      timestamp: new Date().toISOString(),
    };
    greetedRef.current = true;
    setMessages([greeting]);
    speakInChunks(text, { gender: host.gender, region: host.region });
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
      typingSoundRef.current = setInterval(playTypingSound, 180);

      try {
        const display = getDisplayName(getUserProfile()) || "everyone";
        const others = allMembers
          .filter((m) => m.id !== joiner.id)
          .map((m) => m.name)
          .join(", ");

        const introPrompt = `You just walked into this flirty group chat (${theme.name}). Others here: ${others || "the group"}. The user's name is ${display}. Say hi, introduce yourself briefly, and jump into the vibe of what they've been chatting about. Keep it playful, PG-13, 1–3 sentences. Do not speak for anyone else.`;

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
          }
        );

        const aiMsg = {
          id: Date.now() + 1,
          role: "assistant",
          characterId: joiner.id,
          speakerName: joiner.name,
          content: reply,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        playReceiveSound();
        speakInChunks(reply, { gender: joiner.gender, region: joiner.region });
      } catch (err) {
        // Fallback intro if API fails
        const fallback = `Hey… I'm ${joiner.name}. Just slipped into the room — what'd I miss?`;
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
        speakInChunks(fallback, { gender: joiner.gender, region: joiner.region });
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
    const next = window.prompt("Room name", room?.name || "");
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
    <div className={`flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden ${theme.bgClass} pt-[max(0.5rem,env(safe-area-inset-top))]`}>
      <div className="flex-1 min-h-0 w-full max-w-3xl mx-auto flex flex-col border-x border-primary/10 bg-white/55 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 pt-3 pb-2.5 border-b border-primary/10 gap-2 flex-shrink-0 bg-white/75">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/rooms")}
              className="text-muted hover:text-primary text-sm flex-shrink-0"
            >
              ← Rooms
            </button>
            <div className="min-w-0">
              <button type="button" onClick={renameRoom} className="text-left">
                <h1 className="font-display font-bold text-sm text-dark truncate">{room.name}</h1>
                <p className="text-[11px] text-muted truncate">
                  {theme.name} · {members.length} in room
                  {displayName ? ` · hi ${displayName}` : ""}
                </p>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setMembersOpen((v) => !v)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary/10"
            >
              Members
            </button>
            {isSpeaking && (
              <button
                type="button"
                onClick={handleStopSpeaking}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-primary/20 text-primary"
              >
                Stop
              </button>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-dark/10 text-muted hover:text-dark"
            >
              New
            </button>
          </div>
        </div>

        {/* Member strip */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/10 overflow-x-auto flex-shrink-0 bg-white/40">
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
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">In this room</p>
            <div className="space-y-2 mb-4">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <img src={m.image} alt="" className="w-8 h-8 rounded-full object-cover object-top" draggable={false} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">{m.name}</p>
                    <p className="text-[11px] text-muted">{m.gender === "female" ? "Girl" : "Boy"} · {m.vibe}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => tryRemoveMember(m.id)}
                    className="text-[11px] text-muted hover:text-primary"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-2">
              {[
                { id: "all", label: "Add anyone" },
                { id: "girls", label: "Girls" },
                { id: "boys", label: "Boys" },
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
              <p className="text-[11px] text-muted mt-2">Room full — remove someone to add more.</p>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
          {messages.length <= 1 && (
            <div className="text-center pb-2">
              <p className="text-muted text-xs">Everyone in the room replies — @ a name to talk to one person</p>
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
              <ChatMessage key={msg.id} message={msg} character={speaker} />
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
          characterFirstName="everyone"
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}
