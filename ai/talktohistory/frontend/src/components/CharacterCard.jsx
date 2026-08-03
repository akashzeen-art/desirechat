import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { isFavorite, toggleFavorite } from "../data/favorites";
import { CHARACTER_MOODS } from "../data/moods";

export default function CharacterCard({ character }) {
  const navigate = useNavigate();
  const [fav, setFav] = useState(() => isFavorite(character.id));
  const moods = CHARACTER_MOODS[character.id] || [];

  const onFav = (e) => {
    e.stopPropagation();
    const next = toggleFavorite(character.id);
    setFav(next.includes(character.id));
  };

  return (
    <div
      className="group char-card rounded-2xl overflow-hidden cursor-pointer animate-fade-in"
      onClick={() => navigate(`/chat/${character.id}`)}
    >
      <div className={`relative h-48 sm:h-52 bg-gradient-to-br ${character.color} flex items-center justify-center overflow-hidden`}>
        {character.image ? (
          <img
            src={character.image}
            alt={character.name}
            className="absolute inset-0 w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
            draggable={false}
          />
        ) : (
          <span className="text-6xl select-none drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">
            {character.emoji}
          </span>
        )}
        <button
          type="button"
          onClick={onFav}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 text-lg flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
          title={fav ? "Unfavorite" : "Favorite"}
        >
          {fav ? "❤️" : "🤍"}
        </button>
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-dark text-xs font-semibold px-2.5 py-1 rounded-full z-10">
          {character.vibe}
        </div>
        <div className="absolute inset-0 bg-dark/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-[5]">
          <span className="text-white font-semibold text-sm bg-primary px-4 py-2 rounded-full transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            Flirt Now →
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-dark font-bold text-base leading-tight">{character.name}</h3>
        <p className="text-primary text-xs font-semibold mt-0.5">{character.tagline}</p>
        {moods.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {moods.map((m) => (
              <span key={m} className="text-[10px] uppercase tracking-wide bg-primary/8 text-primary px-2 py-0.5 rounded-md font-semibold">
                {m}
              </span>
            ))}
          </div>
        )}
        <p className="text-muted text-xs mt-2 leading-relaxed line-clamp-2">{character.description}</p>
        <button className="mt-3 w-full py-2 rounded-xl text-xs font-semibold bg-primary/5 hover:bg-primary/15 border border-primary/15 hover:border-primary/40 text-primary transition-all duration-200">
          Start flirting
        </button>
      </div>
    </div>
  );
}
