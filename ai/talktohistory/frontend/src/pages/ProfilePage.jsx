import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import {
  getUserProfile,
  setUserProfile,
  clearUserProfile,
  getDisplayName,
  isProfileReady,
} from "../data/userProfile";
import {
  listAccounts,
  switchAccount,
  getActiveUserId,
  logoutAccount,
  createAccount,
} from "../data/accounts";
import { getUserGender, setUserGender, clearFlirtSession } from "../data/session";

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

const EMPTY_FORM = {
  name: "",
  nickname: "",
  place: "",
  gender: "",
  bio: "",
  avatar: "",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next") || "/prefer";
  const wantNew = searchParams.get("new") === "1";

  const fileRef = useRef(null);
  const [accounts, setAccounts] = useState(() => listAccounts());
  const [activeId, setActiveId] = useState(() => getActiveUserId());
  const [creatingNew, setCreatingNew] = useState(() => wantNew || !getActiveUserId());
  const [form, setForm] = useState(() => {
    if (wantNew || !getActiveUserId()) return { ...EMPTY_FORM, gender: getUserGender() || "" };
    const p = getUserProfile();
    return { ...p, gender: p.gender || getUserGender() || "" };
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const setupMode = creatingNew || !isProfileReady();

  // ?new=1 must clear the session so we don't overwrite another person's account
  useEffect(() => {
    if (!wantNew) return;
    logoutAccount();
    setActiveId("");
    setCreatingNew(true);
    setForm({ ...EMPTY_FORM, gender: getUserGender() || "" });
    setAccounts(listAccounts());
  }, [wantNew]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2200);
    return () => clearTimeout(t);
  }, [saved]);

  const refreshAccounts = () => {
    setAccounts(listAccounts());
    setActiveId(getActiveUserId());
  };

  const display = getDisplayName(form) || "You";
  const canContinue =
    Boolean((form.name || form.nickname || "").trim()) &&
    (form.gender === "male" || form.gender === "female");

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError("");
  };

  const persist = () => {
    // Creating a brand-new person → always new account (never overwrite Pooja with Henry)
    if (creatingNew || !getActiveUserId()) {
      logoutAccount();
      const draft = {
        name: form.name.trim(),
        nickname: form.nickname.trim(),
        place: form.place.trim(),
        gender: form.gender || "",
        bio: form.bio.trim(),
        avatar: form.avatar || "",
      };
      createAccount(draft);
      if (draft.gender) setUserGender(draft.gender);
      setCreatingNew(false);
      refreshAccounts();
      const next = getUserProfile();
      setForm(next);
      return next;
    }

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
    refreshAccounts();
    return next;
  };

  const save = () => {
    if (!canContinue) {
      setError("Add your name (or nickname) and choose Boy or Girl to continue.");
      return;
    }
    persist();
    setSaved(true);
  };

  const saveAndContinue = () => {
    if (!canContinue) {
      setError("Add your name (or nickname) and choose Boy or Girl to continue.");
      return;
    }
    persist();
    setSaved(true);
    navigate(nextPath.startsWith("/") ? nextPath : "/prefer");
  };

  const startNewProfile = () => {
    logoutAccount();
    clearFlirtSession();
    try {
      sessionStorage.removeItem("spark_mood");
    } catch {
      /* ignore */
    }
    setCreatingNew(true);
    setActiveId("");
    setForm({ ...EMPTY_FORM });
    setError("");
    setSaved(false);
    navigate("/profile?setup=1&new=1&next=/prefer", { replace: true });
  };

  const loginAs = (userId) => {
    if (!switchAccount(userId)) return;
    clearFlirtSession();
    const p = getUserProfile();
    if (p.gender) setUserGender(p.gender);
    setCreatingNew(false);
    setActiveId(userId);
    setForm({ ...p, gender: p.gender || "" });
    setError("");
    setSaved(false);
    refreshAccounts();
    if (isProfileReady(p)) {
      navigate(nextPath.startsWith("/") ? nextPath : "/prefer");
    }
  };

  const logout = () => {
    if (!window.confirm("Log out? Your chats stay saved under your name — you can switch back anytime.")) return;
    clearUserProfile();
    clearFlirtSession();
    try {
      sessionStorage.removeItem("spark_mood");
    } catch {
      /* ignore */
    }
    setCreatingNew(true);
    setActiveId("");
    setForm({ ...EMPTY_FORM });
    setSaved(false);
    setError("");
    refreshAccounts();
    navigate("/profile?setup=1&next=/prefer", { replace: true });
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

  const otherAccounts = accounts.filter((a) => a.id !== activeId);

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
            {creatingNew ? "Step 1 · New account" : setupMode ? "Step 1 · Start here" : "Your vibe"}
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-2">
            {creatingNew ? "Create your profile" : setupMode ? "Create your profile" : "Profile"}
          </h1>
          <p className="text-muted text-sm">
            {creatingNew
              ? "This is a separate account — your chats won’t mix with anyone else on this device."
              : "Each person has their own chats, rooms, and favorites."}
          </p>
        </div>

        {/* Saved accounts on this device */}
        {otherAccounts.length > 0 && (
          <div className="mb-6 rounded-3xl border border-primary/15 bg-white/80 p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              {creatingNew || !activeId ? "Continue as" : "Switch account"}
            </p>
            <div className="space-y-2">
              {otherAccounts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => loginAs(a.id)}
                  className="w-full flex items-center gap-3 rounded-2xl border border-dark/8 bg-white px-3 py-2.5 text-left hover:border-primary/40"
                >
                  <span className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {a.avatar ? (
                      <img src={a.avatar} alt="" className="w-full h-full object-cover" draggable={false} />
                    ) : (
                      a.displayName.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold text-dark text-sm truncate">{a.displayName}</span>
                    <span className="block text-[11px] text-muted">
                      {a.gender === "male" ? "Boy" : a.gender === "female" ? "Girl" : "Saved profile"}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-primary">Open</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-primary/15 bg-white/80 backdrop-blur-md p-5 sm:p-7 shadow-sm">
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
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Name <span className="text-primary">*</span>
              </span>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value.slice(0, 40))}
                placeholder="e.g. Henry"
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
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                I am a <span className="text-primary">*</span>
              </span>
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

          {error && <p className="mt-4 text-sm text-primary text-center">{error}</p>}

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={saveAndContinue}
              disabled={!canContinue}
              className="btn-glow text-white font-semibold px-6 py-3.5 rounded-2xl text-sm w-full disabled:opacity-40"
            >
              {creatingNew ? "Create account & continue" : setupMode ? "Save & continue" : "Save & keep chatting"}
            </button>
            {!setupMode && !creatingNew && (
              <button
                type="button"
                onClick={save}
                className="btn-outline font-semibold px-5 py-3 rounded-2xl text-sm"
              >
                {saved ? "Saved ✓" : "Save only"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {!creatingNew && isProfileReady() && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/prefer"
                className="btn-outline font-semibold px-6 py-3 rounded-2xl text-sm text-center"
              >
                Meet someone
              </Link>
              <Link
                to="/rooms"
                className="btn-glow text-white font-semibold px-6 py-3 rounded-2xl text-sm text-center"
              >
                Open a room
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={startNewProfile}
            className="w-full text-sm font-semibold px-6 py-3 rounded-2xl border border-secondary/30 text-secondary hover:bg-secondary/10"
          >
            + New profile (separate chats)
          </button>

          {(activeId || isProfileReady()) && (
            <button
              type="button"
              onClick={logout}
              className="w-full text-sm font-semibold px-6 py-3 rounded-2xl border border-primary/25 text-primary hover:bg-primary/10"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
