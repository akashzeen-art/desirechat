import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCharactersByGender, getCharacterById } from "../data/characters";
import { getPreferGender, getUserGender, setUserGender } from "../data/session";
import { MOODS, getMood, setMood, characterMatchesMood } from "../data/moods";
import { getFavorites } from "../data/favorites";
import { getUserProfile, isProfileReady, getDisplayName } from "../data/userProfile";
import CharacterCard from "../components/CharacterCard";

export default function PickPage() {
  const navigate   = useNavigate();
  const profile    = getUserProfile();
  const prefer     = getPreferGender();
  const userGender = profile.gender || getUserGender();
  const display    = getDisplayName(profile);

  const [mood, setMoodState]       = useState(() => getMood());
  const [favIds, setFavIds]        = useState(() => getFavorites());
  const [showFavOnly, setShowFavOnly] = useState(false);

  useEffect(() => {
    if (!isProfileReady()) { navigate("/profile?setup=1&next=/prefer", { replace: true }); return; }
    if (profile.gender && !getUserGender()) setUserGender(profile.gender);
    if (!prefer) navigate("/prefer", { replace: true });
  }, [prefer, navigate, profile.gender]);

  useEffect(() => {
    const sync = () => setFavIds(getFavorites());
    window.addEventListener("storage", sync);
    const id = setInterval(sync, 800);
    return () => { window.removeEventListener("storage", sync); clearInterval(id); };
  }, []);

  const all = useMemo(() => {
    const chars = prefer ? getCharactersByGender(prefer) : [];
    return [...chars].sort(() => Math.random() - 0.5);
  }, [prefer]);

  const list = useMemo(() => {
    let items = all.filter((c) => characterMatchesMood(c.id, mood));
    if (showFavOnly) items = items.filter((c) => favIds.includes(c.id));
    return items;
  }, [all, mood, showFavOnly, favIds]);

  const favorites = useMemo(() =>
    favIds.map((id) => getCharacterById(id)).filter((c) => c && c.gender === prefer),
    [favIds, prefer]
  );

  if (!isProfileReady() || !prefer || !userGender) return null;

  const label = prefer === "female" ? "girl" : "boy";
  const pickMood = (id) => { setMood(id); setMoodState(id); };
const currentMood = MOODS.find((m) => m.id === mood);

  return (
    <div className="min-h-screen hero-bg overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="float-orb w-96 h-96 bg-secondary/15 -top-10 right-0 animate-pulse-slow" />
        <div className="float-orb w-72 h-72 bg-accent/12 bottom-20 left-0 animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-[max(6rem,calc(env(safe-area-inset-top)+5rem))] pb-24">

        {/* Header row */}
        <div className="flex items-center gap-3 mb-10 flex-wrap">
          <button onClick={() => navigate("/prefer")}
            className="flex items-center gap-1.5 text-muted hover:text-primary text-sm transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Change preference
          </button>
          <div className="w-px h-4 bg-dark/15 shrink-0" />
          <div className="flex items-center gap-2 bg-white/70 border border-dark/8 rounded-full px-3 py-1 shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Step 3 · Pick your vibe</span>
          </div>
          <div className="w-px h-4 bg-dark/15 shrink-0" />
          <h1 className="font-headline text-base sm:text-lg font-extrabold text-dark shrink-0">
            Choose a {label}{display ? `, ${display}` : ""}
          </h1>
          <p className="text-muted text-sm hidden sm:block">
            Filter by mood, then pick whoever catches your eye.
          </p>
        </div>

        {/* ── Sticky filter bar ── */}
        <div className="sticky top-16 z-20 -mx-4 px-4 py-3 mb-8"
          style={{ background: "rgba(248,244,252,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(26,16,37,0.06)" }}>
          <div className="flex items-center gap-2 max-w-5xl mx-auto overflow-x-auto scrollbar-none">
            {MOODS.map((m) => (
              <button key={m.id} type="button" onClick={() => pickMood(m.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                  mood === m.id
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "bg-white text-dark border-dark/10 hover:border-primary/30"
                }`}>
                <span>{m.emoji}</span> {m.label}
              </button>
            ))}
            <button type="button" onClick={() => setShowFavOnly((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                showFavOnly ? "bg-primary text-white border-primary" : "bg-white text-dark border-dark/10 hover:border-primary/30"
              }`}>
              ❤️ Favorites
            </button>
            <span className="ml-auto text-xs text-muted font-medium hidden sm:block">
              {currentMood?.emoji} {currentMood?.label} · {list.length} {label}s
            </span>
          </div>
        </div>

        {/* Favorites strip */}
        {!showFavOnly && favorites.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display font-bold text-dark text-sm mb-3 flex items-center gap-2">
              <span>❤️</span> Your favorites
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {favorites.map((c) => (
                <button key={c.id} type="button" onClick={() => navigate(`/chat/${c.id}`)}
                  className="flex-shrink-0 flex items-center gap-2.5 bg-white border border-primary/15 rounded-2xl pl-2 pr-4 py-2 hover:border-primary/40 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary to-secondary">
                    {c.image
                      ? <img src={c.image} alt={c.name} className="w-full h-full object-cover object-top" draggable={false} />
                      : <span className="flex h-full items-center justify-center text-lg">{c.emoji}</span>}
                  </div>
                  <div className="text-left">
                    <p className="font-display font-bold text-dark text-sm leading-tight">{c.name}</p>
                    <p className="text-muted text-[10px]">{c.vibe}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {list.length === 0 ? (
          <div className="text-center py-20 bg-white/60 border border-primary/10 rounded-3xl">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-display font-bold text-dark text-lg mb-2">No matches</p>
            <p className="text-muted text-sm mb-6">
              Try another mood{showFavOnly ? " or add favorites with ❤️" : ""}.
            </p>
            <button type="button" onClick={() => { setShowFavOnly(false); pickMood("sweet"); }}
              className="btn-glow text-white text-sm font-semibold px-6 py-3 rounded-2xl">
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
