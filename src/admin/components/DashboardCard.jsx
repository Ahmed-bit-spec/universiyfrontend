import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const DashboardCard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  children,
  className,
  delay = 0,
}) => {
  const { t } = useLanguage();
  const ap = t.adminPanel;
  const isUp = trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/10",
        "bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-5 shadow-sm",
        "hover:border-[#2C2DE0]/25 hover:shadow-lg hover:shadow-[#2C2DE0]/5 dark:hover:shadow-[#2C2DE0]/10",
        "transition-shadow duration-300",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#2C2DE0]/5 blur-2xl group-hover:bg-[#2C2DE0]/10 transition-colors" />

      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2C2DE0]/10 text-[#2C2DE0] ring-1 ring-[#2C2DE0]/20">
            <Icon size={20} strokeWidth={1.75} />
          </div>
        )}
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
              isUp
                ? "bg-[#2C2DE0]/10 text-[#2C2DE0] dark:text-[#2C2DE0]"
                : "bg-red-500/10 text-red-500 dark:text-red-400"
            )}
          >
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </span>
        )}
      </div>

      <p className="mt-4 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {label}
      </p>
      {trend && (
        <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
          {ap.common.vsLastPeriod}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
};

export default DashboardCard;
