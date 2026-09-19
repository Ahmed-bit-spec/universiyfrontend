// HeroHooks.js
// All stateful logic for the hero lives here, decoupled from rendering:
//   useServerClock   — backend-synced time, never trusts the browser alone
//   useTimeOfDay      — morning / afternoon / evening / night + weekday mood
//   useMascotEvents   — random idle "events" engine (no repeats back-to-back)
//   useReducedMotion  — respects the OS-level accessibility setting
//   useEasterEgg      — click-count and Konami-code secret triggers

import { useEffect, useRef, useState, useCallback } from "react";

/* ----------------------------------------------------------------------
 * useServerClock
 * Polls a backend time endpoint once on mount and then re-syncs every
 * 60s, advancing locally between syncs with setInterval(1000) so the
 * displayed clock is smooth but never drifts far from server truth.
 * `fetchServerTime` is injected so this file has zero hard API coupling —
 * wire it to your real endpoint (e.g. GET /api/system/time) from the app.
 * -------------------------------------------------------------------- */
export const useServerClock = (fetchServerTime, initialServerTime) => {
  const [now, setNow] = useState(() => (initialServerTime ? new Date(initialServerTime) : new Date()));
  const offsetRef = useRef(0); // serverTime - clientTime, in ms

  const sync = useCallback(async () => {
    if (!fetchServerTime) return;
    try {
      const serverIso = await fetchServerTime();
      const serverTime = new Date(serverIso).getTime();
      offsetRef.current = serverTime - Date.now();
    } catch {
      // network hiccup — keep last known offset, never crash the hero
    }
  }, [fetchServerTime]);

  useEffect(() => {
    if (!initialServerTime) return;
    setNow(new Date(initialServerTime));
  }, [initialServerTime]);

  useEffect(() => {
    sync();
    const resync = setInterval(sync, 60_000);
    const tick = setInterval(() => setNow(new Date(Date.now() + offsetRef.current)), 1000);
    return () => {
      clearInterval(resync);
      clearInterval(tick);
    };
  }, [sync]);

  return now;
};

/* ----------------------------------------------------------------------
 * useTimeOfDay — derives atmosphere + weekday mood from a Date.
 * -------------------------------------------------------------------- */
export const useTimeOfDay = (date) => {
  const hour = date.getHours();
  const day = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday

  let period = "morning";
  if (hour >= 5 && hour < 12) period = "morning";
  else if (hour >= 12 && hour < 17) period = "afternoon";
  else if (hour >= 17 && hour < 20) period = "evening";
  else period = "night";

  let weekdayMood = "neutral";
  if (day === 1) weekdayMood = "motivation"; // Monday
  else if (day === 5) weekdayMood = "celebration"; // Friday
  else if (day === 0 || day === 6) weekdayMood = "relax"; // Weekend

  return { period, weekdayMood, hour, day };
};

/* ----------------------------------------------------------------------
 * useMascotEvents — fires a random ambient event on an interval between
 * minMs and maxMs, never repeating the same event twice in a row.
 * Returns { activeEvent, trigger } so user actions (streak up, etc.)
 * can also push an event directly through `trigger`.
 * -------------------------------------------------------------------- */
export const useMascotEvents = (eventPool, { minMs = 20_000, maxMs = 60_000, eventDurationMs = 2600 } = {}) => {
  const [activeEvent, setActiveEvent] = useState(null);
  const lastEventRef = useRef(null);
  const timeoutRef = useRef(null);

  const pickNext = useCallback(() => {
    if (!eventPool.length) return null;
    if (eventPool.length === 1) return eventPool[0];
    let next = eventPool[Math.floor(Math.random() * eventPool.length)];
    while (next === lastEventRef.current) {
      next = eventPool[Math.floor(Math.random() * eventPool.length)];
    }
    return next;
  }, [eventPool]);

  const trigger = useCallback(
    (forcedEvent) => {
      const ev = forcedEvent || pickNext();
      lastEventRef.current = ev;
      setActiveEvent(ev);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setActiveEvent(null), eventDurationMs);
    },
    [pickNext, eventDurationMs]
  );

  useEffect(() => {
    let cancelled = false;
    const schedule = () => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      window.setTimeout(() => {
        if (cancelled) return;
        trigger();
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutRef.current);
    };
  }, [minMs, maxMs, trigger]);

  return { activeEvent, trigger };
};

/* ----------------------------------------------------------------------
 * useReducedMotion — mirrors prefers-reduced-motion so JS-driven logic
 * (not just CSS) can also skip non-essential animation work.
 * -------------------------------------------------------------------- */
export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
};

/* ----------------------------------------------------------------------
 * usePageVisible — pauses heavy animation work when the tab is hidden,
 * required for the 60fps / no-wasted-GPU-cycles performance goal.
 * -------------------------------------------------------------------- */
export const usePageVisible = () => {
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const handler = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);
  return visible;
};

/* ----------------------------------------------------------------------
 * useEasterEgg — 10 clicks on a target = party mode; Konami code on the
 * keyboard = rainbow celebration. Both reset automatically after firing.
 * -------------------------------------------------------------------- */
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export const useEasterEgg = () => {
  const [partyMode, setPartyMode] = useState(false);
  const [rainbowMode, setRainbowMode] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const konamiProgress = useRef(0);

  const registerClick = useCallback(() => {
    clickCount.current += 1;
    window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => (clickCount.current = 0), 1800);
    if (clickCount.current >= 10) {
      clickCount.current = 0;
      setPartyMode(true);
      window.setTimeout(() => setPartyMode(false), 4000);
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const expected = KONAMI[konamiProgress.current];
      if (e.key === expected) {
        konamiProgress.current += 1;
        if (konamiProgress.current === KONAMI.length) {
          konamiProgress.current = 0;
          setRainbowMode(true);
          window.setTimeout(() => setRainbowMode(false), 4500);
        }
      } else {
        konamiProgress.current = e.key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { partyMode, rainbowMode, registerClick };
};

/* ----------------------------------------------------------------------
 * useSeasonalEvent — calendar-driven, no fake data: derives a seasonal
 * flag purely from the real date passed in (server clock recommended).
 * -------------------------------------------------------------------- */
export const useSeasonalEvent = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 12 && day >= 18 && day <= 26) return "christmas";
  if (month === 5 && day >= 15 && day <= 31) return "graduation";
  return null;
};