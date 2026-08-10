import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import {
  getUserProfile,
  setUserProfile,
  clearUserProfile,
  getDisplayName,
} from "../data/userProfile";
import { getUserGender, setUserGender } from "../data/session";

async function fileToDataUrl(file, maxW = 480, quality = 0.72) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", quality);
}

export default function ProfilePage() {
  const fileRef = useRef(null);
  const [form, setForm] = useState(() => {
    const p = getUserProfile();
    return {
      ...p,
      gender: p.gender || getUserGender() || "",
    };
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2200);
    return () => clearTimeout(t);
  }, [saved]);

  const display = getDisplayName(form) || "You";

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const save = () => {
    const next = setUserProfile({
      name: form.name.trim(),
      nickname: form.nickname.trim(),
      place: form.place.trim(),
      gender: form.gender || "",
      bio: form.bio.trim(),
      avatar: form.avatar || "",
    });
    if (next.gender) setUserGender(next.gender);
    setForm(next);
    setSaved(true);
  };

  const reset = () => {
    if (!window.confirm("Clear your profile details?")) return;
    const empty = clearUserProfile();
    setForm(empty);
    setSaved(false);
  };

  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      update("avatar", dataUrl);
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.75rem))] pb-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-sm text-muted hover:text-primary">
            ← Home
          </Link>
          <BrandLogo className="text-lg sm:text-xl" />
          <span className="w-12" />
        </div>

        <div className="text-center mb-8">
          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            Your vibe
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-2">
            Profile
          </h1>
          <p className="text-muted text-sm">
            Companions use this so they can call you by name and keep chats personal.
          </p>
        </div>

        <div className="rounded-3xl border border-primary/15 bg-white/80 backdrop-blur-md p-5 sm:p-7 shadow-sm">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-7">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20 bg-gradient-to-br from-primary to-secondary mb-3 group"
              title="Change photo"
            >
              {form.avatar ? (
                <img src={form.avatar} alt="" className="w-full h-full object-cover" draggable={false} />
              ) : (
                <span className="flex h-full items-center justify-center text-3xl text-white/90">
                  {display.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-dark/50 text-white text-[10px] py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? "…" : "Edit"}
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
            <p className="font-display font-bold text-dark text-lg">{display}</p>
            {form.place && <p className="text-muted text-xs mt-0.5">From {form.place}</p>}
            {form.avatar && (
              <button
                type="button"
                onClick={() => update("avatar", "")}
                className="text-[11px] text-muted hover:text-primary mt-2"
              >
                Remove photo
              </button>
            )}
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Name</span>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value.slice(0, 40))}
                placeholder="e.g. Parth"
                className="mt-1.5 w-full rounded-2xl border border-dark/10 bg-white px-4 py-3 text-dark outline-none focus:border-primary/40"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Nickname</span>
              <input
                value={form.nickname}
                onChange={(e) => update("nickname", e.target.value.slice(0, 24))}
                placeholder="What should they call you?"
                className="mt-1.5 w-full rounded-2xl border border-dark/10 bg-white px-4 py-3 text-dark outline-none focus:border-primary/40"
              />
              <span className="text-[11px] text-muted mt-1 block">Preferred over your real name in chat</span>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Where are you from?</span>
              <input
                value={form.place}
                onChange={(e) => update("place", e.target.value.slice(0, 40))}
                placeholder="e.g. Mumbai"
                className="mt-1.5 w-full rounded-2xl border border-dark/10 bg-white px-4 py-3 text-dark outline-none focus:border-primary/40"
              />
            </label>

            <div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">I am a</span>
              <div className="mt-1.5 grid grid-cols-2 gap-3">
                {[
                  { id: "male", label: "Boy" },
                  { id: "female", label: "Girl" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => update("gender", g.id)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                      form.gender === g.id
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "border-dark/10 bg-white text-muted hover:border-primary/30"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">About you</span>
              <textarea
                value={form.bio}
                onChange={(e) => update("bio", e.target.value.slice(0, 160))}
                placeholder="A little something companions can know…"
                rows={3}
                className="mt-1.5 w-full rounded-2xl border border-dark/10 bg-white px-4 py-3 text-dark outline-none focus:border-primary/40 resize-none"
              />
              <span className="text-[11px] text-muted mt-1 block text-right">{form.bio.length}/160</span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={save}
              className="btn-glow text-white font-semibold px-6 py-3 rounded-2xl text-sm flex-1 min-w-[8rem]"
            >
              {saved ? "Saved ✓" : "Save profile"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="btn-outline font-semibold px-5 py-3 rounded-2xl text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="btn-outline font-semibold px-6 py-3 rounded-2xl text-sm text-center"
          >
            Start chatting
          </Link>
          <Link
            to="/rooms"
            className="btn-glow text-white font-semibold px-6 py-3 rounded-2xl text-sm text-center"
          >
            Open a room
          </Link>
        </div>
      </div>
    </div>
  );
}
