// HeroClock.jsx
// Displays the real server-synced clock (via useServerClock) plus live
// library open/closed status and a countdown to closing. Never reads
// new Date() directly for display — only the synced `now` passed in.

const formatTime = (date, locale) =>
  date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

const formatDate = (date, locale) =>
  date.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" });

const formatCountdown = (ms) => {
  if (ms <= 0) return "0m";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const HeroClock = ({ now, locale = "en", libraryOpensAt, libraryClosesAt, t }) => {
  const isOpen =
    libraryOpensAt != null && libraryClosesAt != null
      ? now.getHours() * 60 + now.getMinutes() >= libraryOpensAt && now.getHours() * 60 + now.getMinutes() < libraryClosesAt
      : null;

  const minutesUntilClose =
    isOpen && libraryClosesAt != null ? libraryClosesAt - (now.getHours() * 60 + now.getMinutes()) : null;

  return (
    <div className="flex items-center gap-2.5 text-white/90 text-[11px] font-semibold">
      <div className="flex flex-col leading-tight">
        <span className="font-black text-sm tabular-nums">{formatTime(now, locale)}</span>
        <span className="opacity-75">{formatDate(now, locale)}</span>
      </div>
      {isOpen !== null && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
            isOpen ? "bg-white dark:bg-gray-900/20 text-white" : "bg-black/20 text-white/70"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-[#6366F1]" : "bg-white dark:bg-gray-900/40"}`} />
          {isOpen ? (t?.hero?.libraryOpen || "Library open") : (t?.hero?.libraryClosed || "Library closed")}
          {isOpen && minutesUntilClose != null && (
            <span className="opacity-80">· {formatCountdown(minutesUntilClose * 60000)}</span>
          )}
        </span>
      )}
    </div>
  );
};

export default HeroClock;