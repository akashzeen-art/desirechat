import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { isFavorite, toggleFavorite } from "../data/favorites";
import { hasChat } from "../data/chatHistory";

const VIBE_COLORS = {
  sweet: "bg-rose-100 text-rose-600",
  bold: "bg-orange-100 text-orange-600",
  funny: "bg-violet-100 text-violet-600",
};

export default function CharacterCard({ character }) {
  const navigate = useNavigate();
  const [fav, setFav] = useState(() => isFavorite(character.id));
  const canContinue = hasChat(character.id);
  const vibeKey = (character.vibeId || character.vibe || "").toLowerCase();

  const onFav = (e) => {
    e.stopPropagation();
    const next = toggleFavorite(character.id);
    setFav(next.includes(character.id));
  };

  return (
    <div
      className="group char-card rounded-3xl overflow-hidden cursor-pointer animate-fade-in flex flex-col"
      onClick={() => navigate(`/chat/${character.id}`)}
    >
      {/* Image area */}
      <div className={`relative h-44 sm:h-48 bg-gradient-to-br ${character.color} overflow-hidden flex-shrink-0`}>
        {character.image ? (
          <img
            src={character.image}
            alt={character.name}
            className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
            draggable={false}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-6xl select-none group-hover:scale-110 transition-transform duration-300">
            {character.emoji}
          </span>
        )}

        {/* Bottom gradient for name legibility */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-dark/60 to-transparent" />

        {/* Fav button */}
        <button
          type="button"
          onClick={onFav}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-base flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform z-10"
          title={fav ? "Unfavorite" : "Favorite"}
        >
          {fav ? "❤️" : "🤍"}
        </button>

        {/* Top-right badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
          {canContinue && (
            <span className="bg-secondary text-white text-[9px] font-bold px-2 py-0.5 rounded-lg tracking-widest uppercase">
              Active
            </span>
          )}
          <span className="bg-white/85 backdrop-blur-sm text-dark text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            {character.regionLabel}
          </span>
        </div>

        {/* Hover overlay CTA */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-[5]">
          <span className="bg-white text-primary font-bold text-sm px-5 py-2 rounded-2xl shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {canContinue ? "Continue →" : "Chat now →"}
          </span>
        </div>

        {/* Name on image */}
        <div className="absolute bottom-0 inset-x-0 px-3.5 pb-3 z-[6]">
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
