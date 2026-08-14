import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { useI18n } from "../i18n/LanguageContext";

export default function AboutPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const highlights = [
    { title: t("about.realChat"), desc: t("about.realChatDesc") },
    { title: t("about.voiceBoth"), desc: t("about.voiceBothDesc") },
    { title: t("about.yourVibe"), desc: t("about.yourVibeDesc") },
  ];

  const steps = [
    { title: t("about.sayWho"), desc: t("about.sayWhoDesc") },
    { title: t("about.chooseWho"), desc: t("about.chooseWhoDesc") },
    { title: t("about.chatTalk"), desc: t("about.chatTalkDesc") },
  ];

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
          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-4">{t("about.tag")}</p>
          <h1 className="font-headline text-4xl sm:text-6xl font-extrabold text-dark mb-4">
            {t("about.title")}
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-xl mx-auto">
            {t("about.intro")}
          </p>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
          {highlights.map((item) => (
            <div key={item.title} className="bg-white border border-dark/6 rounded-2xl p-6">
              <h2 className="font-display font-bold text-dark mb-2">{item.title}</h2>
              <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto space-y-4">
          {steps.map((item) => (
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
              {t("about.enter")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
