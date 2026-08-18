const tracked = new Set();

export function trackPreviewVideo(el) {
  if (el) tracked.add(el);
}

export function haltPreviewVideo(el) {
  if (!el) return;
  try {
    el.pause();
    el.muted = true;
    el.defaultMuted = true;
    el.volume = 0;
    try {
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
  tracked.delete(el);
}

/** Stop every card/testimonial preview so audio cannot leak onto the next screen. */
export function stopAllPreviewVideos() {
  [...tracked].forEach((el) => haltPreviewVideo(el));
  tracked.clear();
  if (typeof document === "undefined") return;
  document.querySelectorAll("video.preview-video").forEach((el) => haltPreviewVideo(el));
}
