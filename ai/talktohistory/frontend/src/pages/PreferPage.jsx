import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserGender, setPreferGender, setUserGender } from "../data/session";
import { getCharactersByGender } from "../data/characters";
import { getUserProfile, isProfileReady, getDisplayName } from "../data/userProfile";

export default function PreferPage() {
  const navigate   = useNavigate();
  const profile    = getUserProfile();
  const userGender = profile.gender || getUserGender();
  const display    = getDisplayName(profile);

  useEffect(() => {
    if (!isProfileReady()) { navigate("/profile?setup=1&next=/prefer", { replace: true }); return; }
    if (profile.gender && !getUserGender()) setUserGender(profile.gender);
  }, [navigate, profile.gender]);

  if (!isProfileReady() || !userGender) return null;

  const pick      = (prefer) => { setPreferGender(prefer); navigate("/pick"); };
  const youLabel  = userGender === "male" ? "boy" : "girl";
  const girls     = getCharactersByGender("female").slice(0, 5);
  const boys      = getCharactersByGender("male").slice(0, 5);

  return (
    <div className="min-h-screen hero-bg overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="float-orb w-96 h-96 bg-secondary/20 top-10 left-0 animate-pulse-slow" />
        <div className="float-orb w-80 h-80 bg-primary/15 bottom-10 right-0 animate-pulse-slow" style={{ animationDelay: "1.4s" }} />
      </div>

      <section className="relative min-h-screen flex flex-col items-center justify-center px-4
        pt-[max(6rem,calc(env(safe-area-inset-top)+5rem))] pb-16">
        <div className="relative z-10 max-w-4xl mx-auto w-full">

          {/* Back */}
          <button onClick={() => navigate("/profile")}
            className="flex items-center gap-1.5 text-muted hover:text-primary text-sm mb-10 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Edit profile
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/70 border border-dark/8 rounded-full px-4 py-1.5 mb-5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Step 2 · You're a {youLabel}</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-5xl font-extrabold text-dark mb-3">
              Who do you want to meet{display ? `, ${display}` : ""}?
            </h1>
            <p className="text-muted text-base sm:text-lg max-w-sm mx-auto">
              Choose girls or boys — we'll show matching companions next.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Girls */}
            <button onClick={() => pick("female")}
              className="group relative rounded-3xl overflow-hidden border border-primary/15 bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-left">
              {/* Gradient top band */}
              <div className="h-2 w-full" style={{ background: "linear-gradient(90deg,#FF4DB8,#E91E8C,#C2187A)" }} />
              <div className="p-7">
                {/* Avatar stack */}
                <div className="flex -space-x-3 mb-6">
                  {girls.map((g, i) => (
                    <div key={g.id}
                      className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-primary to-secondary flex-shrink-0 group-hover:scale-105 transition-transform"
                      style={{ transitionDelay: `${i * 40}ms` }}>
                      {g.image
                        ? <img src={g.image} alt={g.name} className="w-full h-full object-cover object-top" draggable={false} />
                        : <span className="flex h-full items-center justify-center">{g.emoji}</span>}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">12 companions</span>
                <h2 className="font-display text-2xl font-extrabold text-dark mb-2">Girls 💕</h2>
                <p className="text-muted text-sm leading-relaxed">Sweet, Bold, Funny<br />× African, Asian, Chinese, European</p>
                <div className="mt-5 flex items-center gap-2 text-primary font-semibold text-sm">
                  Meet the girls
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Boys */}
            <button onClick={() => pick("male")}
              className="group relative rounded-3xl overflow-hidden border border-secondary/15 bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-left">
              <div className="h-2 w-full" style={{ background: "linear-gradient(90deg,#7C3AED,#6D28D9,#5B21B6)" }} />
              <div className="p-7">
                <div className="flex -space-x-3 mb-6">
                  {boys.map((b, i) => (
                    <div key={b.id}
                      className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-secondary to-violet-700 flex-shrink-0 group-hover:scale-105 transition-transform"
                      style={{ transitionDelay: `${i * 40}ms` }}>
                      {b.image
                        ? <img src={b.image} alt={b.name} className="w-full h-full object-cover object-top" draggable={false} />
                        : <span className="flex h-full items-center justify-center">{b.emoji}</span>}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary mb-2 block">12 companions</span>
                <h2 className="font-display text-2xl font-extrabold text-dark mb-2">Boys 💙</h2>
                <p className="text-muted text-sm leading-relaxed">Sweet, Bold, Funny<br />× African, Asian, Chinese, European</p>
                <div className="mt-5 flex items-center gap-2 text-secondary font-semibold text-sm">
                  Meet the boys
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
