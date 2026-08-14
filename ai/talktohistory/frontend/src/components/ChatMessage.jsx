import { useEffect, useState } from "react";
import { speakText, stopSpeaking } from "../services/api";
import { getCharacterVoiceOpts } from "../data/voiceTone";
import { playReactSound } from "../utils/sounds";
import { getUserProfile } from "../data/userProfile";
import { getActiveUserId } from "../data/accounts";
import { useI18n } from "../i18n/LanguageContext";
import { CHAT_LANGUAGES } from "../data/chatLanguage";

const REACTIONS = ["❤️", "🔥", "😂", "😍", "👏", "✨"];

function formatMessageTime(timestamp, lang) {
  const d = timestamp ? new Date(timestamp) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleTimeString(CHAT_LANGUAGES[lang]?.speech || "en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
}

function absoluteMediaUrl(src) {
  const raw = String(src || "");
  if (!raw) return "";
  if (raw.startsWith("data:") || raw.startsWith("blob:") || /^https?:/i.test(raw)) return raw;
  if (typeof window === "undefined") return raw;
  try {
    return new URL(raw, window.location.origin).href;
  } catch {
    return raw;
  }
}

function imageViewerSrcDoc(src) {
  const safe = absoluteMediaUrl(src)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>
html,body{margin:0;height:100%;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden}
img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;-webkit-user-drag:none;user-select:none}
</style></head><body><img src="${safe}" alt="Photo" draggable="false"/></body></html>`;
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

export default function ChatMessage({ message, character, onReact, myUserId }) {
  const { t, lang } = useI18n();
  const myId = myUserId || getActiveUserId();
  const isPeer = message.role === "user" && message.senderId && myId && message.senderId !== myId;
  const isUser = message.role === "user" && !isPeer;
  // Game announcements saved before role:system fix — render them as centered cards
  const isGameLine = message.role === "assistant" && /rolled a \d|need a 6|landed on|climbed|slid down|wins!|🎉|🪜|🐍/.test(message.content || "");
  const [speaking, setSpeaking] = useState(false);
  const [reaction, setReaction] = useState(message.reaction || null);
  const [showReact, setShowReact] = useState(false);
  const [imageOpen, setImageOpen] = useState(null);
  const profile = getUserProfile();
  const userAvatar = isUser ? profile.avatar : "";
  const userInitial = isUser ? (profile.nickname || profile.name || "?").charAt(0).toUpperCase() : "?";
  const peerName = message.senderName || t("chat.friend");
  const peerAvatar = message.senderAvatar || "";
  const peerInitial = peerName.charAt(0).toUpperCase();
  const photos = message.images?.length
    ? message.images
    : (message.image ? [message.image] : []);

  useEffect(() => {
    if (!imageOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setImageOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageOpen]);

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
        getCharacterVoiceOpts(character, lang)
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

  const time = formatMessageTime(message.timestamp, lang);

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
      {!isUser && !isPeer && <CharacterAvatar character={character} />}
      {isPeer && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold flex-shrink-0 ring-2 ring-white shadow-sm overflow-hidden text-white">
          {peerAvatar
            ? <img src={peerAvatar} alt="" className="w-full h-full object-cover" draggable={false} />
            : peerInitial}
        </div>
      )}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold flex-shrink-0 ring-2 ring-white shadow-sm overflow-hidden text-white">
          {userAvatar
            ? <img src={userAvatar} alt="" className="w-full h-full object-cover" draggable={false} />
            : userInitial}
        </div>
      )}

      {/* Bubble */}
      <div className={`relative ${photos.length ? "w-[min(78%,240px)] max-w-[78%]" : "max-w-[78%]"}`}>
        {isPeer && (
          <p className="text-[10px] font-semibold text-muted mb-1 ml-1">{peerName}</p>
        )}
        <div
          role={!isUser && !isPeer && message.content ? "button" : undefined}
          tabIndex={!isUser && !isPeer && message.content ? 0 : undefined}
          onClick={!isUser && !isPeer && message.content ? handleSpeak : undefined}
          onKeyDown={!isUser && !isPeer && message.content ? (e) => { if (e.key === "Enter" || e.key === " ") handleSpeak(e); } : undefined}
          title={!isUser && !isPeer && message.content ? (speaking ? t("chatMessage.listen") : t("chatMessage.tapListen")) : undefined}
          className={`overflow-hidden rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? "chat-bubble-user text-white rounded-br-sm"
              : isPeer
                ? "bg-violet-50 text-dark border border-violet-100 rounded-bl-sm"
                : "chat-bubble-ai text-dark rounded-bl-sm cursor-pointer hover:shadow-md transition-shadow"
          } ${photos.length ? "p-0" : "px-4 py-3"}`}
        >
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setImageOpen(src);
              }}
              className="block w-full p-0 m-0 border-0 bg-transparent text-left leading-none appearance-none"
            >
              <img
                src={src}
                alt={isUser ? t("chatMessage.yourPhoto") : t("chatMessage.sharedBy", { name: character?.name || t("chatMessage.shared") })}
                className="block w-full h-auto object-cover object-top align-top"
                draggable={false}
              />
            </button>
          ))}

          <div className={photos.length ? "px-3.5 pt-2.5 pb-3" : ""}>
              {message.content && (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )}

              <div className={`flex items-center justify-between mt-2 gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                <span className={`text-[10px] ${isUser ? "text-white/60" : "text-muted/60"}`}>{time}</span>
                <div className="flex items-center gap-1">
                  {!isUser && !isPeer && message.content && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSpeak(e); }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-colors ${
                        speaking ? "bg-primary/15 text-primary" : "text-muted/60 hover:text-primary hover:bg-primary/8"
                      }`}
                      title={speaking ? t("common.stop") : t("chatMessage.listen")}
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

      {imageOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={(e) => {
            e.stopPropagation();
            setImageOpen(null);
          }}
        >
          <div
            className="relative w-full max-w-lg aspect-[3/4] max-h-[85vh] rounded-2xl overflow-hidden bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setImageOpen(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/55 text-white text-lg leading-none flex items-center justify-center hover:bg-black/75"
              aria-label="Close"
            >
              ×
            </button>
            <iframe
              title={isUser ? t("chatMessage.yourPhoto") : t("chatMessage.sharedBy", { name: character?.name || t("chatMessage.shared") })}
              srcDoc={imageViewerSrcDoc(imageOpen)}
              className="w-full h-full border-0 bg-black"
              sandbox=""
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
