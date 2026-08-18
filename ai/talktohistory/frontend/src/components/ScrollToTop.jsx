import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { stopAllPreviewVideos } from "../utils/previewMedia";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    stopAllPreviewVideos();
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const halt = () => {
      if (document.hidden) stopAllPreviewVideos();
    };
    const onHide = () => stopAllPreviewVideos();
    document.addEventListener("visibilitychange", halt);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", halt);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  return null;
}
