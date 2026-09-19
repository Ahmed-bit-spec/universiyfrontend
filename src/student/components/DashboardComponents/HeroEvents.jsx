// HeroEvents.js
// Pure data: the catalog of every event the mascot engine can fire, plus
// small helpers to resolve "what should each mascot do right now" given
// real app state (streak, reservation, notifications, verification).
// No JSX here — HeroMascots.jsx maps these ids to actual animations.

// Ambient idle events — fired randomly every 20–60s by useMascotEvents.
export const AMBIENT_EVENTS = [
  "graduate-open-laptop",
  "graduate-drink-coffee",
  "graduate-celebrate",
  "spirit-throw-stars",
  "spirit-spin",
  "spirit-fly-around",
  "sprout-grow-flower",
  "sprout-sneeze",
];

// User-driven events — fired directly via trigger(eventId) when real app
// state changes. Each maps to a short reaction across one or more mascots.
export const USER_EVENTS = {
  streakUp: "user-streak-up",
  reservationCreated: "user-reservation-created",
  reservationExpired: "user-reservation-expired",
  accountVerified: "user-account-verified",
  notificationArrived: "user-notification-arrived",
};

// Maps a time-of-day period to the background mood key used by
// HeroBackground + HeroEffects (sunrise glow, sun rays, dusk gradient,
// or night sky with moon / stars / fireflies).
export const PERIOD_TO_ATMOSPHERE = {
  morning: "sunrise",
  afternoon: "sunny",
  evening: "dusk",
  night: "night",
};

// Weekday-mood copy keys — actual strings come from t() in HeroGreeting,
// this just tells the greeting component which translation key to pull.
export const WEEKDAY_COPY_KEY = {
  motivation: "hero.weekday.monday",
  celebration: "hero.weekday.friday",
  relax: "hero.weekday.weekend",
  neutral: "hero.weekday.default",
};

// Given real app state, decide which (if any) user event should fire.
// Called from HeroWelcome whenever the underlying props change.
export const resolveUserEvent = (prev, next) => {
  if (next.streak > (prev?.streak ?? next.streak)) return USER_EVENTS.streakUp;
  if (next.hasNewReservation && !prev?.hasNewReservation) return USER_EVENTS.reservationCreated;
  if (next.reservationExpired && !prev?.reservationExpired) return USER_EVENTS.reservationExpired;
  if (next.isVerified && !prev?.isVerified) return USER_EVENTS.accountVerified;
  if (next.notificationCount > (prev?.notificationCount ?? next.notificationCount)) return USER_EVENTS.notificationArrived;
  return null;
};