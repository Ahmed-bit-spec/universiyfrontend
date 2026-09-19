// HeroAnimations.js
// Centralized motion tokens: easings, durations, and the master keyframe
// stylesheet shared by every hero sub-component. Keeping this in one file
// means HeroBackground, HeroMascots, HeroParticles, etc. never duplicate
// a @keyframes block — they just reference a class name defined here.

export const EASE = {
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  soft: "cubic-bezier(0.4, 0, 0.2, 1)",
};

export const DURATION = {
  entrance: 900,
  noteHold: 4200,
  patrolLoop: 5500,
  ambientLoop: 14000,
};

// One global <style> block, mounted once by HeroWelcome. Every animation
// name used anywhere in the hero tree lives here so there's a single
// source of truth and no class collides or gets redefined twice.
export const HeroAnimationStyles = () => (
  <style>{`
    /* ---------- Mascot life-cycle ---------- */
    @keyframes mBlink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
    @keyframes mFlicker { 0%, 100% { opacity: 0.82; } 50% { opacity: 1; } }
    @keyframes mBreathe {
      0%, 100% { transform: translateY(0) scale(1); }
      50%      { transform: translateY(-2px) scale(1.015); }
    }
    @keyframes mBow {
      0%, 70% { transform: translateY(0) rotate(0deg); }
      78%     { transform: translateY(2px) rotate(8deg); }
      86%     { transform: translateY(0) rotate(0deg); }
      100%    { transform: translateY(0) rotate(0deg); }
    }
    @keyframes mWaveLeft {
      0%, 70%   { transform: rotate(0deg); }
      75%       { transform: rotate(-35deg); }
      80%       { transform: rotate(-10deg); }
      85%       { transform: rotate(-35deg); }
      90%, 100% { transform: rotate(0deg); }
    }
    @keyframes mWaveRight {
      0%, 70%   { transform: rotate(0deg); }
      75%       { transform: rotate(35deg); }
      80%       { transform: rotate(10deg); }
      85%       { transform: rotate(35deg); }
      90%, 100% { transform: rotate(0deg); }
    }
    @keyframes mLookAround {
      0%, 100% { transform: translateX(0); }
      30%      { transform: translateX(-2px); }
      60%      { transform: translateX(2px); }
    }
    @keyframes mSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes mDance {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      20%      { transform: translateY(-6px) rotate(-6deg); }
      40%      { transform: translateY(0) rotate(6deg); }
      60%      { transform: translateY(-6px) rotate(-6deg); }
      80%      { transform: translateY(0) rotate(6deg); }
    }
    @keyframes mPop {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.18); }
      100% { transform: scale(1); }
    }
    @keyframes mSad {
      0%, 100% { transform: translateY(0) rotate(0deg); opacity: 1; }
      50%      { transform: translateY(4px) rotate(-2deg); opacity: 0.75; }
    }
    @keyframes mSleep {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(3px); }
    }

    /* ---------- Entrance ---------- */
    @keyframes enterLeft  { 0% { opacity: 0; transform: translateX(-160px); } 100% { opacity: 1; transform: translateX(0); } }
    @keyframes enterRight { 0% { opacity: 0; transform: translateX(160px); }  100% { opacity: 1; transform: translateX(0); } }
    @keyframes enterTop   { 0% { opacity: 0; transform: translateY(-70px) scale(0.8); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes enterSpark {
      0%   { opacity: 0; transform: scale(0); }
      40%  { opacity: 1; transform: scale(1.4); }
      100% { opacity: 0; transform: scale(2.4); }
    }
    @keyframes cameraZoom {
      0%   { transform: scale(1.04); }
      100% { transform: scale(1); }
    }

    /* ---------- Note / speech bubble ---------- */
    @keyframes noteShow {
      0%   { opacity: 0; transform: translate(-50%, 10px) scale(0.9); }
      14%  { opacity: 1; transform: translate(-50%, 0) scale(1); }
      86%  { opacity: 1; transform: translate(-50%, 0) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -8px) scale(0.95); }
    }
    @keyframes caretBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

    /* ---------- Patrol (idle wandering) ---------- */
    @keyframes patrolLeft {
      0%, 100% { transform: translateX(0) scaleX(1); }
      45%      { transform: translateX(28px) scaleX(1); }
      50%      { transform: translateX(28px) scaleX(-1); }
      95%      { transform: translateX(0) scaleX(-1); }
      100%     { transform: translateX(0) scaleX(1); }
    }
    @keyframes patrolRight {
      0%, 100% { transform: translateX(0) scaleX(-1); }
      45%      { transform: translateX(-28px) scaleX(-1); }
      50%      { transform: translateX(-28px) scaleX(1); }
      95%      { transform: translateX(0) scaleX(1); }
      100%     { transform: translateX(0) scaleX(-1); }
    }
    @keyframes patrolCenter {
      0%, 100% { transform: translate(0, 0); }
      25%      { transform: translate(16px, -8px); }
      50%      { transform: translate(0, -12px); }
      75%      { transform: translate(-16px, -8px); }
    }

    /* ---------- Background atmosphere ---------- */
    @keyframes blobDrift1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, -30px) scale(1.08); } }
    @keyframes blobDrift2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-50px, 26px) scale(1.05); } }
    @keyframes blobDrift3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, 40px) scale(0.96); } }
    @keyframes leafFall {
      0%   { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
      10%  { opacity: 0.9; }
      90%  { opacity: 0.9; }
      100% { transform: translateY(220px) translateX(30px) rotate(180deg); opacity: 0; }
    }
    @keyframes sparkleTwinkle {
      0%, 100% { opacity: 0; transform: scale(0.4); }
      50%      { opacity: 1; transform: scale(1); }
    }
    @keyframes particleFloat {
      0%   { transform: translateY(0) translateX(0); opacity: 0; }
      10%  { opacity: 0.7; }
      90%  { opacity: 0.7; }
      100% { transform: translateY(-160px) translateX(20px); opacity: 0; }
    }
    @keyframes rayPulse { 0%, 100% { opacity: 0.05; } 50% { opacity: 0.14; } }
    @keyframes fireflyDrift {
      0%, 100% { transform: translate(0, 0); opacity: 0.3; }
      25%      { transform: translate(14px, -10px); opacity: 0.9; }
      50%      { transform: translate(-6px, -22px); opacity: 0.4; }
      75%      { transform: translate(-16px, -4px); opacity: 0.85; }
    }

    /* ---------- Micro-interactions / events ---------- */
    @keyframes confettiFall {
      0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(140px) rotate(540deg); opacity: 0; }
    }
    @keyframes thumbsUp {
      0%, 100% { transform: rotate(0deg); }
      50%      { transform: rotate(-18deg) translateY(-3px); }
    }
    @keyframes qrHologram {
      0%   { opacity: 0; transform: scale(0.7) translateY(6px); }
      30%  { opacity: 1; transform: scale(1) translateY(0); }
      85%  { opacity: 1; }
      100% { opacity: 0; transform: scale(0.9) translateY(-6px); }
    }
    @keyframes clapBounce {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50%      { transform: scale(1.12) rotate(8deg); }
    }
    @keyframes fireworkBurst {
      0%   { transform: scale(0); opacity: 1; }
      80%  { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.3); opacity: 0; }
    }
    @keyframes bellShake {
      0%, 100% { transform: rotate(0deg); }
      20%      { transform: rotate(14deg); }
      40%      { transform: rotate(-14deg); }
      60%      { transform: rotate(8deg); }
      80%      { transform: rotate(-8deg); }
    }
    @keyframes rainbowSpin {
      0%   { filter: hue-rotate(0deg); }
      100% { filter: hue-rotate(360deg); }
    }
    @keyframes ringPulse {
      0%   { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(2.6); opacity: 0; }
    }

    /* ---------- Reduced motion: kill everything, keep state visible ---------- */
    @media (prefers-reduced-motion: reduce) {
      *[class*="mascot-"], *[class*="hero-"], *[class*="patrol"], *[class*="blob"],
      *[class*="leaf"], *[class*="sparkle"], *[class*="particle"], *[class*="firefly"] {
        animation: none !important;
        transition: none !important;
      }
    }
  `}</style>
);