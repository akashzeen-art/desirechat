import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import BrandLogo from "./BrandLogo";
import { isProfileReady } from "../data/userProfile";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const goHow = () => {
    setMenuOpen(false);
    if (location.pathname === "/") {
      document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const goStart = () => {
    setMenuOpen(false);
    if (!isProfileReady()) {
      navigate("/profile?setup=1&next=/prefer");
      return;
    }
    navigate("/prefer");
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/rooms", label: "Rooms" },
    { to: "/profile", label: "Profile" },
    { label: "How it works", onClick: goHow },
    { to: "/about", label: "About" },
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-dark/5 pt-[env(safe-area-inset-top)]">
      <div className="w-full pl-2 pr-4 sm:pl-3 sm:pr-6">
        <div className="flex items-center justify-between h-16 sm:h-[4.5rem]">
          <Link to="/" className="flex items-center group flex-shrink-0 -ml-0.5">
            <BrandLogo className="text-3xl sm:text-4xl group-hover:opacity-80 transition-opacity" />
          </Link>

          <div className="hidden md:flex items-center gap-1 ml-auto mr-3">
            {links.map((l) =>
              l.onClick ? (
                <button
                  key={l.label}
                  onClick={l.onClick}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-muted hover:text-dark hover:bg-dark/5 transition-all duration-200"
                >
                  {l.label}
                </button>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(l.to)
                      ? "text-primary bg-primary/10"
                      : "text-muted hover:text-dark hover:bg-dark/5"
                  }`}
                >
                  {l.label}
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={goStart}
              className="hidden sm:inline-flex btn-glow text-white text-sm font-semibold px-5 py-2 rounded-xl"
            >
              Start
            </button>
            <button
              className="md:hidden text-muted hover:text-dark p-2 rounded-lg hover:bg-dark/5 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-dark/5 py-3 space-y-1 animate-fade-in">
            {links.map((l) =>
              l.onClick ? (
                <button
                  key={l.label}
                  onClick={l.onClick}
                  className="block w-full text-left px-4 py-2.5 text-sm rounded-xl text-muted hover:text-dark hover:bg-dark/5"
                >
                  {l.label}
                </button>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm rounded-xl transition-colors ${
                    isActive(l.to)
                      ? "text-primary bg-primary/10"
                      : "text-muted hover:text-dark hover:bg-dark/5"
                  }`}
                >
                  {l.label}
                </Link>
              )
            )}
            <div className="pt-2 px-4">
              <button
                onClick={goStart}
                className="block w-full btn-glow text-white text-sm font-semibold px-5 py-2.5 rounded-xl text-center"
              >
                Start
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
