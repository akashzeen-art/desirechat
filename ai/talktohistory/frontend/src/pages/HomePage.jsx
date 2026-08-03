import { useNavigate } from "react-router-dom";
import { setUserGender } from "../data/session";
import { characters } from "../data/characters";
import BrandLogo from "../components/BrandLogo";

const FLOATING = [
  { emoji: "🌙", className: "top-[12%] left-[4%] sm:left-[6%] animate-float", delay: "0s" },
  { emoji: "🔥", className: "top-[14%] right-[4%] sm:right-[8%] animate-float-slow", delay: "0.4s" },
  { emoji: "😎", className: "bottom-[12%] left-[5%] sm:left-[10%] animate-drift", delay: "0.8s" },
  { emoji: "💕", className: "bottom-[14%] right-[5%] sm:right-[10%] animate-float", delay: "1.2s" },
  { emoji: "✨", className: "top-[22%] left-[12%] animate-float-slow hidden lg:flex", delay: "0.2s" },
  { emoji: "🦁", className: "bottom-[22%] right-[12%] animate-drift hidden lg:flex", delay: "1s" },
];

const STEPS = [
  {
    n: "01",
    title: "Say who you are",
    desc: "Boy or girl — so your spark feels personal from the first tap.",
  },
  {
    n: "02",
    title: "Pick who to flirt with",
    desc: "Choose girls or boys. We show matching vibes only.",
  },
  {
    n: "03",
    title: "Chat & talk",
    desc: "Type or use your mic. They reply with voice — like a real convo.",
  },
];

const PREVIEWS = characters.filter((c) =>
  ["luna", "zara", "alex", "nico", "mia", "leo"].includes(c.id)
);

export default function HomePage() {
  const navigate = useNavigate();

  const pickGender = (gender) => {
    setUserGender(gender);
    navigate("/prefer");
  };

  const scrollToStart = () => {
    document.getElementById("who")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen hero-bg">
      {/* ── HERO ── */}
      <section className="relative min-h-[100svh] flex items-center justify-center px-6 sm:px-10 pt-[max(6rem,calc(env(safe-area-inset-top)+5rem))] pb-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="float-orb w-[28rem] h-[28rem] bg-secondary/40 top-10 -left-20 animate-pulse-slow" />
          <div className="float-orb w-[22rem] h-[22rem] bg-accent/30 bottom-10 -right-16 animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
          <div className="float-orb w-[16rem] h-[16rem] bg-primary/20 top-1/2 left-1/2 -translate-x-1/2 animate-pulse-slow" style={{ animationDelay: "0.8s" }} />

          {FLOATING.map((f) => (
            <div
              key={f.emoji + f.className}
              className={`float-avatar ${f.className}`}
              style={{ animationDelay: f.delay }}
            >
              {f.emoji}
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-xl mx-auto text-center">
          <div className="fade-in-soft mb-5 flex flex-col items-center gap-2">
            <span className="text-2xl leading-none" aria-hidden="true">💕</span>
            <span className="text-primary text-sm sm:text-base font-semibold tracking-[0.18em] uppercase">
              Flirt Net
            </span>
          </div>
          <h1 className="fade-in-soft text-[1.65rem] sm:text-4xl text-dark mb-5 hero-title">
            Flirting that actually feels fun
          </h1>
          <p className="fade-in-soft text-muted text-[0.95rem] sm:text-lg max-w-md mx-auto mb-10 leading-relaxed px-1" style={{ animationDelay: "0.12s" }}>
            Pick your vibe, choose who to flirt with, then chat and talk like it&apos;s midnight chemistry.
          </p>
          <div className="fade-in-soft flex flex-col sm:flex-row items-center justify-center gap-3 px-1" style={{ animationDelay: "0.2s" }}>
            <button onClick={scrollToStart} className="btn-glow text-white font-semibold px-8 py-3.5 rounded-2xl text-sm sm:text-base w-full sm:w-auto max-w-xs">
              Start with Flirt Net
            </button>
            <a href="#how" className="btn-outline font-semibold px-8 py-3.5 rounded-2xl text-sm sm:text-base w-full sm:w-auto max-w-xs text-center">
              See how it works
            </a>
          </div>
          <p className="fade-in-soft text-muted/70 text-xs mt-8 tracking-wide" style={{ animationDelay: "0.3s" }}>
            Chat · Voice · Instant chemistry
          </p>
        </div>
      </section>

      {/* ── WHO ARE YOU ── */}
      <section id="who" className="relative px-4 py-20 section-warm">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Step 1</p>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">
            Who are you?
          </h2>
          <p className="text-muted mb-10 max-w-md mx-auto">
            Tell us if you&apos;re a boy or a girl — then we&apos;ll ask who you want to flirt with.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto">
            <button onClick={() => pickGender("male")} className="choice-card rounded-3xl p-8 text-left group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">👦</div>
              <h3 className="font-display text-2xl font-bold text-dark mb-1">I&apos;m a Boy</h3>
              <p className="text-muted text-sm">Continue as a guy · next: pick who to flirt with</p>
            </button>
            <button onClick={() => pickGender("female")} className="choice-card rounded-3xl p-8 text-left group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">👧</div>
              <h3 className="font-display text-2xl font-bold text-dark mb-1">I&apos;m a Girl</h3>
              <p className="text-muted text-sm">Continue as a girl · next: pick who to flirt with</p>
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="relative px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Simple</p>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">
              Three taps to chemistry
            </h2>
            <p className="text-muted max-w-md mx-auto">
              No long signup. Just vibes, voices, and a little spark.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map((step) => (
              <div key={step.n} className="text-center md:text-left">
                <p className="font-display text-5xl font-extrabold gradient-text mb-3">{step.n}</p>
                <h3 className="font-display text-xl font-bold text-dark mb-2">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIBES PREVIEW ── */}
      <section className="relative px-4 py-20 section-warm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">The vibes</p>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">
              Someone for every mood
            </h2>
            <p className="text-muted max-w-md mx-auto">
              Mysterious, sweet, bold, romantic — pick the energy you want tonight.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PREVIEWS.map((c) => (
              <button
                key={c.id}
                onClick={scrollToStart}
                className="group text-center"
              >
                <div className={`mx-auto mb-3 w-20 h-20 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-3xl shadow-md group-hover:scale-105 transition-transform duration-300 overflow-hidden`}>
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover object-top" draggable={false} />
                  ) : (
                    c.emoji
                  )}
                </div>
                <p className="font-display font-bold text-dark text-sm">{c.name}</p>
                <p className="text-muted text-xs mt-0.5">{c.vibe}</p>
              </button>
            ))}
          </div>

          <div className="text-center mt-10">
            <button onClick={scrollToStart} className="btn-glow text-white font-semibold px-7 py-3 rounded-2xl text-sm">
              Start matching
            </button>
          </div>
        </div>
      </section>

      {/* ── CHAT + VOICE ── */}
      <section className="relative px-4 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Chat & voice</p>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-4">
              Type it. Say it. Feel the spark.
            </h2>
            <p className="text-muted leading-relaxed mb-6">
              Hit the mic and talk naturally — they listen, reply, and speak back.
              Perfect for late-night banter when typing feels like too much work.
            </p>
            <ul className="space-y-3 text-sm text-dark/80">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                Instant replies with personality
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                Voice in and voice out in your browser
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                Soft, playful flirting — never awkward silence
              </li>
            </ul>
          </div>

          <div className="mock-chat rounded-3xl p-5 sm:p-6 space-y-4 animate-float">
            <div className="flex items-center gap-3 pb-3 border-b border-primary/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-lg">🌙</div>
              <div>
                <p className="font-display font-bold text-dark text-sm">Luna</p>
                <p className="text-muted text-xs">Speaking…</p>
              </div>
            </div>
            <div className="bg-white border border-primary/10 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-dark max-w-[90%]">
              Hey you… I was hoping someone interesting would show up. What&apos;s your name?
            </div>
            <div className="bg-primary text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm max-w-[85%] ml-auto">
              It&apos;s Alex. You always this mysterious?
            </div>
            <div className="bg-white border border-primary/10 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-dark max-w-[90%]">
              Only with people worth the mystery. Your turn — make me curious.
            </div>
            <div className="flex items-center gap-2 pt-1 text-muted text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Voice on · tap mic to reply
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / FOOTER ── */}
      <section className="relative px-4 py-20 section-warm">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-headline text-3xl sm:text-5xl font-extrabold text-dark mb-4">
            Ready when you are
          </h2>
          <p className="text-muted mb-8">
            Your spark is one choice away. Boy or girl — then the fun starts.
          </p>
          <button onClick={scrollToStart} className="btn-glow text-white font-semibold px-10 py-4 rounded-2xl">
            Let&apos;s flirt
          </button>
        </div>
      </section>

      <footer className="px-4 py-8 border-t border-primary/10 text-center">
        <div className="flex justify-center mb-2">
          <BrandLogo className="h-10 sm:h-12 w-auto" />
        </div>
        <p className="text-muted text-xs">Chat · Voice · Chemistry</p>
      </footer>
    </div>
  );
}
