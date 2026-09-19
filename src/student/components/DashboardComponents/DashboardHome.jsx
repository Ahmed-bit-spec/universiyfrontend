import { useState } from "react";

// ── Icons (inline SVG to avoid external deps) ─────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor", fill = "none", strokeWidth = 1.5, viewBox = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

// ── Duolingo Owl SVG ──────────────────────────────────────────────────────
const Owl = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 200 220" fill="none">
    {/* Shadow */}
    <ellipse cx="100" cy="210" rx="45" ry="8" fill="rgba(0,0,0,0.12)" />
    {/* Body */}
    <ellipse cx="100" cy="130" rx="62" ry="72" fill="#2C2DE0" />
    {/* Head */}
    <ellipse cx="100" cy="75" rx="58" ry="55" fill="#2C2DE0" />
    {/* Ear tufts */}
    <ellipse cx="62" cy="28" rx="16" ry="22" fill="#1E1FAA" transform="rotate(-15 62 28)" />
    <ellipse cx="138" cy="28" rx="16" ry="22" fill="#1E1FAA" transform="rotate(15 138 28)" />
    {/* Belly */}
    <ellipse cx="100" cy="150" rx="40" ry="48" fill="#89E219" />
    {/* Wings */}
    <path d="M38 120 Q10 140 22 175 Q42 158 50 135 Z" fill="#1E1FAA" />
    <path d="M162 120 Q190 140 178 175 Q158 158 150 135 Z" fill="#1E1FAA" />
    {/* Eye whites */}
    <ellipse cx="76" cy="76" rx="24" ry="26" fill="white" />
    <ellipse cx="124" cy="76" rx="24" ry="26" fill="white" />
    {/* Eye circles */}
    <ellipse cx="76" cy="76" rx="18" ry="20" fill="#1A1A1A" />
    <ellipse cx="124" cy="76" rx="18" ry="20" fill="#1A1A1A" />
    {/* Pupils */}
    <ellipse cx="80" cy="72" rx="7" ry="9" fill="white" />
    <ellipse cx="128" cy="72" rx="7" ry="9" fill="white" />
    {/* Shine dots */}
    <ellipse cx="83" cy="69" rx="3" ry="3" fill="white" />
    <ellipse cx="131" cy="69" rx="3" ry="3" fill="white" />
    {/* Beak */}
    <path d="M88 95 Q100 112 112 95 Q100 105 88 95Z" fill="#FF9600" />
    {/* Feet */}
    <path d="M78 198 L72 185 L82 183 L88 198Z" fill="#FF9600" />
    <path d="M122 198 L128 185 L118 183 L112 198Z" fill="#FF9600" />
    {/* Eyebrows */}
    <path d="M54 55 Q70 44 86 52" stroke="#2d5a00" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M114 52 Q130 44 146 55" stroke="#2d5a00" strokeWidth="3.5" fill="none" strokeLinecap="round" />
  </svg>
);

const SmallOwl = ({ size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 200 220" fill="none">
    <ellipse cx="100" cy="130" rx="62" ry="72" fill="#2C2DE0" />
    <ellipse cx="100" cy="75" rx="58" ry="55" fill="#2C2DE0" />
    <ellipse cx="62" cy="28" rx="16" ry="22" fill="#1E1FAA" transform="rotate(-15 62 28)" />
    <ellipse cx="138" cy="28" rx="16" ry="22" fill="#1E1FAA" transform="rotate(15 138 28)" />
    <ellipse cx="100" cy="150" rx="40" ry="48" fill="#89E219" />
    <ellipse cx="76" cy="76" rx="24" ry="26" fill="white" />
    <ellipse cx="124" cy="76" rx="24" ry="26" fill="white" />
    <ellipse cx="76" cy="76" rx="18" ry="20" fill="#1A1A1A" />
    <ellipse cx="124" cy="76" rx="18" ry="20" fill="#1A1A1A" />
    <ellipse cx="80" cy="72" rx="7" ry="9" fill="white" />
    <ellipse cx="128" cy="72" rx="7" ry="9" fill="white" />
    <path d="M88 95 Q100 112 112 95 Q100 105 88 95Z" fill="#FF9600" />
    <path d="M78 198 L72 185 L82 183 L88 198Z" fill="#FF9600" />
    <path d="M122 198 L128 185 L118 183 L112 198Z" fill="#FF9600" />
  </svg>
);

// ── Colorful 3D-style emoji icons for quick actions ───────────────────────
const BookEmoji = () => (
  <svg width="44" height="44" viewBox="0 0 64 64">
    <rect x="8" y="8" width="38" height="48" rx="4" fill="#4CAF50" />
    <rect x="12" y="8" width="34" height="48" rx="3" fill="#66BB6A" />
    <rect x="46" y="8" width="10" height="48" rx="2" fill="#2E7D32" />
    <rect x="14" y="18" width="20" height="3" rx="1.5" fill="white" opacity="0.7" />
    <rect x="14" y="24" width="16" height="3" rx="1.5" fill="white" opacity="0.7" />
  </svg>
);

const CalendarEmoji = () => (
  <svg width="44" height="44" viewBox="0 0 64 64">
    <rect x="6" y="14" width="52" height="44" rx="6" fill="#42A5F5" />
    <rect x="6" y="14" width="52" height="16" rx="6" fill="#1976D2" />
    <rect x="6" y="22" width="52" height="8" fill="#1976D2" />
    <rect x="18" y="6" width="8" height="16" rx="4" fill="#0D47A1" />
    <rect x="38" y="6" width="8" height="16" rx="4" fill="#0D47A1" />
    {/* Check mark */}
    <circle cx="40" cy="42" r="10" fill="#4CAF50" />
    <path d="M35 42 L39 46 L46 38" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StackBooksEmoji = () => (
  <svg width="44" height="44" viewBox="0 0 64 64">
    <rect x="10" y="38" width="44" height="14" rx="3" fill="#E53935" />
    <rect x="10" y="38" width="8" height="14" rx="2" fill="#B71C1C" />
    <rect x="12" y="26" width="40" height="14" rx="3" fill="#FB8C00" />
    <rect x="12" y="26" width="8" height="14" rx="2" fill="#E65100" />
    <rect x="14" y="14" width="36" height="14" rx="3" fill="#1565C0" />
    <rect x="14" y="14" width="8" height="14" rx="2" fill="#0D47A1" />
  </svg>
);

const BookmarkEmoji = () => (
  <svg width="44" height="44" viewBox="0 0 64 64">
    <path d="M18 8 H46 Q50 8 50 12 V56 L32 44 L14 56 V12 Q14 8 18 8Z" fill="#FF8F00" />
    <path d="M14 12 Q14 8 18 8 H22 V56 L14 56Z" fill="#F57C00" />
  </svg>
);

const PeopleEmoji = () => (
  <svg width="44" height="44" viewBox="0 0 64 64">
    <circle cx="22" cy="20" r="10" fill="#7E57C2" />
    <path d="M4 52 Q4 36 22 36 Q40 36 40 52Z" fill="#7E57C2" />
    <circle cx="44" cy="22" r="9" fill="#9575CD" />
    <path d="M28 54 Q30 40 44 40 Q58 40 60 54Z" fill="#9575CD" />
  </svg>
);

const SmileyEmoji = () => (
  <svg width="44" height="44" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="26" fill="#66BB6A" />
    <circle cx="22" cy="26" r="4" fill="#1B5E20" />
    <circle cx="42" cy="26" r="4" fill="#1B5E20" />
    <path d="M20 38 Q32 50 44 38" stroke="#1B5E20" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="24" cy="24" r="2" fill="white" opacity="0.5" />
  </svg>
);

// ── Stat card icons ───────────────────────────────────────────────────────
const BookIconStat = () => (
  <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="6" width="38" height="52" rx="4" fill="#4CAF50" />
    <rect x="8" y="6" width="10" height="52" rx="3" fill="#2E7D32" />
    <rect x="22" y="18" width="18" height="3" rx="1.5" fill="white" opacity="0.8" />
    <rect x="22" y="25" width="14" height="3" rx="1.5" fill="white" opacity="0.8" />
  </svg>
);

const BookmarkIconStat = () => (
  <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
    <path d="M18 6 H46 Q50 6 50 10 V58 L32 46 L14 58 V10 Q14 6 18 6Z" fill="#42A5F5" />
    <path d="M14 10 Q14 6 18 6 H22 V58 L14 58Z" fill="#1565C0" />
  </svg>
);

const ClockIconStat = () => (
  <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="26" fill="#FFA726" />
    <circle cx="32" cy="32" r="20" fill="#FFE0B2" />
    <path d="M32 16 L32 32 L42 32" stroke="#E65100" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="32" r="3" fill="#E65100" />
  </svg>
);

const BellIconStat = () => (
  <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
    <path d="M32 8 C20 8 14 18 14 28 L14 42 L8 48 L56 48 L50 42 L50 28 C50 18 44 8 32 8Z" fill="#AB47BC" />
    <path d="M26 48 Q32 56 38 48Z" fill="#7B1FA2" />
    <circle cx="32" cy="12" r="5" fill="#CE93D8" opacity="0.6" />
  </svg>
);

const TrendUp = () => (
  <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
    <path d="M2 20 L10 12 L16 16 L26 6 L34 6" stroke="#2C2DE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M28 4 L34 6 L32 12" stroke="#2C2DE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// ── Notification icons ────────────────────────────────────────────────────
const CheckCircleIcon = ({ color = "#2C2DE0" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const BookOpenIcon = ({ color = "#42A5F5" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const AlertIcon = ({ color = "#FFA726" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const WarningIcon = ({ color = "#EF5350" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ArrowRightSmall = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

// ── Book cover placeholders ───────────────────────────────────────────────
const BookCover = ({ color, label }) => (
  <div style={{ width: 40, height: 52, borderRadius: 4, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 8, color: "white", fontWeight: 700, textAlign: "center", padding: "2px 3px", lineHeight: 1.2 }}>
    {label}
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function UniSoDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  const navLinks = [
    { label: "Dashboard", icon: "🏠" },
    { label: "Library", icon: "📚" },
    { label: "Community", icon: "👥" },
    { label: "E-Learning", icon: "📡" },
  ];

  return (
    <div style={{ fontFamily: "'Nunito', 'Segoe UI', Arial, sans-serif", background: "#f8f9fa", minHeight: "100vh", color: "#1a1a1a" }}>

      {/* ── HEADER ── */}
      <header style={{ background: "white", borderBottom: "1px solid #e8e8e8", height: 60, display: "flex", alignItems: "center", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, gap: 32 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: "#2C2DE0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 18 L6 21 L7 14 L2 9 L9 8 Z" />
            </svg>
          </div>
          <span style={{ fontWeight: 900, fontSize: 18, color: "#1a1a1a", letterSpacing: -0.5 }}>UNISO</span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 28, alignItems: "center", flex: 1 }}>
          {navLinks.map(({ label }) => (
            <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group" key={label} onClick={() => setActiveNav(label)}
              style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: activeNav === label ? "#2C2DE0" : "#888", paddingBottom: 4, borderBottom: activeNav === label ? "2.5px solid #2C2DE0" : "2.5px solid transparent", transition: "all .15s", display: "flex", alignItems: "center", gap: 5 }}>
              {label === "Dashboard" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
              {label === "Library" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>}
              {label === "Community" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
              {label === "E-Learning" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14"/></svg>}
              {label}
            </button>
          ))}
        </nav>

        {/* Search */}
        <div style={{ position: "relative", width: 220 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Search books, courses…" style={{ width: "100%", paddingLeft: 30, paddingRight: 10, height: 34, border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 13, outline: "none", background: "#f5f5f5", boxSizing: "border-box" }} />
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Bell */}
          <div style={{ position: "relative", cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
            <span style={{ position: "absolute", top: -3, right: -3, background: "#2C2DE0", color: "white", borderRadius: "50%", width: 17, height: 17, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
          </div>
          {/* Lang */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#555", cursor: "pointer" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            EN
          </div>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 8px", borderRadius: 10, background: "#f5f5f5" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#2C2DE0,#3a9900)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 13 }}>A</div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>Ahmed Abdi</div>
              <div style={{ fontSize: 10, color: "#888" }}>Student</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "24px 24px 40px" }}>

        {/* ── WELCOME BANNER ── */}
        <div style={{ borderRadius: 20, background: "linear-gradient(120deg,#2C2DE0 0%,#72e010 60%,#a8f040 100%)", padding: "28px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden", marginBottom: 20 }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -30, right: 220, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", bottom: -20, left: "38%", width: 160, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          {/* Floating stars/sparkles */}
          {[{top:20,left:"55%",s:14},{top:60,left:"62%",s:10},{top:15,left:"68%",s:8},{top:45,left:"48%",s:6}].map((s,i)=>(
            <div key={i} style={{position:"absolute",top:s.top,left:s.left,fontSize:s.s,opacity:0.8}}>✦</div>
          ))}
          {/* Music notes */}
          <div style={{position:"absolute",top:22,left:"72%",fontSize:18,opacity:0.7,transform:"rotate(-15deg)"}}>♪</div>
          <div style={{position:"absolute",bottom:25,left:"65%",fontSize:14,opacity:0.6,transform:"rotate(10deg)"}}>♫</div>

          {/* Left: greeting */}
          <div style={{ zIndex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "white", lineHeight: 1.2 }}>
              Welcome back, Ahmed! 👋
            </h1>
            <p style={{ margin: "6px 0 16px", color: "rgba(255,255,255,0.88)", fontSize: 14 }}>Ready to learn something amazing today?</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { icon: "🎓", text: "Computer Science" },
                { icon: "🏛", text: "Semester 5" },
                { icon: "🪪", text: "ID: ST240031" },
              ].map(({ icon, text }) => (
                <span key={text} style={{ background: "rgba(255,255,255,0.92)", color: "#2d7a00", fontWeight: 800, fontSize: 12, borderRadius: 20, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                  {icon} {text}
                </span>
              ))}
            </div>
          </div>

          {/* Center: Owl */}
          <div style={{ zIndex: 1, marginLeft: 24, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.18))" }}>
            <Owl size={148} />
          </div>

          {/* Right: Streak card */}
          <div style={{ background: "white", borderRadius: 18, padding: "16px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 14, zIndex: 1, flexShrink: 0 }}>
            <div style={{ fontSize: 36 }}>🔥</div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#1a1a1a", lineHeight: 1 }}>5</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#555" }}>Day Streak</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Keep it up!</div>
              <div style={{ marginTop: 6, height: 6, width: 90, background: "#e8e8e8", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "60%", height: "100%", background: "#2C2DE0", borderRadius: 3 }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { icon: <BookIconStat />, value: "2", label: "Borrowed Books", trend: <TrendUp />, bg: "#f0fbe8" },
            { icon: <BookmarkIconStat />, value: "1", label: "Active Reservations", sparkle: "✦", bg: "#e8f4ff" },
            { icon: <ClockIconStat />, value: "1", label: "Books Due Soon", sparkle: "✦", bg: "#fff8e8" },
            { icon: <BellIconStat />, value: "4", label: "Unread Notifications", sparkle: "✦", bg: "#f8eeff" },
          ].map(({ icon, value, label, trend, sparkle, bg }) => (
            <div key={label} style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#1a1a1a", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#999", marginTop: 3 }}>{label}</div>
              </div>
              {trend && <div style={{ marginLeft: "auto" }}>{trend}</div>}
              {sparkle && <div style={{ position: "absolute", top: 14, right: 14, fontSize: 18, color: sparkle === "✦" ? (label.includes("Reservation") ? "#42A5F5" : label.includes("Due") ? "#FFA726" : "#AB47BC") : "#2C2DE0", opacity: 0.7 }}>✦</div>}
            </div>
          ))}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { icon: <BookEmoji />, label: "Browse Library", bg: "#f0fbe8" },
            { icon: <CalendarEmoji />, label: "Reserve Book", bg: "#e8f0ff" },
            { icon: <StackBooksEmoji />, label: "My Borrowed Books", bg: "#e8f4ff" },
            { icon: <BookmarkEmoji />, label: "My Reservations", bg: "#fff8e8" },
            { icon: <PeopleEmoji />, label: "Community", bg: "#f0e8ff" },
            { icon: <SmileyEmoji />, label: "Profile", bg: "#f0fbe8" },
          ].map(({ icon, label, bg }) => (
            <div key={label} style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: 16, padding: "18px 16px 14px", display: "flex", flexDirection: "column", gap: 10, cursor: "pointer", transition: "transform .15s, box-shadow .15s", position: "relative" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
              </div>
              <div style={{ fontWeight: 900, fontSize: 13, lineHeight: 1.3, color: "#1a1a1a" }}>{label}</div>
              <div style={{ marginTop: "auto", color: "#ccc" }}>
                <ArrowRightSmall />
              </div>
            </div>
          ))}
        </div>

        {/* ── THREE PANELS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 16, marginBottom: 20 }}>

          {/* Active Reservations */}
          <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2C2DE0" strokeWidth="2.5"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                <span style={{ fontWeight: 900, fontSize: 13 }}>Active Reservations</span>
              </div>
              <a href="#" style={{ fontSize: 11, fontWeight: 800, color: "#2C2DE0", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>View all <ChevronRight /></a>
            </div>
            <div style={{ padding: "0 18px" }}>
              {/* Row 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid #f8f8f8" }}>
                <BookCover color="#1565C0" label="Clean Code" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Clean Code</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Robert C. Martin</div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>Ready for pickup</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ background: "#e8fbe6", color: "#2d8a00", fontWeight: 800, fontSize: 10, padding: "3px 8px", borderRadius: 20 }}>Approved</span>
                  <div style={{ fontSize: 10, color: "#aaa", marginTop: 3 }}>Pick up by</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#2C2DE0" }}>30 Jun 2026</div>
                </div>
              </div>
              {/* Row 2 */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0" }}>
                <BookCover color="#558B2F" label="Intro to Algo" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Introduction to Algorithms</div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Cormen, Leiserson, Rivest</div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>In queue</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ background: "#fff8e0", color: "#c77000", fontWeight: 800, fontSize: 10, padding: "3px 8px", borderRadius: 20 }}>Pending</span>
                  <div style={{ fontSize: 10, color: "#aaa", marginTop: 3 }}>Est. available</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#FFA726" }}>08 Jul 2026</div>
                </div>
              </div>
            </div>
            {/* Queue bar */}
            <div style={{ padding: "10px 18px", borderTop: "1px solid #f8f8f8", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ height: 6, borderRadius: 3, background: "#e8e8e8", flex: 1, overflow: "hidden" }}>
                <div style={{ width: "35%", height: "100%", background: "#2C2DE0", borderRadius: 3 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2C2DE0" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#555", whiteSpace: "nowrap" }}>You're #2 in queue</span>
              </div>
              {/* Avatar */}
              <div style={{ display: "flex", gap: -4 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#2C2DE0", border: "2px solid white", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, zIndex: 2 }}>A</div>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#FFA726", border: "2px solid white", marginLeft: -6, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>B</div>
              </div>
            </div>
          </div>

          {/* Borrowed Books */}
          <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2C2DE0" strokeWidth="2.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                <span style={{ fontWeight: 900, fontSize: 13 }}>Borrowed Books</span>
              </div>
              <a href="#" style={{ fontSize: 11, fontWeight: 800, color: "#2C2DE0", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>View all <ChevronRight /></a>
            </div>
            <div style={{ padding: "0 18px" }}>
              {[
                { color: "#1565C0", label: "Computer Networks", title: "Computer Networks", author: "Andrew S. Tanenbaum", due: "Due in", days: "4 days", daysColor: "#EF5350", renew: true },
                { color: "#6A1B9A", label: "Database System", title: "Database System Concepts", author: "Abraham Silberschatz", due: "Due in", days: "10 days", daysColor: "#FFA726", renew: true },
                { color: "#1B5E20", label: "OS Concepts", title: "Operating System Concepts", author: "Abraham Silberschatz", due: "Due in", days: "16 days", daysColor: "#2C2DE0", renew: true },
              ].map((book, i, arr) => (
                <div key={book.title} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid #f8f8f8" : "none" }}>
                  <BookCover color={book.color} label={book.label} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{book.author}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "#888" }}>{book.due}</div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: book.daysColor }}>{book.days}</div>
                    {book.renew && (
                      <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group" style={{ marginTop: 4, padding: "3px 10px", border: "1.5px solid #e0e0e0", borderRadius: 8, background: "white", fontSize: 11, fontWeight: 800, color: "#555", cursor: "pointer" }}>Renew</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2C2DE0" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span style={{ fontWeight: 900, fontSize: 13 }}>Notifications</span>
              </div>
              <a href="#" style={{ fontSize: 11, fontWeight: 800, color: "#2C2DE0", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>View all <ChevronRight /></a>
            </div>
            <div style={{ padding: "0 18px" }}>
              {[
                { icon: <CheckCircleIcon />, bg: "#e8fbe6", text: 'Your reservation for "Clean Code" has been approved.', time: "2 hours ago" },
                { icon: <BookOpenIcon />, bg: "#e8f4ff", text: 'New book "Artificial Intelligence: A Modern Approach" added to the library.', time: "5 hours ago" },
                { icon: <AlertIcon />, bg: "#fff8e0", text: "Library will be closed on Friday, 27 June 2026.", time: "1 day ago" },
                { icon: <WarningIcon />, bg: "#fee8e8", text: 'Please return "Database System Concepts" on time.', time: "2 days ago" },
              ].map((n, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #f8f8f8" : "none" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#333", lineHeight: 1.4 }}>{n.text}</div>
                    <div style={{ fontSize: 10, color: "#bbb", marginTop: 3 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER QUOTE BANNER ── */}
        <div style={{ borderRadius: 18, background: "#f0fbe8", border: "1.5px solid #d0f0b0", padding: "18px 28px", display: "flex", alignItems: "center", gap: 18 }}>
          <SmallOwl size={56} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>"Consistent study today leads to a brighter tomorrow."</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#2C2DE0", fontWeight: 800 }}>— Keep going, you're doing great!</p>
          </div>
          {/* Decorative tree right */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 8, opacity: 0.6 }}>
            <div style={{ width: 4, height: 30, background: "#8BC34A", borderRadius: 2 }} />
            <svg width="24" height="36" viewBox="0 0 24 36">
              <polygon points="12,2 22,20 2,20" fill="#4CAF50" />
              <polygon points="12,10 24,32 0,32" fill="#388E3C" />
              <rect x="10" y="30" width="4" height="6" rx="1" fill="#795548" />
            </svg>
          </div>
        </div>

      </main>
    </div>
  );
}