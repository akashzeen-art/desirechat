import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCharactersByGender, getCharacterById } from "../data/characters";
import { getPreferGender, getUserGender, setUserGender } from "../data/session";
import { MOODS, getMood, setMood, characterMatchesMood } from "../data/moods";
import { getFavorites } from "../data/favorites";
import { getUserProfile, isProfileReady } from "../data/userProfile";
import CharacterCard from "../components/CharacterCard";

export default function PickPage() {
  const navigate = useNavigate();
  const profile = getUserProfile();
  const prefer = getPreferGender();
  const userGender = profile.gender || getUserGender();
  const [mood, setMoodState] = useState(() => getMood());
  const [favIds, setFavIds] = useState(() => getFavorites());
  const [showFavOnly, setShowFavOnly] = useState(false);

  useEffect(() => {
    if (!isProfileReady()) {
      navigate("/profile?setup=1&next=/prefer", { replace: true });
      return;
    }
    if (profile.gender && !getUserGender()) setUserGender(profile.gender);
    if (!prefer) navigate("/prefer", { replace: true });
  }, [prefer, navigate, profile.gender]);

  useEffect(() => {
    const sync = () => setFavIds(getFavorites());
    window.addEventListener("storage", sync);
    const id = setInterval(sync, 800);
    return () => {
      window.removeEventListener("storage", sync);
      clearInterval(id);
    };
  }, []);

  const all = useMemo(
    () => (prefer ? getCharactersByGender(prefer) : []),
    [prefer]
  );

  const list = useMemo(() => {
    const REGION_ORDER = ["african", "asian", "chinese", "european"];
    let items = all.filter((c) => characterMatchesMood(c.id, mood));
    if (showFavOnly) items = items.filter((c) => favIds.includes(c.id));
    items = [...items].sort(
      (a, b) => REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region)
    );
    return items;
  }, [all, mood, showFavOnly, favIds]);

  const favorites = useMemo(
    () =>
      favIds
        .map((id) => getCharacterById(id))
        .filter((c) => c && c.gender === prefer),
    [favIds, prefer]
  );

  if (!isProfileReady() || !prefer || !userGender) return null;

  const label = prefer === "female" ? "girl" : "boy";
  const title = prefer === "female" ? "Girls" : "Boys";

  const pickMood = (id) => {
    setMood(id);
    setMoodState(id);
  };

  return (
    <div className="min-h-screen hero-bg overflow-x-hidden">
      <section className="relative px-4 pt-[max(6rem,calc(env(safe-area-inset-top)+5rem))] pb-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="float-orb w-96 h-96 bg-secondary/30 -top-10 right-0 animate-pulse-slow" />
          <div className="float-orb w-72 h-72 bg-accent/20 bottom-20 left-0 animate-pulse-slow" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/prefer")}
            className="text-muted hover:text-primary text-sm mb-6 transition-colors"
          >
            ← Change preference
          </button>

          <div className="text-center mb-8">
            <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Step 3 · Pick your vibe
            </p>
            <h1 className="font-headline text-3xl sm:text-5xl font-extrabold text-dark mb-3">
              Choose a {label} to chat with
            </h1>
            <p className="text-muted text-base max-w-lg mx-auto">
              Pick Sweet, Bold, or Funny — then choose African, Asian, Chinese, or European.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => pickMood(m.id)}
                className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                  mood === m.id
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                    : "bg-white text-dark border-primary/15 hover:border-primary/40"
                }`}
                title={m.hint}
              >
                {m.emoji} {m.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowFavOnly((v) => !v)}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                showFavOnly
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-dark border-primary/15 hover:border-primary/40"
              }`}
            >
              ❤️ Favorites
            </button>
          </div>
          <p className="text-center text-muted text-xs mb-8">
            Mood: <span className="text-primary font-semibold capitalize">{mood}</span>
            {" · "}
            {list.length} {title.toLowerCase()}
          </p>

          {!showFavOnly && favorites.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display font-bold text-dark text-lg mb-3">Your favorites</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {favorites.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => navigate(`/chat/${c.id}`)}
                    className="flex-shrink-0 flex items-center gap-2 bg-white border border-primary/15 rounded-2xl px-3 py-2 hover:border-primary/40 transition-all"
                  >
                    <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-xl overflow-hidden`}>
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover object-top" draggable={false} />
                      ) : (
                        c.emoji
                      )}
                    </span>
                    <span className="font-display font-bold text-sm text-dark pr-1">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {list.length === 0 ? (
            <div className="text-center py-16 bg-white/60 border border-primary/10 rounded-3xl">
              <p className="font-display font-bold text-dark text-lg mb-2">No matches</p>
              <p className="text-muted text-sm mb-4">
                Try another mood{showFavOnly ? " or add favorites with ❤️" : ""}.
              </p>
              <button
                type="button"
                onClick={() => { setShowFavOnly(false); pickMood("sweet"); }}
                className="btn-glow text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {list.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
