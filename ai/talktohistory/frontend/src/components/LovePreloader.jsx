import { useEffect, useState, useMemo } from "react";
import BrandLogo from "./BrandLogo";
import { getCharacterById } from "../data/characters";
import { useI18n } from "../i18n/LanguageContext";

const emmaImg = getCharacterById("european-sweet")?.image || "/images/european_sweet/1.jpg";
const noahImg = getCharacterById("boy-european-sweet")?.image || "/images/boyss/european_sweet/1.jpg";

export default function LovePreloader({ durationMs = 4000, onDone }) {
  const { t } = useI18n();
  const SCRIPT = useMemo(() => [
    { side: "left", text: t("preloader.line1") },
    { side: "right", text: t("preloader.line2") },
    { side: "left", text: t("preloader.line3") },
  ], [t]);
  const TYPING_MS = 700;
  const BUBBLE_GAP = 320;
  const LOGO_DELAY = SCRIPT.length * (TYPING_MS + BUBBLE_GAP) + 200;

  const [phase, setPhase] = useState("show");
  const [progress, setProgress] = useState(0);
  const [step, setStep]         = useState(-1);       // which script line is active
  const [typing, setTyping]     = useState(false);    // typing dots visible
  const [logoIn, setLogoIn]     = useState(false);

  // Drive the chat script
  useEffect(() => {
    const timers = [];
    let cursor = 0;

    const next = () => {
      if (cursor >= SCRIPT.length) return;
      const i = cursor++;
      // show typing dots
      timers.push(setTimeout(() => {
        setTyping(true);
        setStep(i);
      }, i * (TYPING_MS + BUBBLE_GAP)));
      // replace dots with bubble
      timers.push(setTimeout(() => {
        setTyping(false);
      }, i * (TYPING_MS + BUBBLE_GAP) + TYPING_MS));
    };

    for (let i = 0; i < SCRIPT.length; i++) next();

    timers.push(setTimeout(() => setLogoIn(true), LOGO_DELAY));

    return () => timers.forEach(clearTimeout);
  }, [SCRIPT]);

  // Progress bar
  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / durationMs) * 100);
      setProgress(p);
      if (p >= 100) clearInterval(tick);
    }, 40);
    return () => clearInterval(tick);
  }, [durationMs]);

  // Fade out
  useEffect(() => {
    const h = setTimeout(() => setPhase("hide"), durationMs);
    const d = setTimeout(() => { setPhase("gone"); onDone?.(); }, durationMs + 650);
    return () => { clearTimeout(h); clearTimeout(d); };
  }, [durationMs, onDone]);

  if (phase === "gone") return null;

  // Bubbles that have fully appeared (typing done)
  const visibleBubbles = SCRIPT.slice(0, typing ? step : step + 1);
  // Current typing side
  const typingSide = typing && step >= 0 ? SCRIPT[step].side : null;

  return (
    <div
      className={`preloader-root${phase === "hide" ? " preloader-root--out" : ""}`}
      aria-label={t("preloader.aria")}
      role="status"
    >
      {/* Background orbs */}
      <div className="preloader-orb preloader-orb--pink" />
      <div className="preloader-orb preloader-orb--purple" />

      <div className="preloader-stage">

        {/* ── Avatars row ── */}
        <div className="preloader-avatars">
          {/* Left avatar — girl */}
          <div className="preloader-avatar preloader-avatar--left">
            <div className="preloader-avatar__ring">
              <img src={emmaImg} alt="Emma" loading="eager" decoding="async" draggable={false} />
            </div>
            <span className="preloader-avatar__name">Emma</span>
          </div>

          {/* Heart in the middle */}
          <div className="preloader-heart">💗</div>

          {/* Right avatar — boy */}
          <div className="preloader-avatar preloader-avatar--right">
            <div className="preloader-avatar__ring">
              <img src={noahImg} alt="Noah" loading="eager" decoding="async" draggable={false} />
            </div>
            <span className="preloader-avatar__name">Noah</span>
          </div>
        </div>

        {/* ── Chat bubbles ── */}
        <div className="preloader-chat">
          {visibleBubbles.map((line, i) => (
            <div
              key={i}
              className={`preloader-bubble preloader-bubble--${line.side}`}
            >
              {line.text}
            </div>
          ))}

          {/* Typing indicator */}
          {typingSide && (
            <div className={`preloader-bubble preloader-bubble--${typingSide} preloader-bubble--typing`}>
              <span className="preloader-dot" />
              <span className="preloader-dot" />
              <span className="preloader-dot" />
            </div>
          )}
        </div>

        {/* ── Logo + bar ── */}
        <div className={`preloader-logo-wrap${logoIn ? " preloader-logo-wrap--in" : ""}`}>
          <BrandLogo className="text-4xl sm:text-5xl justify-center" />
          <p className="preloader-tagline">{t("preloader.tagline")}</p>
          <div className="preloader-bar">
            <div className="preloader-bar__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

      </div>
    </div>
  );
}
