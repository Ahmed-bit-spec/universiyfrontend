// ProgressStrip.jsx
// Four at-a-glance numbers a student actually checks daily.
// Each card is a Link, not a static tile — clicking takes you to the
// relevant section instead of being purely decorative.

import { Link } from "react-router-dom";
import { BookMarked, CalendarClock, AlarmClock, Bell } from "lucide-react";

const STAT_CONFIG = [
  { key: "borrowed",     icon: BookMarked,   label: "Borrowed books",        href: "/e-library/my-borrows",  tint: "#2C2DE0", bg: "#EEF2FF" },
  { key: "reservations", icon: CalendarClock, label: "Active reservations",  href: "/my-reservations",       tint: "#2F8FE0", bg: "#E6F2FE" },
  { key: "dueSoon",      icon: AlarmClock,   label: "Due within 3 days",     href: "/e-library/my-borrows",  tint: "#F5A623", bg: "#FFF4E0" },
  { key: "unread",       icon: Bell,         label: "Unread notifications",  href: "/notifications",         tint: "#9B5DE5", bg: "#F3E9FE" },
];

const ProgressStrip = ({ stats = {} }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STAT_CONFIG.map(({ key, icon: Icon, label, href, tint, bg }) => (
        <Link
          key={key}
          to={href}
          className="group bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-4 flex items-center gap-3.5 hover:border-[#2C2DE0] dark:hover:border-[#2C2DE0] hover:-translate-y-0.5 transition-all duration-150"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: bg }}
          >
            <Icon size={19} style={{ color: tint }} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-gray-900 dark:text-white leading-none">
              {stats[key] ?? 0}
            </p>
            <p className="text-[11px] font-semibold text-gray-400 mt-1 leading-tight">{label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProgressStrip;