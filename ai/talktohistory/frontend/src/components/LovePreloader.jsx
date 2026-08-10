import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";

export default function LovePreloader({ durationMs = 3500, onDone }) {
  const [phase, setPhase] = useState("show");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / durationMs) * 100);
      setProgress(p);
      if (p >= 100) clearInterval(tick);
    }, 40);

    const hideTimer = setTimeout(() => setPhase("hide"), durationMs);
    const doneTimer = setTimeout(() => {
      setPhase("gone");
      onDone?.();
    }, durationMs + 650);

    return () => {
      clearInterval(tick);
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, [durationMs, onDone]);

  if (phase === "gone") return null;

  return (
    <div
      className={`love-preloader ${phase === "hide" ? "love-preloader--out" : ""}`}
      aria-label="Loading DesireChat"
      role="status"
    >
      <div className="love-preloader__glow" />
      <div className="love-preloader__center">
        <BrandLogo className="text-4xl sm:text-5xl justify-center" />
        <p className="love-preloader__tagline">Warming up the chemistry…</p>
        <div className="love-preloader__bar" aria-hidden="true">
          <div className="love-preloader__bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
