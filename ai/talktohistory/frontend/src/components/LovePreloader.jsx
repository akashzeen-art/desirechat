import { useEffect, useState } from "react";

const HEARTS = [
  { left: "8%", delay: "0s", size: "1.2rem", dur: "4.2s" },
  { left: "18%", delay: "0.6s", size: "0.9rem", dur: "5s" },
  { left: "28%", delay: "1.2s", size: "1.4rem", dur: "3.8s" },
  { left: "42%", delay: "0.3s", size: "1rem", dur: "4.6s" },
  { left: "55%", delay: "1.5s", size: "1.3rem", dur: "4s" },
  { left: "68%", delay: "0.9s", size: "0.85rem", dur: "5.2s" },
  { left: "78%", delay: "0.2s", size: "1.15rem", dur: "3.6s" },
  { left: "88%", delay: "1.1s", size: "1rem", dur: "4.4s" },
  { left: "12%", delay: "2s", size: "0.75rem", dur: "4.8s" },
  { left: "72%", delay: "2.4s", size: "1.05rem", dur: "3.9s" },
];

export default function LovePreloader({ durationMs = 6000, onDone }) {
  const [phase, setPhase] = useState("show"); // show | hide | gone
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
    }, durationMs + 700);

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
      aria-label="Loading Spark"
      role="status"
    >
      <div className="love-preloader__glow" />

      {HEARTS.map((h, i) => (
        <span
          key={i}
          className="love-float-heart"
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.dur,
            fontSize: h.size,
          }}
        >
          {i % 3 === 0 ? "💕" : i % 2 === 0 ? "❤️" : "💗"}
        </span>
      ))}

      <div className="love-preloader__center">
        <div className="love-heart-beat" aria-hidden="true">
          <svg viewBox="0 0 32 29" className="love-heart-svg">
            <path
              d="M16 28s-1.2-.9-3.1-2.4C7.6 21.2 2 16.4 2 10.5 2 6.4 5.1 3.5 9 3.5c2.2 0 4.2 1.1 5.5 2.8C15.8 4.6 17.8 3.5 20 3.5c3.9 0 7 2.9 7 7 0 5.9-5.6 10.7-10.9 15.1C17.2 27.1 16 28 16 28z"
              fill="currentColor"
            />
          </svg>
        </div>

        <p className="font-display text-4xl sm:text-5xl font-extrabold gradient-text love-preloader__brand">
          Spark
        </p>
        <p className="love-preloader__tagline">Finding your chemistry…</p>

        <div className="love-preloader__bar" aria-hidden="true">
          <div className="love-preloader__bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
