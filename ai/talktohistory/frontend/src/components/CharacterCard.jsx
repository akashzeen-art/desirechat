import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { isFavorite, toggleFavorite } from "../data/favorites";
import { hasChat } from "../data/chatHistory";
import { unlockAudioPlayback } from "../services/api";
import { useI18n } from "../i18n/LanguageContext";

const VIBE_COLORS = {
  sweet: "bg-rose-100 text-rose-600",
  bold: "bg-orange-100 text-orange-600",
  funny: "bg-violet-100 text-violet-600",
};

let activePreviewStop = null;

/** Phone / tablet / narrow layout — tap card should play with sound */
function usePhoneLayout() {
  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px), (hover: none), (pointer: coarse)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px), (hover: none), (pointer: coarse)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return phone;
}

export default function CharacterCard({ character }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const videoRef = useRef(null);
  const playingRef = useRef(false);
  const loadingRef = useRef(false);
  const [fav, setFav] = useState(() => isFavorite(character.id));
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [canContinue, setCanContinue] = useState(() => hasChat(character.id));
  const phone = usePhoneLayout();
  const vibeKey = (character.vibeId || character.vibe || "").toLowerCase();
  const hasVideo = Boolean(character.video);

  const stopPreview = () => {
    const el = videoRef.current;
    if (el) {
      el.pause();
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
      el.muted = false;
    }
    playingRef.current = false;
    loadingRef.current = false;
    setPlaying(false);
  };

  const stopPreviewRef = useRef(stopPreview);
  stopPreviewRef.current = stopPreview;

  const onFav = (e) => {
    e.stopPropagation();
    const next = toggleFavorite(character.id);
    setFav(next.includes(character.id));
  };

  const startPreview = async () => {
    const el = videoRef.current;
    if (!el || !hasVideo || loadingRef.current || playingRef.current) return;

    if (activePreviewStop && activePreviewStop !== stopPreviewRef.current) {
      activePreviewStop();
    }
    activePreviewStop = () => stopPreviewRef.current();

    unlockAudioPlayback();
    loadingRef.current = true;

    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    el.removeAttribute("muted");
    el.muted = false;
    el.defaultMuted = false;
    el.volume = 1;

    // Must play with sound inside the same tap/click gesture.
    try {
      await el.play();
      return;
    } catch {
      /* some browsers need load then play */
    }

    try {
      el.load();
      el.muted = false;
      el.defaultMuted = false;
      el.volume = 1;
      await el.play();
    } catch {
      // Last resort: start muted then unmute in same turn
      try {
        el.muted = true;
        await el.play();
        el.muted = false;
        el.volume = 1;
      } catch {
        loadingRef.current = false;
      }
    }
  };

  const onPlayMedia = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (playingRef.current) return;
    await startPreview();
  };

  const goToChat = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    stopPreview();
    if (activePreviewStop === stopPreviewRef.current) activePreviewStop = null;
    navigate(`/chat/${character.id}`);
  };

  const onEnter = () => {
    setHovered(true);
    if (hasVideo) startPreview();
  };

  const onLeave = () => {
    setHovered(false);
    // Keep playing on phone after tap; stop when mouse leaves on desktop
    if (!phone) {
      stopPreview();
      if (activePreviewStop === stopPreviewRef.current) activePreviewStop = null;
    }
  };

  /** Hover or click/tap card → play with sound. Chat only via Chat now button. */
  const onCardClick = (e) => {
    if (!hasVideo) {
      goToChat(e);
      return;
    }
    onPlayMedia(e);
  };

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

        {hasVideo && (
          <video
            ref={videoRef}
            src={character.video}
            poster={character.image || undefined}
            preload="auto"
            playsInline
            webkit-playsinline="true"
            loop
            className={`absolute inset-0 w-full h-full object-cover object-top z-[2] bg-transparent ${
              playing ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onPlaying={() => {
              playingRef.current = true;
              loadingRef.current = false;
              setPlaying(true);
              const el = videoRef.current;
              if (el) {
                el.muted = false;
                el.defaultMuted = false;
                el.volume = 1;
              }
            }}
            onError={() => {
              playingRef.current = false;
              loadingRef.current = false;
              setPlaying(false);
            }}
            aria-label={`${character.name} preview`}
          />
        )}

        {/* Chat only via this button on phone (so card tap can speak) */}
        <button
          type="button"
          onClick={goToChat}
          className={`absolute bottom-14 inset-x-0 z-[5] flex justify-center transition-opacity duration-300 ${
            playing || hovered || phone ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <span className="bg-white/95 text-primary font-bold text-xs sm:text-sm px-4 py-1.5 rounded-2xl shadow-lg active:scale-95 transition-transform">
            {canContinue ? t("common.continue") : t("common.chatNow")}
          </span>
        </button>

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-dark/60 to-transparent pointer-events-none z-[3]" />

        <button
          type="button"
          onClick={onFav}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-base flex items-center justify-center shadow-sm active:scale-95 transition-transform z-10"
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
