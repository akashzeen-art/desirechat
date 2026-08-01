import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hero-bg overflow-x-hidden">
      <section className="relative pt-[max(7rem,calc(env(safe-area-inset-top)+5.5rem))] pb-16 px-4">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="float-orb w-80 h-80 bg-secondary/30 top-20 left-1/4 animate-pulse-slow" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <BrandLogo className="h-14 sm:h-16 w-auto" />
          </div>
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">About</p>
          <h1 className="font-headline text-4xl sm:text-6xl font-extrabold text-dark mb-4">
            What is Flirt Net?
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-xl mx-auto">
            A playful chat & voice space where you pick your vibe, choose who to flirt with,
            and start a conversation that matches the mood.
          </p>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { emoji: "💬", title: "Real chat energy", desc: "Short, flirty replies that feel like texting someone cute." },
            { emoji: "🎙️", title: "Voice both ways", desc: "Speak into the mic and hear them talk back." },
            { emoji: "✨", title: "Your kind of vibe", desc: "Sweet, bold, mysterious — match the mood you want." },
          ].map((item) => (
            <div key={item.title} className="bg-white/80 border border-primary/10 rounded-2xl p-6">
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h2 className="font-display font-bold text-dark mb-2">{item.title}</h2>
              <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto space-y-5">
          {[
            {
              title: "Say who you are",
              desc: "Boy or girl — we start with you, so the flow feels personal from the first tap.",
            },
            {
              title: "Choose who to flirt with",
              desc: "Want girls? You get girl avatars. Want boys? You get boy avatars. Simple.",
            },
            {
              title: "Chat & talk",
              desc: "Type or use your mic. Companions reply with voice so it feels like a real conversation.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-primary/10 p-6">
              <h2 className="font-display font-bold text-dark text-lg mb-2">{item.title}</h2>
              <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}

          <div className="text-center pt-6">
            <button
              onClick={() => navigate("/")}
              className="btn-glow text-white font-semibold px-8 py-3 rounded-2xl"
            >
              Start with Flirt Net
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
