import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { isFavorite, toggleFavorite } from "../data/favorites";
import { hasChat } from "../data/chatHistory";
import { unlockAudioPlayback } from "../services/api";
import { setMood } from "../data/moods";
import { useI18n } from "../i18n/LanguageContext";
import { getCharacterPreviewVideo } from "../data/characters";
import { haltPreviewVideo, stopAllPreviewVideos, trackPreviewVideo } from "../utils/previewMedia";
import {
  canStartChat,
  getCompanionAction,
  resolveCompanionStatus,
} from "../data/companionStatus";

const VIBE_COLORS = {
  sweet: "bg-rose-100 text-rose-600",
  bold: "bg-orange-100 text-orange-600",
  funny: "bg-violet-100 text-violet-600",
};

const ACTION_TONE = {
  available: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25",
  busy: "bg-amber-100/95 text-amber-800 border border-amber-200/80",
  away: "bg-white/90 text-muted border border-dark/10",
  offline: "bg-dark/70 text-white/80",
};

const DOT_TONE = {
  available: "bg-emerald-400",
  busy: "bg-amber-400",
  away: "bg-slate-300",
  offline: "bg-dark/40",
};

let activePreviewStop = null;

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

export default function CharacterCard({ character, statusNow }) {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const videoRef = useRef(null);
  const playingRef = useRef(false);
  const [fav, setFav] = useState(() => isFavorite(character.id));
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [canContinue, setCanContinue] = useState(() => hasChat(character.id));
  const phone = usePhoneLayout();
  const vibeKey = (character.vibeId || character.vibe || "").toLowerCase();
  const videoSrc = getCharacterPreviewVideo(character, lang);
  const hasVideo = Boolean(videoSrc);

  const now = statusNow ?? Date.now();
  const status = resolveCompanionStatus(character, now);
  const action = useMemo(
    () => getCompanionAction(character, { canContinue, now }),
    [character, canContinue, now]
  );
  const chatEnabled = action.enabled && canStartChat(character, now);
  const isUnavailable = !chatEnabled;

  const stopPreview = () => {
    haltPreviewVideo(videoRef.current);
    if (activePreviewStop === stopPreviewRef.current) activePreviewStop = null;
    playingRef.current = false;
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
    if (!el || !hasVideo || playingRef.current) return;

    if (activePreviewStop && activePreviewStop !== stopPreviewRef.current) {
      activePreviewStop();
    }
    activePreviewStop = stopPreviewRef.current;
    trackPreviewVideo(el);
    unlockAudioPlayback();

    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    el.muted = false;
    el.defaultMuted = false;
    el.volume = 1;

    try {
      await el.play();
    } catch {
      try {
        el.muted = true;
        await el.play();
        el.muted = false;
        el.volume = 1;
      } catch {
        playingRef.current = false;
        setPlaying(false);
      }
    }
  };

  const goToChat = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (!chatEnabled) return;
    stopPreview();
    stopAllPreviewVideos();
    const vibe = character.vibeId || character.vibe;
    if (vibe) setMood(String(vibe).toLowerCase());
    navigate(`/chat/${character.id}`);
  };

  const onEnter = () => {
    setHovered(true);
    if (hasVideo && chatEnabled) startPreview();
  };

  const onLeave = () => {
    setHovered(false);
    if (!phone) stopPreview();
  };

  const onCardClick = (e) => {
    if (!chatEnabled) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    if (!hasVideo) {
      goToChat(e);
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    if (!playingRef.current) startPreview();
  };

  useEffect(() => {
    setCanContinue(hasChat(character.id));
  }, [character.id]);

  useEffect(() => {
    return () => {
      stopPreviewRef.current();
    };
  }, []);

  const prevSrcRef = useRef(videoSrc);
  useEffect(() => {
    if (prevSrcRef.current === videoSrc) return;
    prevSrcRef.current = videoSrc;
    stopPreview();
  }, [videoSrc]);

  return (
    <div
      className={`group char-card rounded-3xl overflow-hidden animate-fade-in flex flex-col ${
        chatEnabled ? "cursor-pointer" : "cursor-default"
      }`}
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
            className={`absolute inset-0 w-full h-full object-cover object-top z-[1] transition-all duration-500 group-hover:scale-105 ${
              isUnavailable ? "scale-[1.01] blur-[1px] brightness-95 saturate-90" : ""
            }`}
            draggable={false}
          />
        )}

        {!character.image && !playing && (
          <span
            className={`absolute inset-0 z-[1] flex items-center justify-center text-6xl select-none group-hover:scale-110 transition-transform duration-300 ${
              isUnavailable ? "blur-[1px] opacity-90" : ""
            }`}
          >
            {character.emoji}
          </span>
        )}

        {hasVideo && chatEnabled && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={character.image || undefined}
            preload="metadata"
            playsInline
            webkit-playsinline="true"
            loop
            controlsList="nodownload noplaybackrate noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            onContextMenu={(e) => e.preventDefault()}
            className={`preview-video absolute inset-0 w-full h-full object-cover object-top z-[2] bg-transparent ${
              playing ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onPlaying={() => {
              playingRef.current = true;
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
              setPlaying(false);
            }}
            aria-label={`${character.name} preview`}
          />
        )}

        {isUnavailable && (
          <div className="absolute inset-0 z-[3] bg-dark/15 pointer-events-none" />
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-dark/60 to-transparent pointer-events-none z-[4]" />

        <button
          type="button"
          onClick={onFav}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-base flex items-center justify-center shadow-sm active:scale-95 transition-transform z-10"
          title={fav ? "Unfavorite" : "Favorite"}
        >
          {fav ? "❤️" : "🤍"}
        </button>

        {canContinue && chatEnabled && (
          <span className="absolute top-3 right-3 z-10 text-[10px] font-bold uppercase tracking-wide bg-white/95 text-primary px-2.5 py-1 rounded-full shadow-sm">
            {t("common.continueLabel")}
          </span>
        )}

        {!canContinue && (
          <span
            className={`absolute top-3 right-3 z-10 w-2.5 h-2.5 rounded-full ring-2 ring-white/90 shadow-sm ${
              DOT_TONE[status] || DOT_TONE.away
            }`}
            title={t(action.labelKey)}
            aria-label={t(action.labelKey)}
          />
        )}

        {/* Busy / away status stays on the image */}
        {isUnavailable && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-[5] flex justify-center px-3 pointer-events-none">
            <span
              className={`font-bold text-[10px] sm:text-[11px] px-3 py-1.5 rounded-full shadow-md backdrop-blur-md ${
                ACTION_TONE[action.tone] || ACTION_TONE.away
              }`}
            >
              {t(action.labelKey)}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 px-3.5 pb-3 z-[6] pointer-events-none">
          <p className="font-display font-bold text-white text-base leading-tight drop-shadow-sm">{character.name}</p>
          <p className="text-white/80 text-xs">{character.tagline}</p>
        </div>
      </div>

      <div className="px-3.5 py-3 flex flex-col gap-1.5" style={{ background: "rgba(255,240,247,0.95)" }}>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${VIBE_COLORS[vibeKey] || "bg-primary/10 text-primary"}`}>
            {character.vibe}
          </span>
          <span className="text-[10px] text-muted font-medium truncate">{character.regionLabel}</span>
        </div>
        {character.oneliner && (
          <p className="text-[11px] text-dark/70 leading-snug italic">{character.oneliner}</p>
        )}
        {chatEnabled && (
          <button
            type="button"
            onClick={goToChat}
            className={`w-full text-center font-bold text-[11px] sm:text-xs px-3 py-1.5 rounded-xl transition-transform active:scale-[0.98] chat-now-blink ${ACTION_TONE.available}`}
          >
            {t(action.labelKey)}
          </button>
        )}
      </div>
    </div>
  );
}
