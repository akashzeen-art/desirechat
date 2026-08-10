import { useNavigate } from "react-router-dom";
import { setUserGender } from "../data/session";
import { characters } from "../data/characters";
import { isProfileReady, getDisplayName, getUserProfile } from "../data/userProfile";
import BrandLogo from "../components/BrandLogo";

const STEPS = [
  {
    n: "01",
    title: "Create your profile",
    desc: "Name, nickname, where you’re from — so every chat feels personal.",
  },
  {
    n: "02",
    title: "Pick your match",
    desc: "Choose girls or boys, then vibe and style that fit your mood.",
  },
  {
    n: "03",
    title: "Chat & talk",
    desc: "Type or use your mic. They reply with voice — like a real convo.",
  },
];

const PREVIEWS = characters.filter((c) =>
  ["european-sweet", "european-bold", "asian-funny", "boy-european-bold", "boy-chinese-sweet", "boy-asian-funny"].includes(c.id)
);

export default function HomePage() {
  const navigate = useNavigate();
  const ready = isProfileReady();
  const display = getDisplayName(getUserProfile());

  const startFlow = () => {
    if (!ready) {
      navigate("/profile?setup=1&next=/prefer");
      return;
    }
    navigate("/prefer");
  };

  const startRooms = () => {
    if (!ready) {
      navigate("/profile?setup=1&next=/rooms");
      return;
    }
    navigate("/rooms");
  };

  const pickGender = (gender) => {
    setUserGender(gender);
    // Prefill gender on profile form via session
    navigate("/profile?setup=1&next=/prefer");
  };

  return (
    <div className="min-h-screen hero-bg">
      <section className="relative min-h-[100svh] flex items-center justify-center px-6 sm:px-10 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-orb w-[32rem] h-[32rem] bg-primary/20 -top-24 -left-24 animate-pulse-slow" />
          <div className="float-orb w-[26rem] h-[26rem] bg-secondary/20 bottom-0 -right-20 animate-pulse-slow" style={{ animationDelay: "1.4s" }} />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='72' height='72' viewBox='0 0 72 72' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2314181F' stroke-opacity='0.04' stroke-width='1'%3E%3Cpath d='M0 36h72M36 0v72'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
          <div className="fade-in-soft mb-8 flex justify-center">
            <BrandLogo className="text-4xl sm:text-5xl md:text-6xl" />
          </div>
          <h1 className="fade-in-soft hero-title text-dark text-[1.9rem] sm:text-[2.75rem] md:text-[3.35rem] mb-5">
            Chemistry you can chat with
          </h1>
          <p className="fade-in-soft text-muted text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed" style={{ animationDelay: "0.1s" }}>
            {ready
              ? `Welcome back${display ? `, ${display}` : ""} — pick a vibe and start talking.`
              : "First create your profile, then pick a companion and talk — typed or spoken."}
          </p>
          <div className="fade-in-soft flex flex-col sm:flex-row items-center justify-center gap-3" style={{ animationDelay: "0.18s" }}>
            <button onClick={startFlow} className="btn-glow text-white font-semibold px-8 py-3.5 rounded-2xl text-sm sm:text-base w-full sm:w-auto max-w-xs">
              {ready ? "Start chatting" : "Create your profile"}
            </button>
            <button
              onClick={startRooms}
              className="btn-outline font-semibold px-8 py-3.5 rounded-2xl text-sm sm:text-base w-full sm:w-auto max-w-xs text-center"
            >
              Chat rooms
            </button>
          </div>
        </div>
      </section>

      <section id="who" className="relative px-4 py-20 section-warm">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-3">Step 1</p>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">
            {ready ? "Ready to meet someone?" : "Create your profile"}
          </h2>
          <p className="text-muted mb-10 max-w-md mx-auto">
            {ready
              ? "You’re set — choose who you want to talk to, or jump into a room."
              : "Add your name and whether you’re a boy or a girl. Companions will use this from the first hello."}
          </p>

          {ready ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate("/prefer")} className="btn-glow text-white font-semibold px-8 py-3.5 rounded-2xl text-sm">
                Meet someone
              </button>
              <button onClick={() => navigate("/profile")} className="btn-outline font-semibold px-8 py-3.5 rounded-2xl text-sm">
                Edit profile
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/profile?setup=1&next=/prefer")}
                className="btn-glow text-white font-semibold px-8 py-3.5 rounded-2xl text-sm mb-8"
              >
                Create your profile
              </button>
              <p className="text-muted text-xs mb-4">Or pick who you are first</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto">
                <button onClick={() => pickGender("male")} className="choice-card rounded-3xl p-8 text-left group">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center mb-5 font-display font-bold text-lg group-hover:scale-105 transition-transform">
                    B
                  </div>
                  <h3 className="font-display text-2xl font-bold text-dark mb-1">I&apos;m a Boy</h3>
                  <p className="text-muted text-sm">Then finish your profile</p>
                </button>
                <button onClick={() => pickGender("female")} className="choice-card rounded-3xl p-8 text-left group">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-5 font-display font-bold text-lg group-hover:scale-105 transition-transform">
                    G
                  </div>
                  <h3 className="font-display text-2xl font-bold text-dark mb-1">I&apos;m a Girl</h3>
                  <p className="text-muted text-sm">Then finish your profile</p>
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="relative px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-3">Group flirt</p>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">
            Open a chat room
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            Mix girls and boys in one lounge — pick a flirty theme and keep the banter going together.
          </p>
          <button
            onClick={startRooms}
            className="btn-glow text-white font-semibold px-8 py-3.5 rounded-2xl text-sm"
          >
            {ready ? "Create a room" : "Create profile first"}
          </button>
        </div>
      </section>

      <section id="how" className="relative px-4 py-20 section-warm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-3">Simple</p>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">
              Three taps to chemistry
            </h2>
            <p className="text-muted max-w-md mx-auto">
              No long signup. Just vibe, voice, and a good conversation.
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

      <section className="relative px-4 py-20 section-warm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-3">Companions</p>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">
              Someone for every mood
            </h2>
            <p className="text-muted max-w-md mx-auto">
              Sweet, bold, funny — African, Asian, Chinese, European, and more.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {PREVIEWS.map((c) => (
              <button key={c.id} onClick={startFlow} className="group text-center">
                <div className="mx-auto mb-3 w-20 h-20 rounded-2xl overflow-hidden bg-surface border border-dark/5 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover object-top" draggable={false} />
                  ) : (
                    <span className="flex h-full items-center justify-center text-2xl">{c.emoji}</span>
                  )}
                </div>
                <p className="font-display font-bold text-dark text-sm">{c.name}</p>
                <p className="text-muted text-xs mt-0.5">{c.regionLabel || c.vibe}</p>
              </button>
            ))}
          </div>

          <div className="text-center mt-10">
            <button onClick={startFlow} className="btn-glow text-white font-semibold px-7 py-3 rounded-2xl text-sm">
              {ready ? "Meet someone" : "Create your profile"}
            </button>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-3">Chat & voice</p>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-4">
              Type it. Say it. Feel it.
            </h2>
            <p className="text-muted leading-relaxed mb-6">
              Hit the mic and talk naturally — they listen, reply, and speak back.
              Ask for a photo and they&apos;ll share one, step by step.
            </p>
            <ul className="space-y-3 text-sm text-dark/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                Instant replies with real personality
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                Voice in and voice out in your browser
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                Soft, playful energy — never awkward silence
              </li>
            </ul>
          </div>

          <div className="mock-chat rounded-3xl p-5 sm:p-6 space-y-4 animate-float">
            <div className="flex items-center gap-3 pb-3 border-b border-dark/8">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-surface">
                <img src="/images/european_bold/1.png" alt="Isabella" className="w-full h-full object-cover object-top" draggable={false} />
              </div>
              <div>
                <p className="font-display font-bold text-dark text-sm">Isabella</p>
                <p className="text-muted text-xs">Speaking…</p>
              </div>
            </div>
            <div className="bg-white border border-dark/8 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-dark max-w-[90%]">
              Mmm, hi. I don&apos;t whisper — I flirt. Ready?
            </div>
            <div className="bg-primary text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm max-w-[85%] ml-auto">
              Share your pic?
            </div>
            <div className="bg-white border border-dark/8 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-dark max-w-[90%] space-y-2">
              <div className="rounded-xl overflow-hidden max-w-[140px]">
                <img src="/images/european_bold/2.png" alt="Shared" className="w-full h-auto object-cover object-top" draggable={false} />
              </div>
              <p>Okay… here&apos;s one for you.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-20 section-warm">
        <div className="max-w-2xl mx-auto text-center">
          <BrandLogo className="text-3xl sm:text-4xl justify-center mb-6" />
          <h2 className="font-headline text-3xl sm:text-5xl font-extrabold text-dark mb-4">
            Ready when you are
          </h2>
          <p className="text-muted mb-8">
            {ready ? "One choice away from a conversation that actually clicks." : "Create your profile — then the chemistry starts."}
          </p>
          <button onClick={startFlow} className="btn-glow text-white font-semibold px-10 py-4 rounded-2xl">
            {ready ? "Enter DesireChat" : "Create your profile"}
          </button>
        </div>
      </section>

      <footer className="px-4 py-8 border-t border-dark/8 text-center">
        <div className="flex justify-center mb-2">
          <BrandLogo className="text-xl" />
        </div>
        <p className="text-muted text-xs">Chat · Voice · Chemistry</p>
      </footer>
    </div>
  );
}
