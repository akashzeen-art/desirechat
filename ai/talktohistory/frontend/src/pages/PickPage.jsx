import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCharactersByGender, getCharacterById, getBotGirls } from "../data/characters";
import {
  countByStatus,
  getShuffledRoster,
  getStatusTick,
  canStartChat,
} from "../data/companionStatus";
import { getPreferGender, getUserGender, setUserGender } from "../data/session";
import { getFavorites } from "../data/favorites";
import { setMood } from "../data/moods";
import { getUserProfile, isProfileReady, getDisplayName } from "../data/userProfile";
import CharacterCard from "../components/CharacterCard";
import { useI18n } from "../i18n/LanguageContext";
import { localizeCharacter } from "../i18n/localeHelpers";

export default function PickPage() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const profile    = getUserProfile();
  const prefer     = getPreferGender();
  const userGender = profile.gender || getUserGender();
  const display    = getDisplayName(profile);

  const [favIds, setFavIds] = useState(() => getFavorites());
  const [tab, setTab] = useState("foryou"); // foryou | voices | favorites
  const [statusNow, setStatusNow] = useState(() => Date.now());

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

  // Refresh bot busy/away + roster shuffle on the ~5 min tick
  useEffect(() => {
    const syncTick = () => {
      const next = Date.now();
      setStatusNow((prev) => {
        if (getStatusTick(prev) === getStatusTick(next)) return prev;
        return next;
      });
    };
    const id = setInterval(syncTick, 30_000);
    syncTick();
    return () => clearInterval(id);
  }, []);

  // Voices = all real AI + filler bots
  const allVoice = useMemo(() => {
    const reals = prefer ? getCharactersByGender(prefer) : [];
    const bots = prefer === "female" ? getBotGirls() : [];
    return getShuffledRoster(reals, bots, statusNow);
  }, [prefer, statusNow]);

  // For you = language's 8 real AI + same filler bots (both tabs)
  const forYou = useMemo(() => {
    const reals = prefer ? getCharactersByGender(prefer, lang) : [];
    const bots = prefer === "female" ? getBotGirls() : [];
    return getShuffledRoster(reals, bots, statusNow);
  }, [prefer, lang, statusNow]);

  const favorites = useMemo(
    () =>
      favIds
        .map((id) => getCharacterById(id))
        .filter((c) => c && c.gender === prefer)
        .map((c) => ({
          ...c,
          kind: c.kind || (c.isBot ? "bot" : "real"),
          status: undefined,
        })),
    [favIds, prefer]
  );

  const list =
    tab === "favorites" ? favorites
      : tab === "voices" ? allVoice
        : forYou;

  const statusCounts = useMemo(
    () => countByStatus(tab === "voices" ? allVoice : list, statusNow),
    [tab, allVoice, list, statusNow]
  );

  if (!isProfileReady() || !prefer || !userGender) return null;

  const label = prefer === "female" ? t("common.girl") : t("common.boy");
  const nameSuffix = display ? `, ${display}` : "";

  return (
    <div className="min-h-screen hero-bg overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="float-orb w-96 h-96 bg-secondary/15 -top-10 right-0 animate-pulse-slow" />
        <div className="float-orb w-72 h-72 bg-accent/12 bottom-20 left-0 animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-[max(6rem,calc(env(safe-area-inset-top)+5rem))] pb-24">

        <div className="flex items-center gap-3 mb-10 flex-wrap">
          <button onClick={() => navigate("/prefer")}
            className="flex items-center gap-1.5 text-muted hover:text-primary text-sm transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("pick.changePref")}
          </button>
          <div className="w-px h-4 bg-dark/15 shrink-0" />
          <div className="flex items-center gap-2 bg-white/70 border border-dark/8 rounded-full px-3 py-1 shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{t("pick.step3")}</span>
          </div>
          <div className="w-px h-4 bg-dark/15 shrink-0" />
          <h1 className="font-headline text-base sm:text-lg font-extrabold text-dark shrink-0">
            {t("pick.choose", { label, name: nameSuffix })}
          </h1>
          <p className="text-muted text-sm hidden sm:block">{t("pick.mixedVibesSub")}</p>
        </div>

        <div className="sticky top-16 z-20 -mx-4 px-4 py-3 mb-8"
          style={{ background: "rgba(248,244,252,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(26,16,37,0.06)" }}>
          <div className="flex items-center gap-2 max-w-5xl mx-auto overflow-x-auto scrollbar-none">
            <button type="button" onClick={() => setTab("foryou")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                tab === "foryou"
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-white text-dark border-dark/10 hover:border-primary/30"
              }`}>
              🎙️ {t("pick.forYou")}
            </button>
            <button type="button" onClick={() => setTab("voices")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                tab === "voices"
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-white text-dark border-dark/10 hover:border-primary/30"
              }`}>
              ✨ {t("pick.allVoices")}
            </button>
            <button type="button" onClick={() => setTab("favorites")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                tab === "favorites" ? "bg-primary text-white border-primary" : "bg-white text-dark border-dark/10 hover:border-primary/30"
              }`}>
              ❤️ {t("pick.favorites")}
            </button>
            <div className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold shrink-0">
              <span className="px-2 py-1 rounded-full bg-green-500 text-white border border-green-600">
                {t("pick.chipFree", { count: statusCounts.available })}
              </span>
              <span className="px-2 py-1 rounded-full bg-red-500 text-white border border-red-600">
                {t("pick.chipBusy", { count: statusCounts.busy })}
              </span>
              <span className="px-2 py-1 rounded-full bg-yellow-400 text-yellow-950 border border-yellow-500">
                {t("pick.chipAway", { count: statusCounts.away })}
              </span>
            </div>
          </div>
        </div>

        {tab === "foryou" && favorites.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display font-bold text-dark text-sm mb-3 flex items-center gap-2">
              <span>❤️</span> {t("pick.yourFavorites")}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {favorites.filter((c) => canStartChat(c, statusNow)).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    if (c.vibeId) setMood(c.vibeId);
                    navigate(`/chat/${c.id}`);
                  }}
                  className="flex-shrink-0 flex items-center gap-2.5 bg-white border border-primary/15 rounded-2xl pl-2 pr-4 py-2 hover:border-primary/40 hover:shadow-sm transition-all"
                >
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

        {list.length === 0 ? (
          <div className="text-center py-20 bg-white/60 border border-primary/10 rounded-3xl">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-display font-bold text-dark text-lg mb-2">{t("pick.noMatches")}</p>
            <p className="text-muted text-sm mb-6">
              {t("pick.tryAnother", { extra: tab === "favorites" ? t("pick.favExtra") : "" })}
            </p>
            <button type="button" onClick={() => setTab("foryou")}
              className="btn-glow text-white text-sm font-semibold px-6 py-3 rounded-2xl">
              {t("pick.resetFilters")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {list.map((character) => (
              <CharacterCard
                key={character.id}
                character={localizeCharacter(character, lang, t)}
                statusNow={statusNow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
