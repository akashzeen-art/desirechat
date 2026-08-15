import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Best-effort screenshot / screen-capture deterrent for web.
 * No website can fully block OS screenshots, but we black out the UI when
 * common capture gestures or focus loss are detected (Win / Mac / iOS / Android).
 */

function isScreenshotShortcut(e) {
  const key = (e.key || "").toLowerCase();
  const code = e.code || "";

  if (key === "printscreen" || code === "PrintScreen" || key === "f13" || code === "F13") {
    return true;
  }

  // Windows: Win+Shift+S (Snipping Tool) — metaKey is Windows key in some browsers
  if ((e.metaKey || e.getModifierState?.("OS") || e.getModifierState?.("Win")) && e.shiftKey && key === "s") {
    return true;
  }

  // macOS: Cmd+Shift+3/4/5/6 and Cmd+Shift+S
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && ["s", "3", "4", "5", "6"].includes(key)) {
    return true;
  }

  // Some Android / desktop browsers fire these during share/capture flows
  if (e.ctrlKey && e.shiftKey && (key === "i" || key === "x")) {
    // don't treat DevTools as screenshot
  }

  return false;
}

async function scrubClipboardImage() {
  try {
    if (!navigator.clipboard?.writeText) return;
    // PrintScreen often copies to clipboard — overwrite so paste isn't the chat
    await navigator.clipboard.writeText("");
  } catch {
    /* permission / insecure context */
  }
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

  const coverFor = (holdMs = 2000) => {
    showBlack();
    if (hiddenRef.current) return;
    timerRef.current = setTimeout(() => clearCover(), Math.max(holdMs, 500));
  };

  useEffect(() => {
    clearCover();

    const onKey = (e) => {
      if (!isScreenshotShortcut(e)) return;
      e.preventDefault?.();
      e.stopPropagation?.();
      coverFor(3200);
      scrubClipboardImage();
    };

    const onVisibility = () => {
      hiddenRef.current = document.hidden;
      if (document.hidden) {
        // App switcher, recents, system screenshot UI, Snipping Tool overlay
        showBlack();
        return;
      }
      timerRef.current = setTimeout(() => clearCover(), 1400);
    };

    const onBlur = () => {
      // Any window blur (screenshot tools, multitasking) — hide content
      showBlack();
      if (!document.hidden) {
        timerRef.current = setTimeout(() => {
          if (!document.hidden && document.hasFocus()) clearCover();
        }, 1800);
      }
    };

    const onFocus = () => {
      hiddenRef.current = false;
      if (!document.hidden) {
        timerRef.current = setTimeout(() => clearCover(), 900);
      }
    };

    const onPointer = () => {
      if (document.hidden) return;
      if (blockedRef.current && document.hasFocus()) clearCover();
    };

    const onContext = (e) => {
      e.preventDefault();
    };

    // Block drag-save of media
    const onDragStart = (e) => {
      if (e.target?.closest?.("img, video, canvas")) e.preventDefault();
    };

    // iOS / Android: pagehide when screenshot sheet or app switcher opens
    const onPageHide = () => {
      hiddenRef.current = true;
      showBlack();
    };

    const onPageShow = () => {
      hiddenRef.current = false;
      timerRef.current = setTimeout(() => clearCover(), 1000);
    };

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("touchstart", onPointer, true);
    document.addEventListener("contextmenu", onContext, true);
    document.addEventListener("dragstart", onDragStart, true);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.documentElement.classList.remove("shot-block");
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("touchstart", onPointer, true);
      document.removeEventListener("contextmenu", onContext, true);
      document.removeEventListener("dragstart", onDragStart, true);
    };
  }, []);

  if (!blocked || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="presentation"
      aria-hidden
      className="shot-block-layer fixed inset-0 z-[2147483647] bg-black touch-none flex items-center justify-center"
      style={{ pointerEvents: "auto", WebkitTouchCallout: "none", userSelect: "none" }}
      onClick={clearCover}
      onTouchStart={clearCover}
    >
      <p className="text-white/70 text-sm font-semibold tracking-wide px-6 text-center">
        Screenshots are not allowed
      </p>
    </div>,
    document.body
  );
}
