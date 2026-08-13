import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { isFavorite, toggleFavorite } from "../data/favorites";
import { hasChat } from "../data/chatHistory";

const VIBE_COLORS = {
  sweet: "bg-rose-100 text-rose-600",
  bold: "bg-orange-100 text-orange-600",
  funny: "bg-violet-100 text-violet-600",
};

/** Only one preview video plays (with sound) at a time */
let activePreviewStop = null;

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

export default function CharacterCard({ character }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const stopRef = useRef(null);
  const playingRef = useRef(false);
  const touchStartedPreview = useRef(false);
  const [fav, setFav] = useState(() => isFavorite(character.id));
  const [playing, setPlaying] = useState(false);
  const [canContinue, setCanContinue] = useState(() => hasChat(character.id));
  const vibeKey = (character.vibeId || character.vibe || "").toLowerCase();
  const hasVideo = Boolean(character.video);

  const onFav = (e) => {
    e.stopPropagation();
    const next = toggleFavorite(character.id);
    setFav(next.includes(character.id));
  };

  const stopPreview = () => {
    playingRef.current = false;
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.muted = true;
    try {
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
  };

  stopRef.current = () => {
    setPlaying(false);
    stopPreview();
  };

  const startPreview = () => {
    if (!hasVideo) return;

    if (activePreviewStop && activePreviewStop !== stopRef.current) {
      activePreviewStop();
    }
    activePreviewStop = () => stopRef.current?.();

    playingRef.current = true;
    setPlaying(true);

    const el = videoRef.current;
    if (!el) return;

    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "true");
    el.muted = false;
    el.volume = 1;
    const playPromise = el.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        el.muted = true;
        el.play()
          .then(() => {
            el.muted = false;
            el.volume = 1;
          })
          .catch(() => {});
      });
    }
  };

  const onEnter = () => {
    if (isTouchDevice()) return;
    startPreview();
  };

  const onLeave = () => {
    if (isTouchDevice()) return;
    setPlaying(false);
    stopPreview();
    if (activePreviewStop) activePreviewStop = null;
  };

  const onTouchStart = () => {
    if (!hasVideo || !isTouchDevice()) return;
    if (playingRef.current) return;
    touchStartedPreview.current = true;
    startPreview();
  };

  const onCardClick = (e) => {
    if (hasVideo && isTouchDevice() && touchStartedPreview.current) {
      touchStartedPreview.current = false;
      e.preventDefault();
      return;
    }
    navigate(`/chat/${character.id}`);
  };

  useEffect(() => {
    setCanContinue(hasChat(character.id));
  }, [character.id]);

  useEffect(() => {
    return () => {
      stopPreview();
      if (activePreviewStop) activePreviewStop = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="group char-card rounded-3xl overflow-hidden cursor-pointer animate-fade-in flex flex-col"
      onClick={onCardClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onTouchStart}
    >
      {/* Media area */}
      <div className={`relative h-44 sm:h-48 bg-gradient-to-br ${character.color} overflow-hidden flex-shrink-0`}>
        {character.image ? (
          <img
            src={character.image}
            alt={character.name}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-500 ease-out ${
              playing && hasVideo ? "opacity-0 scale-105" : "opacity-100 group-hover:scale-105"
            }`}
            draggable={false}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-6xl select-none group-hover:scale-110 transition-transform duration-300">
            {character.emoji}
          </span>
        )}

        {hasVideo && (
          <video
            ref={videoRef}
            src={character.video}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-300 ${
              playing ? "opacity-100" : "opacity-0"
            }`}
            loop
            playsInline
            webkit-playsinline="true"
            preload="auto"
            aria-hidden
          />
        )}

        {/* Bottom gradient for name legibility */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-dark/60 to-transparent pointer-events-none z-[2]" />

        {/* Fav button */}
        <button
          type="button"
          onClick={onFav}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-base flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform z-10"
          title={fav ? "Unfavorite" : "Favorite"}
        >
          {fav ? "❤️" : "🤍"}
        </button>

        {canContinue && (
          <span className="absolute top-3 right-3 z-10 text-[10px] font-bold uppercase tracking-wide bg-white/95 text-primary px-2.5 py-1 rounded-full shadow-sm">
            Continue
          </span>
        )}

        {/* Light CTA — keep face / video visible */}
        <div
          className={`absolute bottom-14 inset-x-0 pointer-events-none flex justify-center z-[5] transition-opacity duration-300 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="bg-white/95 text-primary font-bold text-xs sm:text-sm px-4 py-1.5 rounded-2xl shadow-lg">
            {canContinue ? "Continue →" : "Chat now →"}
          </span>
        </div>

        {/* Name on image */}
        <div className="absolute bottom-0 inset-x-0 px-3.5 pb-3 z-[6] pointer-events-none">
          <p className="font-display font-bold text-white text-base leading-tight drop-shadow-sm">{character.name}</p>
          <p className="text-white/80 text-xs">{character.tagline}</p>
        </div>
      </div>

      {/* Info strip */}
      <div className="px-3.5 py-3 flex flex-col gap-1" style={{ background: "rgba(255,240,247,0.95)" }}>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${VIBE_COLORS[vibeKey] || "bg-primary/10 text-primary"}`}>
            {character.vibe}
          </span>
          <span className="text-[10px] text-muted font-medium">{character.regionLabel}</span>
        </div>
        {character.oneliner && (
          <p className="text-[11px] text-dark/70 leading-snug italic">{character.oneliner}</p>
        )}
      </div>
    </div>
  );
}
