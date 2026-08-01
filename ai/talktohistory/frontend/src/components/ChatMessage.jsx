import { useState } from "react";
import { speakText, stopSpeaking } from "../services/api";
import { playReactSound } from "../utils/sounds";

const REACTIONS = ["❤️", "🔥", "😂", "😍", "👏", "✨"];

export function CharacterAvatar({ character, size = "md" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-sm" : "w-9 h-9 text-base";

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${character?.color || "from-primary to-secondary"} flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20`}>
      <span className="text-xs">{character?.emoji || "💘"}</span>
    </div>
  );
}

export default function ChatMessage({ message, character, onReact }) {
  const isUser = message.role === "user";
  const [speaking, setSpeaking] = useState(false);
  const [reaction, setReaction] = useState(message.reaction || null);
  const [showReact, setShowReact] = useState(false);

  const handleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakText(message.content, () => setSpeaking(false), character?.gender || "male");
    }
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
          className={`group px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "chat-bubble-user text-white rounded-br-sm"
              : "chat-bubble-ai text-dark rounded-bl-sm"
          }`}
        >
          {!isUser && (
            <p className="text-primary text-xs font-semibold mb-1">{character?.name}</p>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>
          <div className="flex items-center justify-between mt-1.5 gap-3">
            <p className={`text-xs ${isUser ? "text-white/70" : "text-muted/70"}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isUser && (
                <button
                  onClick={handleSpeak}
                  title={speaking ? "Stop" : "Listen"}
                  className="text-muted/50 hover:text-primary text-xs"
                >
                  {speaking ? "🔇" : "🔊"}
                </button>
              )}
              <button
                onClick={() => setShowReact((v) => !v)}
                title="React"
                className={`text-xs ${isUser ? "text-white/70 hover:text-white" : "text-muted/50 hover:text-primary"}`}
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
          <div className={`absolute z-10 top-full mt-2 ${isUser ? "right-0" : "left-0"} flex gap-1 bg-white border border-primary/15 rounded-full px-2 py-1.5 shadow-lg`}>
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
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs flex-shrink-0 ring-2 ring-primary/20">
          👤
        </div>
      )}
    </div>
  );
}
