// hooks/useGamification.js — Uniso E-Library
// Tracks daily reading goal, streak, XP, and level.
//
// STORAGE: reads/writes localStorage under "unigame:v1" so streaks survive
// reloads. Swap the two TODO-marked spots for real API calls (e.g.
// GET/POST /api/gamification) once a backend endpoint exists — everything
// else (the derived values, the public API) stays the same.
//
// USAGE:
//   const {
//     streak, xp, level, todayPagesRead, dailyGoalPages, goalPct,
//     recordPagesRead, completeQuiz, resetToday,
//   } = useGamification();

import { useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "unigame:v1";
const DAILY_GOAL_PAGES_DEFAULT = 10;
const XP_PER_PAGE = 4;
const XP_QUIZ_PERFECT = 100;
const XP_QUIZ_PARTIAL = 40;
const XP_PER_LEVEL = 500;

const todayStr = () => new Date().toISOString().slice(0, 10); // "2026-07-20"

const yesterdayStr = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const defaultState = () => ({
  streak: 0,
  lastActiveDate: null,   // last calendar day the goal was met
  lastSeenDate: todayStr(),
  totalXP: 0,
  dailyGoalPages: DAILY_GOAL_PAGES_DEFAULT,
  pagesByDate: {},        // { "2026-07-20": 6 }
});

export const useGamification = () => {
  const [state, setState] = useState(() => loadState() ?? defaultState());

  // Persist on every change.
  // TODO: also POST the diff to your backend here, e.g.
  //   api.post('/api/gamification/sync', state)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — fail silently, in-memory state still works */
    }
  }, [state]);

  // Roll the day over: if a new calendar day has started since we last
  // looked, check whether yesterday's goal was hit. If it wasn't, the
  // streak breaks.
  useEffect(() => {
    setState((prev) => {
      const today = todayStr();
      if (prev.lastSeenDate === today) return prev;

      const y = yesterdayStr(today);
      const metYesterday = (prev.pagesByDate[y] || 0) >= prev.dailyGoalPages;
      const streakBroken = prev.lastSeenDate !== y || !metYesterday;

      return {
        ...prev,
        lastSeenDate: today,
        streak: streakBroken ? 0 : prev.streak,
      };
    });
  }, []);

  // TODO: on mount, GET /api/gamification for this user and merge with the
  // localStorage state (server wins on conflict) instead of relying on
  // localStorage alone across devices.

  const recordPagesRead = useCallback((count = 1) => {
    if (!count) return;
    setState((prev) => {
      const today = todayStr();
      const prevToday = prev.pagesByDate[today] || 0;
      const nextToday = prevToday + count;
      const hitGoalJustNow = prevToday < prev.dailyGoalPages && nextToday >= prev.dailyGoalPages;

      return {
        ...prev,
        totalXP: prev.totalXP + count * XP_PER_PAGE,
        pagesByDate: { ...prev.pagesByDate, [today]: nextToday },
        streak: hitGoalJustNow && prev.lastActiveDate !== today
          ? prev.streak + 1
          : prev.streak,
        lastActiveDate: hitGoalJustNow ? today : prev.lastActiveDate,
      };
    });
  }, []);

  // score: number correct, total: number of questions
  const completeQuiz = useCallback((score, total) => {
    const perfect = total > 0 && score === total;
    const xpGain = perfect ? XP_QUIZ_PERFECT : Math.round((score / Math.max(total, 1)) * XP_QUIZ_PARTIAL) || 10;
    setState((prev) => ({ ...prev, totalXP: prev.totalXP + xpGain }));
    return xpGain;
  }, []);

  const setDailyGoalPages = useCallback((pages) => {
    setState((prev) => ({ ...prev, dailyGoalPages: Math.max(1, pages) }));
  }, []);

  const resetToday = useCallback(() => {
    setState((prev) => {
      const today = todayStr();
      const { [today]: _, ...rest } = prev.pagesByDate;
      return { ...prev, pagesByDate: rest };
    });
  }, []);

  const todayPagesRead = state.pagesByDate[todayStr()] || 0;
  const goalPct = Math.min(100, Math.round((todayPagesRead / state.dailyGoalPages) * 100));
  const level = Math.floor(state.totalXP / XP_PER_LEVEL) + 1;
  const xpIntoLevel = state.totalXP % XP_PER_LEVEL;
  const xpForNextLevel = XP_PER_LEVEL;

  return useMemo(() => ({
    streak: state.streak,
    xp: state.totalXP,
    level,
    xpIntoLevel,
    xpForNextLevel,
    todayPagesRead,
    dailyGoalPages: state.dailyGoalPages,
    goalPct,
    goalMet: todayPagesRead >= state.dailyGoalPages,
    recordPagesRead,
    completeQuiz,
    setDailyGoalPages,
    resetToday,
  }), [state, level, xpIntoLevel, xpForNextLevel, todayPagesRead, goalPct, recordPagesRead, completeQuiz, setDailyGoalPages, resetToday]);
};

export default useGamification;