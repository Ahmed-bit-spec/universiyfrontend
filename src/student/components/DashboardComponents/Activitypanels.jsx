// ActivityPanels.jsx
// Three panels students check most: what's waiting for pickup, what's due
// back, and what they've missed. Pure presentation — feed it real data.

import { Link } from "react-router-dom";
import { CalendarCheck, BookCopy, Bell, ChevronRight, Clock } from "lucide-react";

const PanelShell = ({ icon: Icon, title, viewAllHref, children }) => (
  <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col">
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-[#2C2DE0]" strokeWidth={2.3} />
        <span className="text-[13px] font-black text-gray-900 dark:text-white">{title}</span>
      </div>
      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="text-[11px] font-bold text-[#2C2DE0] hover:text-[#2C2DE0] flex items-center gap-0.5"
        >
          View all <ChevronRight size={12} />
        </Link>
      )}
    </div>
    <div className="px-5 flex-1">{children}</div>
  </div>
);

const Cover = ({ color = "#2D6A00", initials = "?" }) => (
  <div
    className="w-9 h-12 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white"
    style={{ background: color }}
  >
    {initials}
  </div>
);

const STATUS_STYLES = {
  approved: { bg: "#EEF2FF", text: "#2D6A00", label: "Approved" },
  pending:  { bg: "#FFF4E0", text: "#B97300", label: "Pending"  },
};

const urgencyColor = (days) => (days <= 3 ? "#E5484D" : days <= 7 ? "#F5A623" : "#2C2DE0");

export const ReservationsPanel = ({ items = [] }) => (
  <PanelShell icon={CalendarCheck} title="Active reservations" viewAllHref="/my-reservations">
    {items.length === 0 ? (
      <p className="py-6 text-xs text-gray-400 text-center">No active reservations right now.</p>
    ) : (
      items.map((item, i) => {
        const status = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-3 py-3.5 ${i < items.length - 1 ? "border-b border-gray-50 dark:border-gray-900" : ""}`}
          >
            <Cover color={item.coverColor} initials={item.initials} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{item.author}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span
                className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: status.bg, color: status.text }}
              >
                {status.label}
              </span>
              <p className="text-[10px] text-gray-400 mt-1">{item.dateLabel}</p>
            </div>
          </div>
        );
      })
    )}
  </PanelShell>
);

export const BorrowedPanel = ({ items = [] }) => (
  <PanelShell icon={BookCopy} title="Borrowed books" viewAllHref="/e-library/my-borrows">
    {items.length === 0 ? (
      <p className="py-6 text-xs text-gray-400 text-center">You haven't borrowed any books yet.</p>
    ) : (
      items.map((item, i) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 py-3.5 ${i < items.length - 1 ? "border-b border-gray-50 dark:border-gray-900" : ""}`}
        >
          <Cover color={item.coverColor} initials={item.initials} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{item.author}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-gray-400">Due in</p>
            <p className="text-[12px] font-black" style={{ color: urgencyColor(item.daysLeft) }}>
              {item.daysLeft} {item.daysLeft === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      ))
    )}
  </PanelShell>
);

export const NotificationsPanel = ({ items = [] }) => (
  <PanelShell icon={Bell} title="Notifications" viewAllHref="/notifications">
    {items.length === 0 ? (
      <p className="py-6 text-xs text-gray-400 text-center">You're all caught up.</p>
    ) : (
      items.map((n, i) => (
        <div
          key={n.id}
          className={`flex items-start gap-2.5 py-3 ${i < items.length - 1 ? "border-b border-gray-50 dark:border-gray-900" : ""}`}
        >
          <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock size={13} className="text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-gray-700 dark:text-gray-300 leading-snug">{n.text}</p>
            <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">{n.time}</p>
          </div>
        </div>
      ))
    )}
  </PanelShell>
);