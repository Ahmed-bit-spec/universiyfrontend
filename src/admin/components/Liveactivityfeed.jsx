import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

// ── dot colour based on action text ──────────────────────────────────────────
const typeColor = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("reserved") || a.includes("reservation")) return "bg-[#2C2DE0]";
  if (a.includes("checked in") || a.includes("check-in"))  return "bg-[#2C2DE0]";
  if (a.includes("borrowed"))  return "bg-white";
  if (a.includes("returned"))  return "bg-white/60";
  if (a.includes("cancelled")) return "bg-white/30";
  if (a.includes("admin"))     return "bg-[#2C2DE0]";
  return "bg-white/40";
};

// ── normalise every activity item coming from the server ──────────────────────
// getRecentActivity() returns: { id, type, user, detail, status, timestamp }
// This component expects:      { id, action, student, book, timestamp }
// We support BOTH shapes so nothing breaks if the service is already updated.
const normalise = (item) => ({
  id:        item.id        ?? item._id,
  action:    item.action    ?? item.detail   ?? "",   // ← key fix
  student:   item.student   ?? item.user     ?? "",   // ← key fix
  book:      item.book      ?? null,
  timestamp: item.timestamp ?? item.updatedAt ?? item.createdAt,
});

const LiveActivityFeed = ({ activities = [] }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const w = t.adminPanel.pages.dashboard.widgets;
  const listRef = useRef(null);

  // scroll to top whenever the list refreshes
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [activities]);

  const base = isDark ? "bg-black border-white/10" : "bg-white border-black/8";

  const items = activities.slice(0, 20).map(normalise);

  return (
    <div className={cn("rounded-xl border h-full flex flex-col", base)}>
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-inherit">
        <h3 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-black")}>
          {w.liveActivity}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2C2DE0] animate-pulse" />
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-widest",
              isDark ? "text-white/35" : "text-black/35"
            )}
          >
            {w.last20}
          </span>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-0"
        style={{ maxHeight: 380 }}
      >
        <AnimatePresence initial={false}>
          {items.length === 0 ? (
            <p
              className={cn(
                "text-xs py-6 text-center",
                isDark ? "text-white/30" : "text-black/30"
              )}
            >
              {w.noActivityYet}
            </p>
          ) : (
            items.map((item, i) => (
              <motion.div
                key={item.id ?? i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.22, delay: i * 0.025 }}
                className={cn(
                  "flex items-start gap-2.5 py-2.5",
                  i < items.length - 1
                    ? isDark
                      ? "border-b border-white/5"
                      : "border-b border-black/5"
                    : ""
                )}
              >
                {/* status dot */}
                <span
                  className={cn(
                    "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                    typeColor(item.action)
                  )}
                />

                <div className="flex-1 min-w-0">
                  {/* primary action line */}
                  <p
                    className={cn(
                      "text-xs leading-snug",
                      isDark ? "text-white/80" : "text-black/80"
                    )}
                  >
                    {item.action || "—"}
                  </p>

                  {/* secondary meta: student name / book title */}
                  {(item.student || item.book) && (
                    <p
                      className={cn(
                        "text-[10px] mt-0.5 truncate",
                        isDark ? "text-white/35" : "text-black/35"
                      )}
                    >
                      {[item.student, item.book].filter(Boolean).join(" — ")}
                    </p>
                  )}
                </div>

                {/* timestamp */}
                <span
                  className={cn(
                    "text-[10px] shrink-0 font-mono mt-0.5",
                    isDark ? "text-white/25" : "text-black/30"
                  )}
                >
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleTimeString("en-US", {
                        hour:   "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveActivityFeed;