import { useEffect } from "react";

/**
 * Keeps --vv-height / --vv-offset-top in sync with the visible viewport.
 * On phones, the soft keyboard shrinks visualViewport — without this, a
 * 100dvh chat shell stays full-screen and the message list can't scroll.
 */
export function useVisualViewportHeight(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;

    const root = document.documentElement;
    let raf = 0;

    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vv = window.visualViewport;
        const height = Math.max(240, Math.round(vv?.height ?? window.innerHeight));
        const offsetTop = Math.round(vv?.offsetTop ?? 0);
        root.style.setProperty("--vv-height", `${height}px`);
        root.style.setProperty("--vv-offset-top", `${offsetTop}px`);
        // Stop the document from scrolling under a focused input (iOS/Android)
        if (window.scrollY || window.pageYOffset) {
          window.scrollTo(0, 0);
        }
      });
    };

    sync();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);

    return () => {
      cancelAnimationFrame(raf);
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      root.style.removeProperty("--vv-height");
      root.style.removeProperty("--vv-offset-top");
    };
  }, [enabled]);
}
