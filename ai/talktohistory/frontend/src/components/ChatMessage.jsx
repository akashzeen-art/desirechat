import { useState } from "react";
import { speakText, stopSpeaking } from "../services/api";
import { playReactSound } from "../utils/sounds";
import { getUserProfile } from "../data/userProfile";

const REACTIONS = ["❤️", "🔥", "😂", "😍", "👏", "✨"];

export function CharacterAvatar({ character, size = "md" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-sm" : "w-9 h-9 text-base";
  const photo = character?.avatar || character?.image;

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${character?.color || "from-primary to-secondary"} flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20 overflow-hidden`}>
      {photo ? (
        <img
          src={photo}
          alt={character?.name || "Avatar"}
          className="w-full h-full object-cover object-top"
          draggable={false}
        />
      ) : (
        <span className="text-xs">{character?.emoji || "💘"}</span>
      )}
    </div>
  );
}

export default function ChatMessage({ message, character, onReact }) {
  const isUser = message.role === "user";
  const [speaking, setSpeaking] = useState(false);
  const [reaction, setReaction] = useState(message.reaction || null);
  const [showReact, setShowReact] = useState(false);
  const profile = getUserProfile();
  const userAvatar = isUser ? profile.avatar : "";
  const userInitial = isUser
    ? (profile.nickname || profile.name || "?").charAt(0).toUpperCase()
    : "?";

  const handleSpeak = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    if (!message.content?.trim()) return;

    // Stop any other page speech first, then start this message
    stopSpeaking();
    setSpeaking(true);

    const voiceOpts = {
      gender: character?.gender || "female",
      region: character?.region || "european",
    };

    // Defer slightly so cancel() settles (Chrome quirk)
    window.setTimeout(() => {
      const started = speakText(
        message.content,
        () => setSpeaking(false),
        voiceOpts
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

  return (
    <div className={`flex items-end gap-2 animate-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && <CharacterAvatar character={character} />}

      <div className="relative max-w-[80%]">
        <div
          role={!isUser && message.content ? "button" : undefined}
          tabIndex={!isUser && message.content ? 0 : undefined}
          onClick={!isUser && message.content ? handleSpeak : undefined}
          onKeyDown={
            !isUser && message.content
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") handleSpeak(e);
                }
              : undefined
          }
          title={!isUser && message.content ? (speaking ? "Stop" : "Tap to listen") : undefined}
          className={`group px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "chat-bubble-user text-white rounded-br-sm"
              : "chat-bubble-ai text-dark rounded-bl-sm cursor-pointer hover:border-primary/25"
          }`}
        >
          {!isUser && (
            <p className="text-primary text-xs font-semibold mb-1">{character?.name}</p>
          )}
          {message.image && (
            <a
              href={message.image}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`block mb-2 rounded-xl overflow-hidden shadow-sm max-w-[220px] ${
                isUser ? "border border-white/25" : "border border-primary/10"
              }`}
            >
              <img
                src={message.image}
                alt={isUser ? "Your photo" : `${character?.name || "Companion"} shared photo`}
                className="w-full h-auto object-cover object-top max-h-72"
                draggable={false}
              />
            </a>
          )}
          {message.content && (
            <p className="whitespace-pre-wrap text-[1.05em] leading-relaxed">{message.content}</p>
          )}
          <div className="flex items-center justify-between mt-1.5 gap-3">
            <p className={`text-xs ${isUser ? "text-white/70" : "text-muted/70"}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <div className="flex items-center gap-1.5">
              {!isUser && message.content && (
                <button
                  type="button"
                  onClick={handleSpeak}
                  title={speaking ? "Stop" : "Listen"}
                  className={`min-w-[28px] h-7 px-1.5 rounded-lg text-sm flex items-center justify-center transition-colors ${
                    speaking
                      ? "bg-primary/15 text-primary"
                      : "text-muted hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  {speaking ? "🔇" : "🔊"}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReact((v) => !v);
                }}
                title="React"
                className={`min-w-[28px] h-7 px-1.5 rounded-lg text-sm flex items-center justify-center transition-colors ${
                  isUser
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-muted hover:text-primary hover:bg-primary/10"
                }`}
              >
                😊
              </button>
            </div>
          </div>
        </div>

        {reaction && (
          <span className={`absolute -bottom-2 ${isUser ? "left-2" : "right-2"} text-sm bg-white border border-primary/15 rounded-full px-1.5 shadow-sm`}>
            {reaction}
          </span>
        )}

        {showReact && (
          <div
            className={`absolute z-10 top-full mt-2 ${isUser ? "right-0" : "left-0"} flex gap-1 bg-white border border-primary/15 rounded-full px-2 py-1.5 shadow-lg`}
            onClick={(e) => e.stopPropagation()}
          >
            {REACTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => pickReaction(e)}
                className="text-base hover:scale-125 transition-transform px-0.5"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs flex-shrink-0 ring-2 ring-primary/20 overflow-hidden text-white font-semibold">
          {userAvatar ? (
            <img src={userAvatar} alt="" className="w-full h-full object-cover" draggable={false} />
          ) : (
            userInitial
          )}
        </div>
      )}
    </div>
  );
}
