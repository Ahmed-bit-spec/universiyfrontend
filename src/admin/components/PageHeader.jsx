import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PageHeader = ({
  title,
  subtitle,
  actions,
  badge,
  className,
}) => (
  <motion.header
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={cn(
      "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8",
      className
    )}
  >
    <div>
      {badge && (
        <span className="inline-block mb-2 text-[10px] font-bold uppercase tracking-widest text-[#2C2DE0]">
          {badge}
        </span>
      )}
      <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1.5 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
    )}
  </motion.header>
);

export default PageHeader;
