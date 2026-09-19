// teacher/components/TeacherStatCard.jsx
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };
const trendColor = {
  up:     "text-[#2C2DE0]",
  down:   "text-red-400",
  stable: "text-gray-400",
};

const TeacherStatCard = ({
  label,
  value,
  icon: Icon,
  trend = "stable",
  subLabel,
  loading = false,
  delay = 0,
  accent = "green",
}) => {
  const { isDark } = useTheme();
  const TrendIcon = trendIcon[trend] ?? Minus;

  const accentMap = {
    green: {
      icon: isDark ? "bg-[#2C2DE0]/15 text-[#2C2DE0]" : "bg-[#2C2DE0] text-white",
    },
    black: {
      icon: isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600",
    },
    blue: {
      icon: isDark ? "bg-black/15 text-white" : "bg-black/5 text-black",
    },
    amber: {
      icon: isDark ? "bg-gray-500/15 text-gray-400" : "bg-gray-50 text-gray-600",
    },
  };

  const colors = accentMap[accent] ?? accentMap.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-2xl border p-5 flex flex-col gap-4 transition-shadow hover:shadow-md",
        isDark
          ? "bg-black border-white/10 text-white"
          : "bg-white border-black/8 text-black"
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-xl", colors.icon)}>
          <Icon size={18} />
        </div>
        <TrendIcon size={14} className={cn(trendColor[trend])} />
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className={cn("h-7 w-16 rounded-lg animate-pulse", isDark ? "bg-white/10" : "bg-black/6")} />
          <div className={cn("h-3 w-24 rounded-lg animate-pulse", isDark ? "bg-white/6" : "bg-black/4")} />
        </div>
      ) : (
        <div>
          <p className="text-2xl font-black tracking-tight">{value}</p>
          <p className={cn("text-xs font-medium mt-0.5", isDark ? "text-gray-400" : "text-gray-500")}>
            {label}
          </p>
          {subLabel && (
            <p className="text-[11px] text-[#2C2DE0] mt-0.5 font-semibold">{subLabel}</p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TeacherStatCard;