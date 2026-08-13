import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { characters } from "../data/characters";
import { ROOM_THEMES, createRoom } from "../data/chatRooms";
import { isProfileReady } from "../data/userProfile";
import BrandLogo from "../components/BrandLogo";
import { unlockAudioPlayback } from "../services/api";

export default function ChatRoomCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [themeId, setThemeId] = useState(ROOM_THEMES[0].id);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("all"); // all | girls | boys
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isProfileReady()) {
      navigate("/profile?setup=1&next=/rooms/new", { replace: true });
    }
  }, [navigate]);

  const list = useMemo(() => {
    if (filter === "girls") return characters.filter((c) => c.gender === "female");
    if (filter === "boys") return characters.filter((c) => c.gender === "male");
    return characters;
  }, [filter]);

  if (!isProfileReady()) return null;
  const toggle = (id) => {
    setError("");
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) {
        setError("You can add up to 6 companions.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const create = () => {
    try {
      setError("");
      const room = createRoom({
        name: name.trim() || "Flirty Lounge",
        themeId,
        memberIds: selected,
      });
      unlockAudioPlayback();
      navigate(`/rooms/${room.id}`, { replace: true });
    } catch (err) {
      setError(err.message || "Could not create room.");
    }
  };

  const theme = ROOM_THEMES.find((t) => t.id === themeId) || ROOM_THEMES[0];

  return (
    <div className={`min-h-screen ${theme.bgClass} pt-[max(5rem,calc(env(safe-area-inset-top)+4rem))] pb-28`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/rooms" className="text-sm text-muted hover:text-primary">
            ← Rooms
          </Link>
          <BrandLogo className="text-lg" />
          <span className="w-14" />
        </div>

        <div className="text-center mb-8">
          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            New lounge
          </p>
          <h1 className="font-headline text-3xl font-extrabold text-dark mb-2">
            Create a chat room
          </h1>
          <p className="text-muted text-sm">
            Choose a flirty vibe, then add the girls and boys you want in the room.
          </p>
        </div>

        <label className="block mb-6">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Room name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 40))}
            placeholder="e.g. Friday Flirts"
            className="mt-1.5 w-full rounded-2xl border border-dark/10 bg-white/80 px-4 py-3 text-dark outline-none focus:border-primary/40"
          />
        </label>

        <div className="mb-8">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Theme</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROOM_THEMES.map((t) => {
              const active = t.id === themeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  className={`text-left rounded-2xl p-4 border transition-all ${t.bgClass} ${
                    active
                      ? "border-primary ring-2 ring-primary/25 shadow-md"
                      : "border-dark/8 hover:border-primary/30"
                  }`}
                >
                  <p className="font-display font-bold text-dark">{t.name}</p>
                  <p className="text-muted text-xs mt-0.5">{t.tagline}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mr-2">
            Add companions ({selected.length}/6)
          </p>
          {[
            { id: "all", label: "All" },
            { id: "girls", label: "Girls" },
            { id: "boys", label: "Boys" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                filter === f.id
                  ? "bg-primary text-white border-primary"
                  : "bg-white/80 text-muted border-dark/10 hover:border-primary/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selected.map((id) => {
              const c = characters.find((x) => x.id === id);
              if (!c) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-primary/20 pl-1 pr-3 py-1 text-xs font-semibold text-dark"
                >
                  <span className="w-7 h-7 rounded-full overflow-hidden">
                    <img src={c.image} alt="" className="w-full h-full object-cover object-top" draggable={false} />
                  </span>
                  {c.name} ×
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {list.map((c) => {
            const on = selected.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                className={`rounded-2xl overflow-hidden border text-left transition-all ${
                  on
                    ? "border-primary ring-2 ring-primary/30 shadow-md"
                    : "border-dark/8 bg-white/70 hover:border-primary/35"
                }`}
              >
                <div className="aspect-[3/4] bg-surface overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover object-top"
                    draggable={false}
                  />
                </div>
                <div className="p-2.5">
                  <p className="font-display font-bold text-sm text-dark truncate">{c.name}</p>
                  <p className="text-[11px] text-muted truncate">
                    {c.gender === "female" ? "Girl" : "Boy"} · {c.vibe}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-center text-primary text-sm mb-3">{error}</p>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-dark/8 bg-white/90 backdrop-blur-md px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <p className="text-xs text-muted flex-1">
            {selected.length < 2
              ? "Select at least 2 companions"
              : `${selected.length} ready · ${theme.name}`}
          </p>
          <button
            type="button"
            onClick={create}
            disabled={selected.length < 2}
            className="btn-glow text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-40"
          >
            Open room
          </button>
        </div>
      </div>
    </div>
  );
}
