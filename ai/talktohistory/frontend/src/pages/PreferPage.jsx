import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserGender, setPreferGender } from "../data/session";
import { getCharactersByGender } from "../data/characters";

export default function PreferPage() {
  const navigate = useNavigate();
  const userGender = getUserGender();

  useEffect(() => {
    if (!userGender) navigate("/", { replace: true });
  }, [userGender, navigate]);

  if (!userGender) return null;

  const pick = (prefer) => {
    setPreferGender(prefer);
    navigate("/pick");
  };

  const youLabel = userGender === "male" ? "boy" : "girl";
  const girls = getCharactersByGender("female").slice(0, 4);
  const boys = getCharactersByGender("male").slice(0, 4);

  return (
    <div className="min-h-screen hero-bg overflow-x-hidden">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-[max(6rem,calc(env(safe-area-inset-top)+5rem))] pb-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="float-orb w-80 h-80 bg-secondary/35 top-20 left-10 animate-pulse-slow" />
          <div className="float-orb w-72 h-72 bg-accent/25 bottom-16 right-8 animate-pulse-slow" style={{ animationDelay: "1.2s" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center w-full">
          <button
            onClick={() => navigate("/")}
            className="text-muted hover:text-primary text-sm mb-8 transition-colors"
          >
            ← Change who you are
          </button>

          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Step 2 · You&apos;re a {youLabel}
          </p>
          <h1 className="font-headline text-3xl sm:text-5xl font-extrabold text-dark mb-3">
            Who do you want to meet?
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-md mx-auto mb-12">
            Choose girls or boys — we&apos;ll show matching companions next.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <button
              onClick={() => pick("female")}
              className="choice-card rounded-3xl p-7 text-left group"
            >
              <div className="flex -space-x-2 mb-5">
                {girls.map((g) => (
                  <div
                    key={g.id}
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${g.color} flex items-center justify-center text-lg border-2 border-white shadow-sm group-hover:scale-105 transition-transform overflow-hidden`}
                  >
                    {g.image ? (
                      <img src={g.image} alt={g.name} className="w-full h-full object-cover object-top" draggable={false} />
                    ) : (
                      g.emoji
                    )}
                  </div>
                ))}
              </div>
              <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-3">Companions</p>
              <h2 className="font-display text-2xl font-bold text-dark mb-1">Girls</h2>
              <p className="text-muted text-sm">Sweet, Bold, Funny × African, Asian, Chinese, European</p>
            </button>

            <button
              onClick={() => pick("male")}
              className="choice-card rounded-3xl p-7 text-left group"
            >
              <div className="flex -space-x-2 mb-5">
                {boys.map((b) => (
                  <div
                    key={b.id}
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${b.color} flex items-center justify-center text-lg border-2 border-white shadow-sm group-hover:scale-105 transition-transform overflow-hidden`}
                  >
                    {b.image ? (
                      <img src={b.image} alt={b.name} className="w-full h-full object-cover object-top" draggable={false} />
                    ) : (
                      b.emoji
                    )}
                  </div>
                ))}
              </div>
              <p className="text-secondary text-xs font-semibold uppercase tracking-wider mb-3">Companions</p>
              <h2 className="font-display text-2xl font-bold text-dark mb-1">Boys</h2>
              <p className="text-muted text-sm">Sweet, Bold, Funny × African, Asian, Chinese, European</p>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
