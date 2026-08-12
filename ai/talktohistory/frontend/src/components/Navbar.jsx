import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import BrandLogo from "./BrandLogo";
import { isProfileReady, getDisplayName, getUserProfile } from "../data/userProfile";

const GAMES = [
  { emoji: "🎭", label: "Truth or Dare",       desc: "Spicy questions & dares" },
  { emoji: "🐍", label: "Snakes & Ladders",     desc: "Classic board game" },
  { emoji: "🎲", label: "Dice Challenge",        desc: "Roll & flirt" },
];

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const gamesRef = useRef(null);
  const profile  = getUserProfile();
  const ready    = isProfileReady();
  const display  = getDisplayName(profile);

  useEffect(() => {
    const close = (e) => {
      if (gamesRef.current && !gamesRef.current.contains(e.target)) setGamesOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const goHow = () => {
    setMenuOpen(false);
    if (location.pathname === "/") {
      document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" }), 120);
    }
  };

  const goStart = () => {
    setMenuOpen(false);
    navigate(ready ? "/prefer" : "/profile?setup=1&next=/prefer");
  };

  const goGame = () => {
    setGamesOpen(false);
    setMenuOpen(false);
    navigate(ready ? "/prefer" : "/profile?setup=1&next=/prefer");
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const navLink = (to, label) => (
    <Link key={to} to={to}
      className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
        isActive(to)
          ? "text-primary"
          : "text-dark/60 hover:text-dark hover:bg-pink-50"
      }`}>
      {label}
      {isActive(to) && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary" />
      )}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)]"
      style={{
        background: "rgba(255,240,247,0.94)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(233,30,140,0.10)",
        boxShadow: "0 1px 24px rgba(233,30,140,0.06)",
      }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[4.5rem] gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center flex-shrink-0 hover:opacity-85 transition-opacity">
            <BrandLogo className="text-4xl sm:text-[2.6rem]" />
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLink("/", "Home")}
            {navLink("/rooms", "Rooms")}

            {/* Games dropdown */}
            <div className="relative" ref={gamesRef}>
              <button
                onClick={() => setGamesOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  gamesOpen ? "text-primary bg-pink-50" : "text-dark/60 hover:text-dark hover:bg-pink-50"
                }`}>
                <span>🎮</span>
                <span>Games</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${gamesOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {gamesOpen && (
                <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-60 rounded-2xl overflow-hidden animate-slide-up"
                  style={{
                    background: "rgba(255,245,250,0.98)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(233,30,140,0.12)",
                    boxShadow: "0 20px 48px rgba(233,30,140,0.14), 0 4px 12px rgba(0,0,0,0.06)",
                  }}>
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-[11px] font-bold text-dark mb-0.5">Want to play a game? 🎮</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/50">
                      Play while you chat
                    </p>
                  </div>
                  {GAMES.map((g) => (
                    <button key={g.label} type="button" onClick={goGame}
                      className="w-full text-left px-4 py-2.5 hover:bg-pink-50 transition-colors flex items-center gap-3 group">
                      <span className="text-xl w-7 text-center flex-shrink-0">{g.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-dark group-hover:text-primary transition-colors leading-tight">
                          {g.label}
                        </p>
                        <p className="text-[11px] text-muted">{g.desc}</p>
                      </div>
                    </button>
                  ))}
                  <div className="p-3 pt-2">
                    <button onClick={goGame}
                      className="w-full btn-glow text-white text-xs font-bold py-2.5 rounded-xl tracking-wide">
                      Pick a companion & play →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={goHow}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-dark/60 hover:text-dark hover:bg-pink-50 transition-all duration-200">
              How it works
            </button>

            {navLink("/about", "About")}
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Profile pill */}
            <Link to="/profile"
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-sm font-semibold ${
                location.pathname.startsWith("/profile")
                  ? "border-primary/40 bg-primary/8 text-primary"
                  : "border-pink-200 bg-white/60 text-dark/70 hover:border-primary/40 hover:text-primary"
              }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold overflow-hidden flex-shrink-0 ${
                ready ? "bg-gradient-to-br from-primary to-secondary text-white" : "bg-pink-100 text-muted"
              }`}>
                {profile.avatar
                  ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" draggable={false} />
                  : ready ? display.charAt(0).toUpperCase() : "?"}
              </span>
              <span className="max-w-[80px] truncate">{ready ? (display || "Profile") : "Profile"}</span>
              {ready && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
            </Link>

            {/* CTA button */}
            <button onClick={goStart}
              className="btn-glow text-white text-sm font-bold px-5 py-2 rounded-xl hidden sm:inline-flex items-center gap-1.5 tracking-wide">
              {ready ? "Chat now →" : "Get started"}
            </button>

            {/* Hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-dark/60 hover:text-dark hover:bg-pink-50 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div className="md:hidden border-t border-pink-100 py-3 space-y-0.5 animate-slide-up">
            {[
              { to: "/",      label: "Home" },
              { to: "/rooms", label: "Rooms" },
              { to: "/about", label: "About" },
            ].map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  isActive(l.to) ? "text-primary bg-pink-50" : "text-dark/70 hover:text-dark hover:bg-pink-50"
                }`}>
                {l.label}
                {isActive(l.to) && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            ))}

            <button onClick={goHow}
              className="block w-full text-left px-4 py-2.5 text-sm font-semibold rounded-xl text-dark/70 hover:text-dark hover:bg-pink-50 transition-colors">
              How it works
            </button>

            {/* Games section in mobile */}
            <div className="px-4 py-2 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/50 mb-2">🎮 Games</p>
              <div className="flex flex-wrap gap-2">
                {GAMES.map((g) => (
                  <button key={g.label} type="button" onClick={goGame}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-100 text-xs font-semibold text-dark/70 hover:text-primary hover:border-primary/30 transition-colors">
                    <span>{g.emoji}</span> {g.label}
                  </button>
                ))}
              </div>
            </div>

            <Link to="/profile" onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                location.pathname.startsWith("/profile") ? "text-primary bg-pink-50" : "text-dark/70 hover:text-dark hover:bg-pink-50"
              }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold overflow-hidden ${
                ready ? "bg-gradient-to-br from-primary to-secondary text-white" : "bg-pink-100 text-muted"
              }`}>
                {profile.avatar
                  ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" draggable={false} />
                  : ready ? display.charAt(0).toUpperCase() : "?"}
              </span>
              Profile
              {ready && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </Link>

            <div className="pt-2 px-1">
              <button onClick={goStart}
                className="w-full btn-glow text-white text-sm font-bold px-5 py-3 rounded-xl tracking-wide">
                {ready ? "Start chatting →" : "Create profile"}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
