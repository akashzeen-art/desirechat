import { useEffect, useRef, useCallback } from "react";

/** Idle timer that only counts down while the browser tab is visible. */
export function useVisibleIdleTimer() {
  const timerRef = useRef(null);
  const deadlineRef = useRef(null);
  const callbackRef = useRef(null);

  const disarm = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    deadlineRef.current = null;
    callbackRef.current = null;
  }, []);

  const fire = useCallback(() => {
    timerRef.current = null;
    deadlineRef.current = null;
    const cb = callbackRef.current;
    callbackRef.current = null;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    cb?.();
  }, []);

  const scheduleTimeout = useCallback(
    (ms) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (ms <= 0) {
        fire();
        return;
      }
      timerRef.current = setTimeout(fire, ms);
    },
    [fire]
  );

  const arm = useCallback(
    (delayMs, onFire) => {
      disarm();
      callbackRef.current = onFire;
      deadlineRef.current = Date.now() + delayMs;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      scheduleTimeout(delayMs);
    },
    [disarm, scheduleTimeout]
  );

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      if (!deadlineRef.current || !callbackRef.current) return;
      const left = deadlineRef.current - Date.now();
      if (left <= 0) fire();
      else scheduleTimeout(left);
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      disarm();
    };
  }, [fire, scheduleTimeout, disarm]);

  return { arm, disarm };
}
