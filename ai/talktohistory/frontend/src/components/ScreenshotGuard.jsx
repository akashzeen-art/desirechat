import { useEffect, useRef, useState } from "react";

function isScreenshotShortcut(e) {
  if (e.key === "PrintScreen" || e.code === "PrintScreen" || e.key === "F13") return true;
  const key = (e.key || "").toLowerCase();
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && ["s", "3", "4", "5", "6"].includes(key)) return true;
  return false;
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

export default function ScreenshotGuard() {
  const [blocked, setBlocked] = useState(false);
  const timerRef = useRef(null);

  const clearCover = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setBlocked(false);
    document.documentElement.classList.remove("shot-block");
  };

  const cover = (holdMs = 1600) => {
    setBlocked(true);
    document.documentElement.classList.add("shot-block");
    if (timerRef.current) clearTimeout(timerRef.current);
    // Always auto-clear — never leave mobile stuck on black
    timerRef.current = setTimeout(() => {
      clearCover();
    }, Math.max(holdMs, 400));
  };

  useEffect(() => {
    // Clear any leftover black screen from a previous session
    clearCover();

    const onKey = (e) => {
      if (isScreenshotShortcut(e)) cover(2200);
    };

    const onVisibility = () => {
      if (document.hidden) {
        // App switcher / tab hide — brief black only
        cover(isTouchDevice() ? 600 : 1200);
      } else {
        clearCover();
      }
    };

    // Blur fires constantly on mobile (keyboard, URL bar, taps) — desktop only
    const onBlur = () => {
      if (isTouchDevice()) return;
      cover(900);
    };

    const onFocus = () => clearCover();
    const onPointer = () => {
      if (document.documentElement.classList.contains("shot-block")) clearCover();
    };

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", clearCover);
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("touchstart", onPointer, true);

    return () => {
      clearCover();
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", clearCover);
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("touchstart", onPointer, true);
    };
  }, []);

  if (!blocked) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[2147483647] bg-black"
      style={{ pointerEvents: "auto" }}
      onClick={clearCover}
      onTouchStart={clearCover}
    />
  );
}
