import { useState } from "react";
import { speakText, stopSpeaking } from "../services/api";
import { playReactSound } from "../utils/sounds";
import { getUserProfile } from "../data/userProfile";

const REACTIONS = ["❤️", "🔥", "😂", "😍", "👏", "✨"];

function formatMessageTime(timestamp) {
  const d = timestamp ? new Date(timestamp) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
}

export function CharacterAvatar({ character, size = "md" }) {
  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  const photo = character?.avatar || character?.image;
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${character?.color || "from-primary to-secondary"} flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm overflow-hidden`}>
      {photo ? (
        <img src={photo} alt={character?.name || "Avatar"} className="w-full h-full object-cover object-top" draggable={false} />
      ) : (
        <span>{character?.emoji || "💘"}</span>
      )}
    </div>
  );
}

export default function ChatMessage({ message, character, onReact }) {
  const isUser = message.role === "user";
  // Game announcements saved before role:system fix — render them as centered cards
  const isGameLine = message.role === "assistant" && /rolled a \d|need a 6|landed on|climbed|slid down|wins!|🎉|🪜|🐍/.test(message.content || "");
  const [speaking, setSpeaking] = useState(false);
  const [reaction, setReaction] = useState(message.reaction || null);
  const [showReact, setShowReact] = useState(false);
  const profile = getUserProfile();
  const userAvatar = isUser ? profile.avatar : "";
  const userInitial = isUser ? (profile.nickname || profile.name || "?").charAt(0).toUpperCase() : "?";

  const handleSpeak = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    if (!message.content?.trim()) return;
    stopSpeaking();
    setSpeaking(true);
    window.setTimeout(() => {
      const started = speakText(
        message.content,
        () => setSpeaking(false),
        { gender: character?.gender || "female", region: character?.region || "european", vibe: character?.vibeId || "sweet" }
      );
      if (!started) setSpeaking(false);
    }, 50);
  };

  const pickReaction = (emoji) => {
    setReaction(emoji);
    setShowReact(false);
    playReactSound();
    onReact?.(message.id, emoji);
  };

  const time = formatMessageTime(message.timestamp);

  if (isGameLine) {
    const isUserLine = /^You\b/.test(message.content || "");
    return (
      <div className={`flex items-end gap-2 animate-slide-up ${isUserLine ? "flex-row-reverse" : "flex-row"}`}>
        {!isUserLine && <CharacterAvatar character={character} />}
        {isUserLine && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold flex-shrink-0 ring-2 ring-white shadow-sm overflow-hidden text-white">
            {profile.avatar
              ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" draggable={false} />
              : userInitial}
          </div>
        )}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[78%] ${
          isUserLine
            ? "chat-bubble-user text-white rounded-br-sm"
            : "chat-bubble-ai text-dark rounded-bl-sm"
        }`}>
          <p>🎲 {message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 animate-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      {!isUser && <CharacterAvatar character={character} />}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold flex-shrink-0 ring-2 ring-white shadow-sm overflow-hidden text-white">
          {userAvatar
            ? <img src={userAvatar} alt="" className="w-full h-full object-cover" draggable={false} />
            : userInitial}
        </div>
      )}

      {/* Bubble */}
      <div className="relative max-w-[78%]">
        <div
          role={!isUser && message.content ? "button" : undefined}
          tabIndex={!isUser && message.content ? 0 : undefined}
          onClick={!isUser && message.content ? handleSpeak : undefined}
          onKeyDown={!isUser && message.content ? (e) => { if (e.key === "Enter" || e.key === " ") handleSpeak(e); } : undefined}
          title={!isUser && message.content ? (speaking ? "Stop" : "Tap to listen") : undefined}
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? "chat-bubble-user text-white rounded-br-sm"
              : "chat-bubble-ai text-dark rounded-bl-sm cursor-pointer hover:shadow-md transition-shadow"
          }`}
        >
          {/* Image */}
          {message.image && (
            <a
              href={message.image}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`block mb-2 rounded-xl overflow-hidden max-w-[200px] ${isUser ? "border border-white/20" : "border border-primary/10"}`}
            >
              <img
                src={message.image}
                alt={isUser ? "Your photo" : `${character?.name} shared`}
                className="w-full h-auto object-cover object-top max-h-64"
                draggable={false}
              />
            </a>
          )}

          {/* Text */}
          {message.content && (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Footer row */}
          <div className={`flex items-center justify-between mt-2 gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
            <span className={`text-[10px] ${isUser ? "text-white/60" : "text-muted/60"}`}>{time}</span>
            <div className="flex items-center gap-1">
              {!isUser && message.content && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleSpeak(e); }}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-colors ${
                    speaking ? "bg-primary/15 text-primary" : "text-muted/60 hover:text-primary hover:bg-primary/8"
                  }`}
                  title={speaking ? "Stop" : "Listen"}
                >
                  {speaking ? "🔇" : "🔊"}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowReact((v) => !v); }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-colors ${
                  isUser ? "text-white/60 hover:text-white hover:bg-white/10" : "text-muted/60 hover:text-primary hover:bg-primary/8"
                }`}
                title="React"
              >
                {reaction || "😊"}
              </button>
            </div>
          </div>
        </div>

        {/* Reaction badge */}
        {reaction && (
          <span className={`absolute -bottom-2 ${isUser ? "left-2" : "right-2"} text-sm bg-white border border-primary/15 rounded-full px-1.5 py-0.5 shadow-sm leading-none`}>
            {reaction}
          </span>
        )}

        {/* Reaction picker */}
        {showReact && (
          <div
            className={`absolute z-20 top-full mt-2 ${isUser ? "right-0" : "left-0"} flex gap-1 bg-white border border-dark/8 rounded-2xl px-2.5 py-2 shadow-xl animate-slide-up`}
            onClick={(e) => e.stopPropagation()}
          >
            {REACTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => pickReaction(e)}
                className="text-lg hover:scale-125 active:scale-95 transition-transform px-0.5"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
