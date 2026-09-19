/**
 * meetingSounds.js — Web Audio API sound effects.
 * Zero external dependencies, zero network requests.
 * All sounds synthesized in-browser.
 */

let ctx = null;
let enabled = true;

function getCtx() {
  if (!ctx || ctx.state === "closed") {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setSoundsEnabled(val) { enabled = val; }
export function getSoundsEnabled()    { return enabled; }

function playTone({ freq = 440, type = "sine", duration = 0.15, gain = 0.18, delay = 0, ramp = true }) {
  if (!enabled) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.type      = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(c.destination);
    const start = c.currentTime + delay;
    osc.start(start);
    if (ramp) {
      g.gain.setValueAtTime(gain, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    }
    osc.stop(start + duration);
  } catch { /* AudioContext not available */ }
}

/** Soft two-tone join chime */
export function playJoin() {
  playTone({ freq: 880, duration: 0.18, gain: 0.14 });
  playTone({ freq: 1100, duration: 0.18, gain: 0.12, delay: 0.12 });
}

/** Soft single-tone leave */
export function playLeave() {
  playTone({ freq: 660, duration: 0.22, gain: 0.13 });
  playTone({ freq: 440, duration: 0.22, gain: 0.10, delay: 0.14 });
}

/** Short positive click for camera on */
export function playCameraOn() {
  playTone({ freq: 1200, type: "sine", duration: 0.10, gain: 0.12 });
}

/** Short lower click for camera off */
export function playCameraOff() {
  playTone({ freq: 800, type: "sine", duration: 0.10, gain: 0.10 });
}

/** Rising sweep for screen share start */
export function playScreenShareStart() {
  playTone({ freq: 700, duration: 0.10, gain: 0.12 });
  playTone({ freq: 900, duration: 0.10, gain: 0.12, delay: 0.08 });
  playTone({ freq: 1100, duration: 0.12, gain: 0.12, delay: 0.16 });
}

/** Falling sweep for screen share stop */
export function playScreenShareStop() {
  playTone({ freq: 1100, duration: 0.10, gain: 0.12 });
  playTone({ freq: 900,  duration: 0.10, gain: 0.12, delay: 0.08 });
  playTone({ freq: 700,  duration: 0.12, gain: 0.12, delay: 0.16 });
}

/** Gentle chat pop */
export function playChatMessage() {
  playTone({ freq: 1320, type: "triangle", duration: 0.12, gain: 0.10 });
}

/** Hand raise ping */
export function playHandRaise() {
  playTone({ freq: 990,  duration: 0.12, gain: 0.14 });
  playTone({ freq: 1320, duration: 0.14, gain: 0.12, delay: 0.10 });
}

/** Presenter assigned */
export function playPresenter() {
  [0, 0.12, 0.24].forEach((delay, i) => {
    playTone({ freq: [880, 1100, 1320][i], duration: 0.12, gain: 0.12, delay });
  });
}

/** Focus timer bell — rich bell-like tone */
export function playFocusBell() {
  if (!enabled) return;
  try {
    const c = getCtx();
    // Fundamental + overtones for a bell
    [523, 1047, 1568, 2093].forEach((f, i) => {
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const startGain = [0.35, 0.20, 0.12, 0.07][i];
      g.gain.setValueAtTime(startGain, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 2.5);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 2.5);
    });
  } catch { /* */ }
}
