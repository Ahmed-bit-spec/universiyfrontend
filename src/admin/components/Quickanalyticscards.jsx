import { motion } from "framer-motion";
import { Armchair, User, BookOpen, MapPin, Wifi } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const getCards = (w) => [
  {
    key: "mostUsedSeat",
    label: w.mostUsedSeat,
    icon: Armchair,
    getValue: (s) => s?.mostUsedSeat?.seatNumber ?? "—",
    getMeta:  (s) =>
      s?.mostUsedSeat?.count != null
        ? `${s.mostUsedSeat.count} ${w.uses}`
        : w.noDataAvailable,
  },
  {
    key: "mostActiveStudent",
    label: w.mostActive,
    icon: User,
    getValue: (s) => s?.mostActiveStudent?.name ?? "—",
    getMeta:  (s) =>
      s?.mostActiveStudent?.count != null
        ? `${s.mostActiveStudent.count} ${w.reservations}`
        : w.noDataAvailable,
  },
  {
    key: "mostBorrowedBook",
    label: w.topBook,
    icon: BookOpen,
    getValue: (s) => s?.mostBorrowedBook?.title ?? "—",
    getMeta:  (s) =>
      s?.mostBorrowedBook?.count != null
        ? `${s.mostBorrowedBook.count} ${w.borrows}`
        : w.noDataAvailable,
  },
  {
    key: "mostPopularZone",
    label: w.topZone,
    icon: MapPin,
    getValue: (s) => s?.mostPopularZone?.name ?? "—",
    getMeta:  (s) =>
      s?.mostPopularZone?.pct != null
        ? `${s.mostPopularZone.pct}${w.ofTraffic}`
        : w.noDataAvailable,
  },
  {
    key: "onlineUsers",
    label: w.onlineNow,
    icon: Wifi,
    getValue: (s) => (s?.onlineUsers != null ? String(s.onlineUsers) : "—"),
    getMeta:  () => w.viaSocketIo,
  },
];

const QuickAnalyticsCards = ({ stats, loading }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const w = t.adminPanel.pages.dashboard.widgets;
  
  const cards = getCards(w);

  const base = isDark ? "bg-black border-white/10" : "bg-white border-black/8";

  return (
    <div className={cn("rounded-xl border p-5", base)}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className={cn(
            "text-sm font-semibold",
            isDark ? "text-white" : "text-black"
          )}
        >
          {w.quickAnalytics}
        </h3>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            isDark ? "text-white/30" : "text-black/30"
          )}
        >
          {w.topPerformers}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          const value = card.getValue(stats);
          const meta  = card.getMeta(stats);

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={cn(
                "rounded-lg border p-3.5",
                isDark
                  ? "bg-white/[0.03] border-white/8"
                  : "bg-black/[0.02] border-black/6"
              )}
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center mb-2.5 bg-[#2C2DE0]/10">
                <Icon size={13} className="text-[#2C2DE0]" />
              </div>

              {loading ? (
                <div
                  className={cn(
                    "h-4 w-16 rounded animate-pulse mb-1",
                    isDark ? "bg-white/8" : "bg-black/6"
                  )}
                />
              ) : (
                <p
                  className={cn(
                    "text-sm font-bold leading-tight truncate",
                    isDark ? "text-white" : "text-black"
                  )}
                  title={value}
                >
                  {value}
                </p>
              )}

              <p
                className={cn(
                  "text-[10px] mt-1",
                  isDark ? "text-white/30" : "text-black/35"
                )}
              >
                {loading ? "..." : meta}
              </p>
              <p
                className={cn(
                  "text-[9px] font-bold uppercase tracking-widest mt-1",
                  isDark ? "text-white/20" : "text-black/25"
                )}
              >
                {card.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickAnalyticsCards;