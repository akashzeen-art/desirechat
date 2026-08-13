import { useNavigate } from "react-router-dom";
import { setUserGender } from "../data/session";
import { characters } from "../data/characters";
import { isProfileReady, getDisplayName, getUserProfile } from "../data/userProfile";
import BrandLogo from "../components/BrandLogo";

const STEPS = [
  { n: "01", icon: "👤", title: "Create your profile", desc: "Name, nickname, where you're from — so every chat feels personal." },
  { n: "02", icon: "💫", title: "Pick your match",     desc: "Choose girls or boys, then vibe and style that fit your mood."    },
  { n: "03", icon: "💬", title: "Chat & talk",         desc: "Type or use your mic. They reply with voice — like a real convo." },
];

const FEATURES = [
  { icon: "🎙️", label: "Voice chat" },
  { icon: "📸", label: "Photo sharing" },
  { icon: "🎲", label: "Mini games" },
  { icon: "🎭", label: "Truth or Dare" },
  { icon: "💡", label: "AI suggestions" },
  { icon: "🏠", label: "Chat rooms" },
];

const PREVIEWS = characters.filter((c) =>
  ["european-sweet","european-bold","asian-funny","african-sweet","boy-european-bold","boy-chinese-sweet"].includes(c.id)
);

export default function HomePage() {
  const navigate = useNavigate();
  const ready    = isProfileReady();
  const display  = getDisplayName(getUserProfile());

  const startFlow  = () => navigate(ready ? "/prefer" : "/profile?setup=1&next=/prefer");
  const startRooms = () => navigate(ready ? "/rooms"  : "/profile?setup=1&next=/rooms");
  const pickGender = (g) => { setUserGender(g); navigate("/profile?setup=1&next=/prefer"); };

  return (
    <div className="min-h-screen" style={{ background: "#F8F4FC" }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-0 sm:min-h-[100svh] flex flex-col items-center justify-start sm:justify-center px-5 sm:px-10
        pt-[max(5rem,calc(env(safe-area-inset-top)+4rem))] pb-8 sm:pb-16 overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 100% 70% at 10% 0%, rgba(255,77,184,0.18) 0%, transparent 55%), radial-gradient(ellipse 80% 60% at 90% 5%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(233,30,140,0.10) 0%, transparent 55%), #F8F4FC"
          }} />
          <div className="float-orb w-[28rem] h-[28rem] bg-primary/15 -top-20 -left-20 animate-pulse-slow" />
          <div className="float-orb w-[22rem] h-[22rem] bg-secondary/15 -bottom-10 -right-16 animate-pulse-slow" style={{ animationDelay: "1.6s" }} />
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
{/* Headline */}
          <h1 className="fade-in-soft font-headline font-extrabold text-dark leading-[1.1] mb-5"
            style={{ fontSize: "clamp(2rem, 6vw, 3.4rem)", animationDelay: "0.05s" }}>
            {ready
              ? <>Welcome back{display ? <>,&nbsp;<span className="gradient-text">{display}</span></> : ""} 💕</>
              : <>Chemistry you can <span className="gradient-text">chat with</span></>
            }
          </h1>

          <p className="fade-in-soft text-muted text-base sm:text-lg max-w-md mx-auto mb-5 sm:mb-8 leading-relaxed"
            style={{ animationDelay: "0.12s" }}>
            {ready
              ? "Pick a vibe, choose your companion, and start talking — typed or spoken."
              : "Create your profile, pick a companion, and talk — typed or spoken."}
          </p>

          {/* Feature pills */}
          <div className="fade-in-soft flex flex-wrap justify-center gap-2 mb-6 sm:mb-10" style={{ animationDelay: "0.18s" }}>
            {FEATURES.map((f) => (
              <span key={f.label} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/80 border border-dark/8 text-dark/70 shadow-sm">
                <span>{f.icon}</span>{f.label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="fade-in-soft flex flex-col sm:flex-row items-center justify-center gap-3" style={{ animationDelay: "0.22s" }}>
            <button onClick={startFlow}
              className="btn-glow text-white font-bold px-8 py-4 rounded-2xl text-sm sm:text-base w-full sm:w-auto max-w-xs shadow-xl">
              {ready ? "Start chatting →" : "Create your profile →"}
            </button>
            <button onClick={startRooms}
              className="btn-outline font-semibold px-8 py-4 rounded-2xl text-sm sm:text-base w-full sm:w-auto max-w-xs">
              💬 Chat rooms
            </button>
          </div>

          {/* Avatar strip */}
          <div className="fade-in-soft mt-7 sm:mt-12 flex items-center justify-center gap-1" style={{ animationDelay: "0.28s" }}>
            <div className="flex -space-x-3">
              {PREVIEWS.map((c) => (
                <div key={c.id} className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-primary to-secondary flex-shrink-0">
                  {c.image
                    ? <img src={c.image} alt={c.name} className="w-full h-full object-cover object-top" draggable={false} />
                    : <span className="flex h-full items-center justify-center text-sm">{c.emoji}</span>}
                </div>
              ))}
            </div>
            <p className="ml-3 text-xs text-muted font-medium">24 companions waiting</p>
          </div>
        </div>

        {/* Scroll hint — hide on phone so it doesn't add empty height */}
        <div className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1 opacity-40">
          <span className="text-xs text-muted">scroll</span>
          <svg className="w-4 h-4 text-muted animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROFILE / GET STARTED
      ══════════════════════════════════════════ */}
      <section className="relative px-4 py-10 sm:py-20 overflow-hidden" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.05) 50%, transparent 100%)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-7 sm:mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-3">Step 1</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">
              {ready ? "Ready to meet someone?" : "Start with your profile"}
            </h2>
            <p className="text-muted max-w-sm mx-auto">
              {ready
                ? "You're all set — jump straight into a chat or browse companions."
                : "Just your name and whether you're a boy or girl. Takes 20 seconds."}
            </p>
          </div>

          {ready ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate("/prefer")} className="btn-glow text-white font-bold px-8 py-4 rounded-2xl text-sm">
                Meet someone →
              </button>
              <button onClick={() => navigate("/profile")} className="btn-outline font-semibold px-8 py-4 rounded-2xl text-sm">
                Edit profile
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-8">
                <button onClick={() => navigate("/profile?setup=1&next=/prefer")}
                  className="btn-glow text-white font-bold px-10 py-4 rounded-2xl text-sm shadow-xl">
                  Create your profile →
                </button>
              </div>
              <p className="text-center text-muted text-xs mb-5">Or tell us who you are first</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                {[
                  { gender: "male",   emoji: "🧑", label: "I'm a Boy", color: "from-secondary/10 to-secondary/5", accent: "text-secondary", border: "border-secondary/20 hover:border-secondary/50" },
                  { gender: "female", emoji: "👩", label: "I'm a Girl", color: "from-primary/10 to-primary/5",   accent: "text-primary",   border: "border-primary/20 hover:border-primary/50"   },
                ].map((g) => (
                  <button key={g.gender} onClick={() => pickGender(g.gender)}
                    className={`choice-card rounded-3xl p-7 text-left group bg-gradient-to-br ${g.color} border ${g.border}`}>
                    <span className="text-4xl mb-4 block">{g.emoji}</span>
                    <h3 className={`font-display text-xl font-bold ${g.accent} mb-1`}>{g.label}</h3>
                    <p className="text-muted text-sm">Then finish your profile</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how" className="relative px-4 py-10 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-3">Simple</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">Three taps to chemistry</h2>
            <p className="text-muted max-w-sm mx-auto">No long signup. Just vibe, voice, and a good conversation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.n}
                className="relative bg-white rounded-3xl p-7 border border-dark/6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center text-xl">{step.icon}</span>
                  <span className="font-display text-3xl font-extrabold gradient-text">{step.n}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-dark mb-2">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border border-dark/8 shadow-sm flex items-center justify-center z-10">
                    <svg className="w-3 h-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMPANIONS PREVIEW
      ══════════════════════════════════════════ */}
      <section className="relative px-4 py-10 sm:py-20 overflow-hidden" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(233,30,140,0.04) 50%, transparent 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-3">Companions</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">Someone for every mood</h2>
            <p className="text-muted max-w-sm mx-auto">Sweet, bold, funny — African, Asian, Chinese, European.</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-10">
            {PREVIEWS.map((c) => (
              <button key={c.id} onClick={startFlow} className="group flex flex-col items-center gap-2">
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-surface border border-dark/5 shadow-sm group-hover:shadow-md group-hover:-translate-y-1.5 transition-all duration-300">
                  {c.image
                    ? <img src={c.image} alt={c.name} className="w-full h-full object-cover object-top" draggable={false} />
                    : <span className="flex h-full items-center justify-center text-3xl">{c.emoji}</span>}
                </div>
                <p className="font-display font-bold text-dark text-xs">{c.name}</p>
                <p className="text-muted text-[10px] -mt-1">{c.vibe}</p>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button onClick={startFlow} className="btn-glow text-white font-bold px-8 py-3.5 rounded-2xl text-sm">
              {ready ? "Browse all companions →" : "Create profile to start →"}
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CHAT DEMO
      ══════════════════════════════════════════ */}
      <section className="relative px-4 py-10 sm:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-4">Chat & voice</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-5 leading-tight">
              Type it. Say it.<br />Feel it.
            </h2>
            <p className="text-muted leading-relaxed mb-8">
              Hit the mic and talk naturally — they listen, reply, and speak back.
              Ask for a photo and they'll share one, step by step.
            </p>
            <div className="space-y-4">
              {[
                { icon: "🎙️", title: "Voice in & out",      desc: "Speak naturally, hear them reply in your browser"  },
                { icon: "📸", title: "Photo sharing",        desc: "They tease first, then share — just like real flirting" },
                { icon: "⚡", title: "Instant personality",  desc: "Every reply matches their vibe — sweet, bold, or funny" },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-dark/6 shadow-sm">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <p className="font-display font-bold text-dark text-sm">{f.title}</p>
                    <p className="text-muted text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock chat */}
          <div className="mock-chat rounded-3xl overflow-hidden animate-float">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-dark/6">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20">
                <img src="/images/european_bold/1.png" alt="Isabella" className="w-full h-full object-cover object-top" draggable={false} />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-dark text-sm">Isabella</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <p className="text-muted text-xs">Speaking…</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">Bold</span>
            </div>
            {/* Messages */}
            <div className="px-5 py-4 space-y-3 bg-white/60">
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-primary/20">
                  <img src="/images/european_bold/1.png" alt="" className="w-full h-full object-cover object-top" draggable={false} />
                </div>
                <div className="bg-white border border-dark/8 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-dark shadow-sm max-w-[80%]">
                  Mmm, hi. I don't whisper — I flirt. Ready?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm max-w-[75%] shadow-sm">
                  Share your pic? 📸
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-primary/20">
                  <img src="/images/european_bold/1.png" alt="" className="w-full h-full object-cover object-top" draggable={false} />
                </div>
                <div className="bg-white border border-dark/8 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-dark shadow-sm max-w-[80%] space-y-2">
                  <div className="rounded-xl overflow-hidden w-32">
                    <img src="/images/european_bold/2.png" alt="Shared" className="w-full h-auto object-cover object-top" draggable={false} />
                  </div>
                  <p>Okay… here's one for you 😘</p>
                </div>
              </div>
              {/* Typing */}
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-primary/20">
                  <img src="/images/european_bold/1.png" alt="" className="w-full h-full object-cover object-top" draggable={false} />
                </div>
                <div className="bg-white border border-dark/8 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                  </div>
                </div>
              </div>
            </div>
            {/* Input bar */}
            <div className="px-4 py-3 border-t border-dark/6 flex items-center gap-2 bg-white/80">
              <div className="flex-1 bg-dark/4 rounded-xl px-3 py-2 text-xs text-muted">Message Isabella…</div>
              <div className="size-8 aspect-square rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#E91E8C,#7C3AED)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" className="block text-white" fill="currentColor" aria-hidden>
                  <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CHAT ROOMS
      ══════════════════════════════════════════ */}
      <section className="relative px-4 py-10 sm:py-20 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(233,30,140,0.06) 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-4">Group flirt</span>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-4">Open a chat room</h2>
          <p className="text-muted mb-8 max-w-md mx-auto leading-relaxed">
            Mix girls and boys in one lounge — pick a flirty theme and keep the banter going together.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["Blush Lounge 🌸","Midnight Vibes 🌙","Velvet Room 💜","Champagne 🥂","Summer Heat ☀️"].map((t) => (
              <span key={t} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-dark/8 text-dark/70 shadow-sm">{t}</span>
            ))}
          </div>
          <button onClick={startRooms} className="btn-glow text-white font-bold px-10 py-4 rounded-2xl text-sm shadow-xl">
            {ready ? "Create a room →" : "Create profile first"}
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="relative px-4 py-14 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="float-orb w-80 h-80 bg-primary/12 top-0 left-1/4 animate-pulse-slow" />
          <div className="float-orb w-64 h-64 bg-secondary/12 bottom-0 right-1/4 animate-pulse-slow" style={{ animationDelay: "1.2s" }} />
        </div>
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <h2 className="font-headline text-4xl sm:text-5xl font-extrabold text-dark mb-4 leading-tight">
            Ready when<br />you are
          </h2>
          <p className="text-muted mb-10 text-lg">
            {ready ? "One choice away from a conversation that actually clicks." : "Create your profile — then the chemistry starts."}
          </p>
          <button onClick={startFlow} className="btn-glow text-white font-bold px-12 py-5 rounded-2xl text-base shadow-2xl">
            {ready ? "Enter Talk2Me →" : "Get started — it's free →"}
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="px-6 py-10 border-t border-dark/6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo className="text-3xl sm:text-4xl" />
          <p className="text-muted text-xs">Chat · Voice · Chemistry · © {new Date().getFullYear()} Talk2Me</p>
          <div className="flex gap-4 text-xs text-muted">
            <button onClick={() => navigate("/about")} className="hover:text-primary transition-colors">About</button>
            <button onClick={() => navigate("/rooms")} className="hover:text-primary transition-colors">Rooms</button>
            <button onClick={() => navigate("/profile")} className="hover:text-primary transition-colors">Profile</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
