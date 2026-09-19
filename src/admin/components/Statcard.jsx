import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent = "green",
  trend,
  live = false,
  loading = false,
  delay = 0,
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const w = t.adminPanel.pages.dashboard.widgets;

  const isGreen = accent === "green";

  const trendEl =
    trend === "up" ? (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2C2DE0]">
        <TrendingUp size={10} />
        {live ? w.live : w.up}
      </span>
    ) : trend === "down" ? (
      <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold", isDark ? "text-white/40" : "text-black/40")}>
        <TrendingDown size={10} />
        {w.monitor}
      </span>
    ) : (
      <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold", isDark ? "text-white/30" : "text-black/30")}>
        <Minus size={10} />
        {w.stable}
      </span>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-colors",
        isDark
          ? "bg-black border-white/10 hover:border-white/20"
          : "bg-white border-black/8 hover:border-black/16"
      )}
    >
      {/* top accent line */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[2px]",
          isGreen ? "bg-[#2C2DE0]" : isDark ? "bg-white/20" : "bg-black/20"
        )}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isGreen
              ? "bg-[#2C2DE0]/10"
              : isDark
              ? "bg-white/6"
              : "bg-black/5"
          )}
        >
          {Icon && (
            <Icon
              size={15}
              className={isGreen ? "text-[#2C2DE0]" : isDark ? "text-white/60" : "text-black/60"}
            />
          )}
        </div>
        {trendEl}
      </div>

      <p
        className={cn(
          "text-2xl font-black tracking-tight leading-none mb-1",
          isDark ? "text-white" : "text-black"
        )}
      >
        {loading ? (
          <span className={cn("inline-block w-12 h-7 rounded animate-pulse", isDark ? "bg-white/10" : "bg-black/8")} />
        ) : (
          value
        )}
      </p>
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-widest",
          isDark ? "text-white/35" : "text-black/40"
        )}
      >
        {label}
      </p>
    </motion.div>
  );
};

export default StatCard;