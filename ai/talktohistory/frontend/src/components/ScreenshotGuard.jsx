import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function isScreenshotShortcut(e) {
  if (e.key === "PrintScreen" || e.code === "PrintScreen" || e.key === "F13") return true;
  const key = (e.key || "").toLowerCase();
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && ["s", "3", "4", "5", "6"].includes(key)) return true;
  return false;
}

function isPhoneView() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px), (hover: none) and (pointer: coarse)").matches;
}

export default function ScreenshotGuard() {
  const [blocked, setBlocked] = useState(false);
  const timerRef = useRef(null);
  const blockedRef = useRef(false);
  const hiddenRef = useRef(false);

  const clearCover = () => {
    if (hiddenRef.current) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    blockedRef.current = false;
    setBlocked(false);
    document.documentElement.classList.remove("shot-block");
  };

  const showBlack = () => {
    blockedRef.current = true;
    setBlocked(true);
    document.documentElement.classList.add("shot-block");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const coverFor = (holdMs = 1600) => {
    showBlack();
    if (hiddenRef.current) return;
    timerRef.current = setTimeout(() => clearCover(), Math.max(holdMs, 400));
  };

  useEffect(() => {
    clearCover();

    const onKey = (e) => {
      if (isScreenshotShortcut(e)) coverFor(isPhoneView() ? 4000 : 2500);
    };

    const onVisibility = () => {
      hiddenRef.current = document.hidden;
      if (document.hidden) {
        // Phone screenshots / app switcher / recents — stay black until user is back
        showBlack();
        return;
      }
      // Stay black briefly after return so the capture can't grab chat on the way back
      timerRef.current = setTimeout(() => clearCover(), isPhoneView() ? 1500 : 350);
    };

    const onBlur = () => {
      if (isPhoneView() || document.hidden) showBlack();
      else coverFor(900);
    };

    const onFocus = () => {
      hiddenRef.current = false;
      if (!document.hidden) {
        timerRef.current = setTimeout(() => clearCover(), isPhoneView() ? 1200 : 250);
      }
    };

    const onPointer = () => {
      if (document.hidden) return;
      if (blockedRef.current) clearCover();
    };

    const onContext = (e) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onFocus);
    window.addEventListener("pagehide", () => {
      hiddenRef.current = true;
      showBlack();
    });
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("touchstart", onPointer, true);
    document.addEventListener("contextmenu", onContext, true);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.documentElement.classList.remove("shot-block");
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onFocus);
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("touchstart", onPointer, true);
      document.removeEventListener("contextmenu", onContext, true);
    };
  }, []);

  if (!blocked || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="presentation"
      aria-hidden
      className="shot-block-layer fixed inset-0 z-[2147483647] bg-black touch-none"
      style={{ pointerEvents: "auto", WebkitTouchCallout: "none" }}
      onClick={clearCover}
      onTouchStart={clearCover}
    />,
    document.body
  );
}
