import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import useLanguage from "@/hooks/useLanguage";
import axios from "axios";
import {
  X, User, Mail, Lock, Camera,
  Languages, CheckCircle2, AlertCircle,
  Eye, EyeOff, Loader2, Globe,
} from "lucide-react";



// ✅ New — always point to backend port 3000
const resolvePhoto = (photo) => {
  if (!photo) return null;
  if (photo.startsWith("blob:") || photo.startsWith("http")) return photo;
  return `${import.meta.env.VITE_API_BASE_URL ?? "https://api.unicores.site/api/v1"}/${photo}`;
};

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

// ── Input field ───────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, type = "text", value, onChange, placeholder, rightSlot }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
      {label}
    </label>
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/40 focus:border-[#2C2DE0] dark:focus:border-[#2C2DE0] transition-all py-3 pl-10 ${rightSlot ? "pr-11" : "pr-4"}`}
      />
      {rightSlot && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  </div>
);

// ── Status banner ─────────────────────────────────────────────────────────────
const Banner = ({ type, message }) => {
  if (!message) return null;
  const ok = type === "success";
  return (
    <div className={`flex items-start gap-2 rounded-xl px-3.5 py-3 border text-xs leading-relaxed ${ok
      ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 border-[#2C2DE0] dark:border-[#2C2DE0]/20 text-[#2C2DE0] dark:text-[#2C2DE0]"
      : "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400"
      }`}>
      {ok ? <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />}
      <span>{message}</span>
    </div>
  );
};

// ── Section card ──────────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <Icon size={13} className="text-[#2C2DE0] flex-shrink-0" />
      <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
        {title}
      </p>
    </div>
    <div className="px-4 pt-5 pb-5 bg-white dark:bg-gray-950 flex flex-col gap-4">
      {children}
    </div>
  </div>
);

const EyeToggle = ({ show, onToggle }) => (
  <button type="button" onClick={onToggle} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
    {show ? <EyeOff size={15} /> : <Eye size={15} />}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main drawer
// ─────────────────────────────────────────────────────────────────────────────
const SettingsDrawer = ({ open, onClose }) => {
  const { user, setUser } = useAuth();
  const { language, setLanguage } = useLanguage();

  const fileRef = useRef(null);

  // ── FIX 1: Photo — always read directly from user object when drawer opens.
  // Using a separate preview URL only after the user picks a new file.
  // This ensures the current saved photo always shows correctly.
  const [previewPhoto, setPreviewPhoto] = useState(null); // local preview only
  const [photoFile, setPhotoFile] = useState(null);

  // The photo to display: local preview if picked, otherwise user's saved photo
  const displayPhoto = previewPhoto || resolvePhoto(user?.photo) || null;

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileStatus, setProfileStatus] = useState({ type: null, msg: null });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwStatus, setPwStatus] = useState({ type: null, msg: null });
  const [savingPw, setSavingPw] = useState(false);

  // Language
  const [langMsg, setLangMsg] = useState(null);

  // ── FIX 2: Detect Google user.
  // Google users have no password. Your backend should set user.provider = "google"
  // OR user.googleId when OAuth. Check both common patterns.
  const isGoogleUser = !!(user?.googleId || user?.provider === "google");

  // Reset all state every time drawer opens — pick up latest user data
  useEffect(() => {
    if (open) {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setPreviewPhoto(null);   // clear any old local preview
      setPhotoFile(null);
      setProfileStatus({ type: null, msg: null });
      setPwStatus({ type: null, msg: null });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setShowCurrent(false); setShowNew(false); setShowConfirm(false);
      setLangMsg(null);
    }
  }, [open, user]);

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPreviewPhoto(URL.createObjectURL(file)); // show local preview instantly
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileStatus({ type: null, msg: null });
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      if (photoFile) fd.append("photo", photoFile);

      const res = await axios.put("/api/v1/auth/profile", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (setUser) setUser(res.data?.data?.user || res.data?.user); // formatResponse wraps as { data: { user } }
      setPhotoFile(null);
      setPreviewPhoto(null); // clear preview — now the context photo is the source of truth
      setProfileStatus({ type: "success", msg: language === "so" ? "Profile si guul leh ayaa loo cusboonaysiiyay." : "Profile updated successfully." });
    } catch (err) {
      setProfileStatus({ type: "error", msg: err.response?.data?.message || (language === "so" ? "Wax qalad ah ayaa dhacay." : "Something went wrong.") });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    setPwStatus({ type: null, msg: null });
    const errMatch = language === "so" ? "Erayga sirta cusub isku mid ma aha." : "New passwords do not match.";
    const errShort = language === "so" ? "Erayga sirta waa inuu ahaadaa ugu yaraan 6 xaraf." : "Password must be at least 6 characters.";
    if (newPw !== confirmPw) { setPwStatus({ type: "error", msg: errMatch }); return; }
    if (newPw.length < 6) { setPwStatus({ type: "error", msg: errShort }); return; }

    setSavingPw(true);
    try {
      await axios.put(
        "/api/v1/auth/update-password",
        { currentPassword: currentPw, newPassword: newPw },
        { withCredentials: true }
      );
      setPwStatus({ type: "success", msg: language === "so" ? "Erayga sirta waa la beddelay." : "Password changed successfully." });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      setPwStatus({ type: "error", msg: err.response?.data?.message || (language === "so" ? "Wax qalad ah ayaa dhacay." : "Something went wrong.") });
    } finally {
      setSavingPw(false);
    }
  };

  const handleLangChange = (val) => {
    setLanguage(val);
    setLangMsg(val === "so" ? "Luqadda waa la keydiay." : "Language saved.");
    setTimeout(() => setLangMsg(null), 2500);
  };

  const isSo = language === "so";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Drawer */}
      <aside className={`
        fixed top-0 right-0 z-50 h-full
        w-[380px] max-w-[88vw]
        bg-white dark:bg-gray-950
        border-l border-gray-100 dark:border-gray-800
        shadow-2xl flex flex-col
        transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}
      `}>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-base font-black text-gray-900 dark:text-white leading-tight">
              {isSo ? "Goobta Xisaabta" : "Account Settings"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isSo ? "Maamul macluumaadkaaga" : "Manage your profile"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-6 py-6 flex flex-col gap-5">

            {/* ── 1. PHOTO ── */}
            <Section title={isSo ? "Sawirka Profile" : "Profile Photo"} icon={Camera}>
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  {/* 
                    Photo display priority:
                    1. Local preview (just picked a file, not saved yet)
                    2. user.photo from auth context (saved photo from server)
                    3. Initials fallback
                  */}
                  <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#2C2DE0] to-[#2C2DE0] flex items-center justify-center text-white font-black text-2xl shadow">
                    {displayPhoto ? (
                      <img
                        src={displayPhoto}
                        alt="avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Image failed to load:", e.target.src);
                        }} />
                    ) : (
                      getInitials(name || user?.name)
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white flex items-center justify-center shadow-md transition-colors"
                  >
                    <Camera size={13} />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="text-sm font-bold text-[#2C2DE0] hover:text-[#2C2DE0] text-left transition-colors"
                  >
                    {isSo ? "Bedel Sawirka" : "Change Photo"}
                  </button>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {isSo ? "JPG ama PNG, ugu badnaan 2 MB." : "JPG or PNG, max 2 MB."}
                  </p>
                  {/* Show "unsaved" indicator when a new photo is picked but not yet saved */}
                  {photoFile && (
                    <p className="text-[10px] text-yellow-500 font-semibold">
                      {isSo ? "Sawir cusub — wali lama keydin" : "New photo — not saved yet"}
                    </p>
                  )}
                </div>
              </div>
            </Section>

            {/* ── 2. PROFILE ── */}
            <Section title={isSo ? "Macluumaadka Profile" : "Profile Information"} icon={User}>
              <Field
                label={isSo ? "Magaca Buuxa" : "Full Name"}
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isSo ? "Geli magacaaga buuxa" : "Enter your full name"}
              />
              <Field
                label={isSo ? "Cinwaanka Email" : "Email Address"}
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isSo ? "Geli emailkaaga" : "Enter your email"}
              />
              <Banner type={profileStatus.type} message={profileStatus.msg} />
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#2C2DE0] hover:bg-[#2C2DE0] active:bg-[#2C2DE0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-sm shadow-[#2C2DE0] dark:shadow-none text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              >
                {savingProfile && <Loader2 size={14} className="animate-spin" />}
                {savingProfile
                  ? (isSo ? "Keydinaya…" : "Saving…")
                  : (isSo ? "Keydi Isbedelada" : "Save Changes")}
              </button>
            </Section>

            {/* ── 3. PASSWORD — hidden for Google users ── */}
            {isGoogleUser ? (
              // Google user — explain why there's no password option
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <Globe size={13} className="text-gray-400 flex-shrink-0" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    {isSo ? "Erayga Sirta" : "Password"}
                  </p>
                </div>
                <div className="px-4 py-5 bg-white dark:bg-gray-950">
                  <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl px-4 py-3">
                    <Globe size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                      {isSo
                        ? "Waxaad isku dinwaan galisay Google sidaas darteed wax password ah malahid waxaad ka badalankrtaa Google."
                        : "You signed in with Google. Your account doesn't use a password."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Email user — show full password change form
              <Section title={isSo ? "Beddel Erayga Sirta" : "Change Password"} icon={Lock}>
                <Field
                  label={isSo ? "Erayga Sirta Hadda" : "Current Password"}
                  icon={Lock}
                  type={showCurrent ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder={isSo ? "Eraygaaga sirta ee hadda" : "Your current password"}
                  rightSlot={<EyeToggle show={showCurrent} onToggle={() => setShowCurrent((s) => !s)} />}
                />
                <Field
                  label={isSo ? "Erayga Sirta Cusub" : "New Password"}
                  icon={Lock}
                  type={showNew ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder={isSo ? "Ugu yaraan 6 xaraf" : "At least 6 characters"}
                  rightSlot={<EyeToggle show={showNew} onToggle={() => setShowNew((s) => !s)} />}
                />
                <Field
                  label={isSo ? "Xaqiiji Erayga Cusub" : "Confirm New Password"}
                  icon={Lock}
                  type={showConfirm ? "text" : "password"}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder={isSo ? "Ku celceli erayga sirta cusub" : "Repeat new password"}
                  rightSlot={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />}
                />
                <Banner type={pwStatus.type} message={pwStatus.msg} />
                <button
                  onClick={handleSavePassword}
                  disabled={savingPw || !currentPw || !newPw || !confirmPw}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#2C2DE0] hover:bg-[#2C2DE0] active:bg-[#2C2DE0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-sm shadow-[#2C2DE0] dark:shadow-none text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                >
                  {savingPw && <Loader2 size={14} className="animate-spin" />}
                  {savingPw
                    ? (isSo ? "Cusboonaysiinaya…" : "Updating…")
                    : (isSo ? "Cusboonaysii Erayga Sirta" : "Update Password")}
                </button>
              </Section>
            )}

            {/* ── 4. LANGUAGE ── */}
            <Section title={isSo ? "Doorashada Luqadda" : "Language Preference"} icon={Languages}>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {isSo
                    ? "Dooro luqadda aad rabto. Abka oo dhan si degdeg ah ayuu u beddelayaa."
                    : "Choose your preferred language. The whole app switches instantly."}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { value: "en", flag: "🇬🇧", name: "English", sub: "English" },
                  { value: "so", flag: "🇸🇴", name: "Soomaali", sub: "Af Soomaali" },
                ].map((opt) => {
                  const isActive = language === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleLangChange(opt.value)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all duration-150 ${isActive
                        ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 border-[#2C2DE0] dark:border-[#2C2DE0]"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-[#2C2DE0] dark:hover:border-[#2C2DE0]"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl leading-none">{opt.flag}</span>
                        <div>
                          <p className={`text-sm font-bold leading-tight ${isActive ? "text-[#2C2DE0] dark:text-[#2C2DE0]" : "text-gray-700 dark:text-gray-200"}`}>
                            {opt.name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{opt.sub}</p>
                        </div>
                      </div>
                      {isActive && <CheckCircle2 size={17} className="text-[#2C2DE0] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {langMsg && <Banner type="success" message={langMsg} />}
            </Section>

            <div className="h-1" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 pt-4 pb-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            {isSo ? "Xir" : "Close"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default SettingsDrawer;