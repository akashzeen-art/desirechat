import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const blockedRef = useRef(false);

  const clearCover = () => {
    if (document.hidden) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    blockedRef.current = false;
    setBlocked(false);
    document.documentElement.classList.remove("shot-block");
  };

  const cover = (holdMs = 1600) => {
    blockedRef.current = true;
    setBlocked(true);
    document.documentElement.classList.add("shot-block");
    if (timerRef.current) clearTimeout(timerRef.current);
    if (document.hidden) return;
    timerRef.current = setTimeout(() => {
      clearCover();
    }, Math.max(holdMs, 400));
  };

  useEffect(() => {
    clearCover();

    const onKey = (e) => {
      if (isScreenshotShortcut(e)) cover(2500);
    };

    const onVisibility = () => {
      if (document.hidden) {
        // App switcher / recents / many phone screenshot flows
        cover(isTouchDevice() ? 12000 : 1600);
      } else {
        timerRef.current = setTimeout(() => clearCover(), isTouchDevice() ? 900 : 250);
      }
    };

    const onBlur = () => {
      if (isTouchDevice()) return;
      cover(900);
    };

    const onFocus = () => {
      if (!document.hidden) {
        timerRef.current = setTimeout(() => clearCover(), 200);
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
      className="shot-block-layer fixed inset-0 z-[2147483647] bg-black"
      style={{ pointerEvents: "auto" }}
      onClick={clearCover}
      onTouchStart={clearCover}
    />,
    document.body
  );
}
