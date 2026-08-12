import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { getUserProfile, setUserProfile, getDisplayName, isProfileReady } from "../data/userProfile";
import { getUserGender, setUserGender } from "../data/session";

async function fileToDataUrl(file, maxW = 480, quality = 0.72) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", quality);
}

const EMPTY_FORM = { name: "", nickname: "", place: "", gender: "", bio: "", avatar: "" };

function ProfileCompleteness({ form }) {
  const fields = [
    { key: "name", label: "Name" }, { key: "gender", label: "Gender" },
    { key: "nickname", label: "Nickname" }, { key: "place", label: "Location" },
    { key: "bio", label: "Bio" }, { key: "avatar", label: "Photo" },
  ];
  const filled = fields.filter((f) => Boolean(form[f.key])).length;
  const pct = Math.round((filled / fields.length) * 100);
  return (
    <div className="mb-6 rounded-2xl border border-primary/10 bg-white/60 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Profile strength</span>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-dark/8 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#FF6EB4,#E91E8C,#C2187A)" }} />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {fields.map((f) => (
          <span key={f.key} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            form[f.key] ? "bg-primary/10 text-primary" : "bg-dark/5 text-muted"
          }`}>
            {form[f.key] ? "✓" : "·"} {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Toast({ show, message = "Saved ✓" }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
    }`}>
      <div className="bg-dark text-white text-sm font-semibold px-5 py-2.5 rounded-2xl shadow-xl">{message}</div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next") || "/prefer";

  const fileRef = useRef(null);
  const [form, setForm] = useState(() => {
    const p = getUserProfile();
    return { ...EMPTY_FORM, ...p, gender: p.gender || getUserGender() || "" };
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const setupMode = !isProfileReady();
  const display = getDisplayName(form) || "You";
  const canContinue =
    Boolean((form.name || form.nickname || "").trim()) &&
    (form.gender === "male" || form.gender === "female");

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2200);
    return () => clearTimeout(t);
  }, [saved]);

  const update = (key, value) => { setForm((p) => ({ ...p, [key]: value })); setSaved(false); setError(""); };

  const persist = () => {
    const next = setUserProfile({
      name: form.name.trim(), nickname: form.nickname.trim(),
      place: form.place.trim(), gender: form.gender || "",
      bio: form.bio.trim(), avatar: form.avatar || "",
    });
    if (next.gender) setUserGender(next.gender);
    setForm(next);
    return next;
  };

  const save = () => {
    if (!canContinue) { setError("Add your name (or nickname) and choose Boy or Girl to continue."); return; }
    persist(); setSaved(true);
  };

  const saveAndContinue = () => {
    if (!canContinue) { setError("Add your name (or nickname) and choose Boy or Girl to continue."); return; }
    persist();
    navigate(nextPath.startsWith("/") ? nextPath : "/prefer");
  };

  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try { update("avatar", await fileToDataUrl(file)); } catch { /* ignore */ } finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen hero-bg">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-dark border-b border-dark/6 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-sm text-muted hover:text-primary transition-colors flex items-center gap-1">
          <span>←</span> <span className="hidden sm:inline">Home</span>
        </Link>
        <BrandLogo className="text-lg sm:text-xl" />
        <span className="w-12" />
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-8 pb-20">

        {/* Title */}
        <div className="text-center mb-8 fade-in-soft">
          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            {setupMode ? "Step 1 · Start here" : "Your profile"}
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-2">
            {setupMode ? "Create your profile" : `Hey, ${display} 👋`}
          </h1>
          <p className="text-muted text-sm max-w-xs mx-auto">
            {setupMode
              ? "Just your name and whether you're a boy or girl — that's all it takes."
              : "Keep your info fresh so every chat feels personal."}
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border border-primary/12 bg-white/85 backdrop-blur-md shadow-sm overflow-hidden fade-in-soft">

          {/* Avatar hero */}
          <div className="relative bg-gradient-to-br from-primary/10 via-secondary/8 to-accent/10 px-6 pt-8 pb-6 flex flex-col items-center border-b border-dark/6">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="float-orb w-40 h-40 bg-primary/15 -top-8 -left-8" />
              <div className="float-orb w-32 h-32 bg-secondary/15 -bottom-4 -right-4" />
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="relative z-10 w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-gradient-to-br from-primary to-secondary group mb-3">
              {form.avatar
                ? <img src={form.avatar} alt="" className="w-full h-full object-cover" draggable={false} />
                : <span className="flex h-full items-center justify-center text-3xl font-bold text-white/90">{display.charAt(0).toUpperCase()}</span>}
              <span className="absolute inset-x-0 bottom-0 bg-dark/55 text-white text-[10px] font-semibold py-1.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? "Uploading…" : "Change photo"}
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
            <p className="relative z-10 font-display font-bold text-dark text-lg leading-tight">{display}</p>
            {form.place && <p className="relative z-10 text-muted text-xs mt-0.5 flex items-center gap-1"><span>📍</span>{form.place}</p>}
            {form.gender && (
              <span className="relative z-10 mt-2 text-[11px] font-semibold px-3 py-1 rounded-full bg-white/70 text-primary border border-primary/15">
                {form.gender === "male" ? "Boy" : "Girl"}
              </span>
            )}
            {form.avatar && (
              <button type="button" onClick={() => update("avatar", "")}
                className="relative z-10 text-[11px] text-muted hover:text-primary mt-2 transition-colors">
                Remove photo
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="p-5 sm:p-6 space-y-4">
            {!setupMode && <ProfileCompleteness form={form} />}

            <div>
              <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                Name <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">👤</span>
                <input value={form.name} onChange={(e) => update("name", e.target.value.slice(0, 40))}
                  placeholder="e.g. Alex"
                  className="w-full rounded-2xl border border-dark/10 bg-white pl-10 pr-4 py-3 text-dark text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                Nickname <span className="text-muted/60 font-normal normal-case">(what they call you)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">✨</span>
                <input value={form.nickname} onChange={(e) => update("nickname", e.target.value.slice(0, 24))}
                  placeholder="e.g. Ace, Babe, Champ…"
                  className="w-full rounded-2xl border border-dark/10 bg-white pl-10 pr-4 py-3 text-dark text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                Where are you from?
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">📍</span>
                <input value={form.place} onChange={(e) => update("place", e.target.value.slice(0, 40))}
                  placeholder="e.g. Mumbai, London…"
                  className="w-full rounded-2xl border border-dark/10 bg-white pl-10 pr-4 py-3 text-dark text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                I am a <span className="text-primary">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: "male", label: "Boy", emoji: "🧑" }, { id: "female", label: "Girl", emoji: "👩" }].map((g) => (
                  <button key={g.id} type="button" onClick={() => update("gender", g.id)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                      form.gender === g.id
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm"
                        : "border-dark/10 bg-white text-muted hover:border-primary/30 hover:bg-primary/4"
                    }`}>
                    <span>{g.emoji}</span> {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                About you <span className="text-muted/60 font-normal normal-case">(optional)</span>
              </label>
              <textarea value={form.bio} onChange={(e) => update("bio", e.target.value.slice(0, 160))}
                placeholder="A little something companions can know about you…" rows={3}
                className="w-full rounded-2xl border border-dark/10 bg-white px-4 py-3 text-dark text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none" />
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-muted">Companions use this to personalise replies</span>
                <span className={`text-[10px] font-semibold ${form.bio.length > 140 ? "text-primary" : "text-muted"}`}>{form.bio.length}/160</span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl bg-primary/8 border border-primary/20 px-4 py-3">
                <span className="text-primary mt-0.5">⚠️</span>
                <p className="text-sm text-primary font-medium">{error}</p>
              </div>
            )}

            <div className="pt-1 flex flex-col gap-2.5">
              <button type="button" onClick={saveAndContinue} disabled={!canContinue}
                className="btn-glow text-white font-semibold px-6 py-3.5 rounded-2xl text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed">
                {setupMode ? "Save & continue →" : "Save & keep chatting →"}
              </button>
              {!setupMode && (
                <button type="button" onClick={save} className="btn-outline font-semibold px-5 py-3 rounded-2xl text-sm">
                  Save only
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        {!setupMode && (
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Link to="/prefer" className="btn-outline font-semibold px-6 py-3 rounded-2xl text-sm text-center flex-1">Meet someone</Link>
            <Link to="/rooms" className="btn-glow text-white font-semibold px-6 py-3 rounded-2xl text-sm text-center flex-1">Open a room</Link>
          </div>
        )}
      </div>

      <Toast show={saved} message="Profile saved ✓" />
    </div>
  );
}
