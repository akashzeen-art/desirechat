import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hero-bg overflow-x-hidden">
      <section className="relative pt-[max(7rem,calc(env(safe-area-inset-top)+5.5rem))] pb-16 px-4">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="float-orb w-80 h-80 bg-secondary/20 top-20 left-1/4 animate-pulse-slow" />
          <div className="float-orb w-64 h-64 bg-primary/15 bottom-10 right-10 animate-pulse-slow" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <BrandLogo className="text-3xl sm:text-4xl" />
          </div>
          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-4">About</p>
          <h1 className="font-headline text-4xl sm:text-6xl font-extrabold text-dark mb-4">
            What is Talk2Me?
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-xl mx-auto">
            A chat & voice space where you pick your vibe, choose a companion,
            and start a conversation that matches the mood.
          </p>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
          {[
            { title: "Real chat energy", desc: "Short, warm replies that feel like texting someone you like." },
            { title: "Voice both ways", desc: "Speak into the mic and hear them talk back in your browser." },
            { title: "Your kind of vibe", desc: "Sweet, bold, funny — plus region styles for girls." },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-dark/6 rounded-2xl p-6">
              <h2 className="font-display font-bold text-dark mb-2">{item.title}</h2>
              <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              title: "Say who you are",
              desc: "Boy or girl — we start with you, so the flow feels personal from the first tap.",
            },
            {
              title: "Choose who to talk to",
              desc: "Want girls? Pick vibe and region. Want boys? Pick a companion that fits your mood.",
            },
            {
              title: "Chat, talk, share",
              desc: "Type or use your mic. Ask for a photo and they'll share from their gallery — until they run out.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-dark/6 p-6">
              <h2 className="font-display font-bold text-dark text-lg mb-2">{item.title}</h2>
              <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}

          <div className="text-center pt-6">
            <button
              onClick={() => navigate("/")}
              className="btn-glow text-white font-semibold px-8 py-3 rounded-2xl"
            >
              Enter Talk2Me
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
