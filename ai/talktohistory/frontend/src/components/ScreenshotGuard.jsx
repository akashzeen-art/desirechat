import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Best-effort screenshot deterrent for web.
 * Desktop shortcuts / app-switcher / blur can be blacked out.
 * Phone Power+Volume screenshots often give the page ZERO events — we still
 * harden CSS + listen for every mobile signal that does fire.
 */

function isScreenshotShortcut(e) {
  const key = (e.key || "").toLowerCase();
  const code = e.code || "";

  if (key === "printscreen" || code === "PrintScreen" || key === "f13" || code === "F13") {
    return true;
  }
  if ((e.metaKey || e.getModifierState?.("OS") || e.getModifierState?.("Win")) && e.shiftKey && key === "s") {
    return true;
  }
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && ["s", "3", "4", "5", "6"].includes(key)) {
    return true;
  }
  return false;
}

function isMobileUa() {
  return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );
}

async function scrubClipboardImage() {
  try {
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText("");
  } catch {
    /* ignore */
  }
}

export default function ScreenshotGuard() {
  const timerRef = useRef(null);
  const blockedRef = useRef(false);
  const hiddenRef = useRef(false);
  const unlockAtRef = useRef(0);
  const mobile = useRef(typeof navigator !== "undefined" ? isMobileUa() : false);

  const paintBlack = (on) => {
    const root = document.documentElement;
    if (on) {
      root.classList.add("shot-block");
      root.setAttribute("data-shot-block", "1");
      // Force sync reflow so paint happens before next OS frame (helps app switcher)
      void root.offsetHeight;
    } else {
      root.classList.remove("shot-block");
      root.removeAttribute("data-shot-block");
    }
  };

  const clearCover = () => {
    if (hiddenRef.current) return;
    if (Date.now() < unlockAtRef.current) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    blockedRef.current = false;
    paintBlack(false);
  };

  const showBlack = (holdMs) => {
    blockedRef.current = true;
    paintBlack(true);
    const hold = holdMs ?? (mobile.current ? 4500 : 2800);
    unlockAtRef.current = Date.now() + Math.min(hold, 1200);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!hiddenRef.current) {
      timerRef.current = setTimeout(() => clearCover(), hold);
    }
  };

  useEffect(() => {
    mobile.current = isMobileUa();
    paintBlack(false);

    const onKey = (e) => {
      if (!isScreenshotShortcut(e)) return;
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch {
        /* ignore */
      }
      showBlack(mobile.current ? 5000 : 3500);
      scrubClipboardImage();
    };

    const onVisibility = () => {
      const hidden = Boolean(document.hidden || document.webkitHidden);
      hiddenRef.current = hidden;
      if (hidden) {
        showBlack(mobile.current ? 6000 : 4000);
        return;
      }
      unlockAtRef.current = Date.now() + 800;
      timerRef.current = setTimeout(() => clearCover(), mobile.current ? 2200 : 1400);
    };

    const onBlur = () => {
      showBlack(mobile.current ? 5000 : 3000);
    };

    const onFocus = () => {
      if (document.hidden || document.webkitHidden) return;
      hiddenRef.current = false;
      unlockAtRef.current = Date.now() + 600;
      timerRef.current = setTimeout(() => clearCover(), mobile.current ? 1800 : 900);
    };

    const onPointer = () => {
      if (document.hidden || document.webkitHidden) return;
      if (!blockedRef.current) return;
      if (Date.now() < unlockAtRef.current) return;
      if (document.hasFocus()) clearCover();
    };

    const onContext = (e) => {
      e.preventDefault();
    };

    const onDragStart = (e) => {
      if (e.target?.closest?.("img, video, canvas")) e.preventDefault();
    };

    const onPageHide = () => {
      hiddenRef.current = true;
      showBlack(8000);
    };

    const onPageShow = () => {
      hiddenRef.current = false;
      unlockAtRef.current = Date.now() + 700;
      timerRef.current = setTimeout(() => clearCover(), 1500);
    };

    const onFreeze = () => {
      hiddenRef.current = true;
      showBlack(8000);
    };

    const onResume = () => {
      hiddenRef.current = false;
      timerRef.current = setTimeout(() => clearCover(), 1600);
    };

    // Capture phase + bubble for stubborn mobile WebViews
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("visibilitychange", onVisibility, true);
    document.addEventListener("webkitvisibilitychange", onVisibility, true);
    window.addEventListener("blur", onBlur, true);
    window.addEventListener("focus", onFocus, true);
    window.addEventListener("pageshow", onPageShow, true);
    window.addEventListener("pagehide", onPageHide, true);
    document.addEventListener("freeze", onFreeze, true);
    document.addEventListener("resume", onResume, true);
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("touchstart", onPointer, true);
    document.addEventListener("contextmenu", onContext, true);
    document.addEventListener("dragstart", onDragStart, true);

    // Mobile: if tab becomes hidden without a visibility event (rare OEM quirk)
    let pollId = 0;
    if (mobile.current) {
      pollId = window.setInterval(() => {
        const hidden = Boolean(document.hidden || document.webkitHidden);
        if (hidden && !blockedRef.current) showBlack(6000);
      }, 250);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pollId) clearInterval(pollId);
      paintBlack(false);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("visibilitychange", onVisibility, true);
      document.removeEventListener("webkitvisibilitychange", onVisibility, true);
      window.removeEventListener("blur", onBlur, true);
      window.removeEventListener("focus", onFocus, true);
      window.removeEventListener("pageshow", onPageShow, true);
      window.removeEventListener("pagehide", onPageHide, true);
      document.removeEventListener("freeze", onFreeze, true);
      document.removeEventListener("resume", onResume, true);
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("touchstart", onPointer, true);
      document.removeEventListener("contextmenu", onContext, true);
      document.removeEventListener("dragstart", onDragStart, true);
    };
  }, []);

  // Always-mounted layer — toggled only by CSS class on <html>, zero React lag
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="presentation"
      aria-hidden
      className="shot-block-layer"
      onClick={clearCover}
      onTouchEnd={clearCover}
    >
      <p>Screenshots are not allowed</p>
    </div>,
    document.body
  );
}
