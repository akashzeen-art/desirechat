import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { isFavorite, toggleFavorite } from "../data/favorites";
import { hasChat } from "../data/chatHistory";

const VIBE_COLORS = {
  sweet: "bg-rose-100 text-rose-600",
  bold: "bg-orange-100 text-orange-600",
  funny: "bg-violet-100 text-violet-600",
};

let activePreviewStop = null;

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

import { useI18n } from "../i18n/LanguageContext";

export default function CharacterCard({ character }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const videoRef = useRef(null);
  const [fav, setFav] = useState(() => isFavorite(character.id));
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [canContinue, setCanContinue] = useState(() => hasChat(character.id));
  const vibeKey = (character.vibeId || character.vibe || "").toLowerCase();
  const hasVideo = Boolean(character.video);
  const touch = isTouchDevice();
  const showPlayBtn = hasVideo && !playing && (hovered || touch);

  const stopPreview = () => {
    const el = videoRef.current;
    if (el) {
      el.pause();
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    setPlaying(false);
    setLoading(false);
  };

  const stopPreviewRef = useRef(stopPreview);
  stopPreviewRef.current = stopPreview;

  const onFav = (e) => {
    e.stopPropagation();
    const next = toggleFavorite(character.id);
    setFav(next.includes(character.id));
  };

  const onPlayClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const el = videoRef.current;
    if (!el || !hasVideo || loading) return;

    if (activePreviewStop && activePreviewStop !== stopPreviewRef.current) {
      activePreviewStop();
    }
    activePreviewStop = () => stopPreviewRef.current();

    setLoading(true);
    el.playsInline = true;

    try {
      el.muted = false;
      el.volume = 1;
      await el.play();
    } catch {
      try {
        el.muted = true;
        await el.play();
        el.muted = false;
        el.volume = 1;
      } catch {
        setLoading(false);
        return;
      }
    }
  };

  const goToChat = (e) => {
    e?.stopPropagation?.();
    stopPreview();
    if (activePreviewStop === stopPreviewRef.current) activePreviewStop = null;
    navigate(`/chat/${character.id}`);
  };

  const onEnter = () => setHovered(true);

  const onLeave = () => {
    setHovered(false);
    stopPreview();
    if (activePreviewStop === stopPreviewRef.current) activePreviewStop = null;
  };

  const onCardClick = () => goToChat();

  useEffect(() => {
    setCanContinue(hasChat(character.id));
  }, [character.id]);

  useEffect(() => {
    return () => {
      stopPreview();
      if (activePreviewStop === stopPreviewRef.current) activePreviewStop = null;
    };
  }, []);

  return (
    <div
      className="group char-card rounded-3xl overflow-hidden cursor-pointer animate-fade-in flex flex-col"
      onClick={onCardClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className={`relative h-44 sm:h-48 bg-gradient-to-br ${character.color} overflow-hidden flex-shrink-0`}>
        {/* Photo — visible until video actually plays */}
        {character.image && !playing && (
          <img
            src={character.image}
            alt={character.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-top z-[1] transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
        )}

        {!character.image && !playing && (
          <span className="absolute inset-0 z-[1] flex items-center justify-center text-6xl select-none group-hover:scale-110 transition-transform duration-300">
            {character.emoji}
          </span>
        )}

        {/* Video — poster = same photo so never black */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={character.video}
            poster={character.image || undefined}
            preload="none"
            playsInline
            webkit-playsinline="true"
            loop
            className={`absolute inset-0 w-full h-full object-cover object-top z-[2] bg-transparent ${
              playing ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onPlaying={() => {
              setPlaying(true);
              setLoading(false);
            }}
            onPause={() => {
              setPlaying(false);
              setLoading(false);
            }}
            onError={() => {
              setPlaying(false);
              setLoading(false);
            }}
            aria-label={`${character.name} preview`}
          />
        )}

        {/* Play button on hover / tap — only the circle captures clicks */}
        {showPlayBtn && (
          <div
            className={`absolute inset-0 z-[4] flex items-center justify-center pointer-events-none ${
              touch ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } transition-opacity duration-200`}
          >
            <button
              type="button"
              onClick={onPlayClick}
              className="pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 text-primary flex items-center justify-center text-lg sm:text-xl shadow-lg ring-2 ring-primary/20 hover:scale-110 active:scale-95 transition-transform"
              aria-label={`Play ${character.name} preview`}
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              ) : (
                "▶"
              )}
            </button>
          </div>
        )}

        {/* Chat CTA — always clickable, even while video plays */}
        <button
          type="button"
          onClick={goToChat}
          className={`absolute bottom-14 inset-x-0 z-[5] flex justify-center transition-opacity duration-300 ${
            playing || hovered || touch ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <span className="bg-white/95 text-primary font-bold text-xs sm:text-sm px-4 py-1.5 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform">
            {canContinue ? t("common.continue") : t("common.chatNow")}
          </span>
        </button>

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-dark/60 to-transparent pointer-events-none z-[3]" />

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
            {t("common.continueLabel")}
          </span>
        )}

        <div className="absolute bottom-0 inset-x-0 px-3.5 pb-3 z-[6] pointer-events-none">
          <p className="font-display font-bold text-white text-base leading-tight drop-shadow-sm">{character.name}</p>
          <p className="text-white/80 text-xs">{character.tagline}</p>
        </div>
      </div>

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
