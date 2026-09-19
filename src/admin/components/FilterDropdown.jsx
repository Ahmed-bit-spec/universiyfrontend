import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FilterDropdown = ({
  label,
  options = [],
  value,
  onChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-gray-200/80 dark:border-white/10",
          "bg-white/70 dark:bg-white/5 backdrop-blur-md px-3.5 py-2.5",
          "text-xs font-semibold text-gray-700 dark:text-gray-200",
          "hover:border-[#2C2DE0]/30 transition-all duration-200"
        )}
      >
        <span className="text-gray-400 dark:text-gray-500">{label}</span>
        <span>{selected?.label ?? label}</span>
        <ChevronDown
          size={14}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute left-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl",
              "border border-gray-200/80 dark:border-white/10",
              "bg-white/95 dark:bg-gray-950/95 shadow-xl backdrop-blur-xl py-1"
            )}
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange?.(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3.5 py-2 text-xs font-medium",
                    "text-gray-700 dark:text-gray-200 hover:bg-[#2C2DE0]/10 hover:text-[#2C2DE0] dark:hover:text-[#2C2DE0] transition-colors",
                    value === opt.value && "text-[#2C2DE0] dark:text-[#2C2DE0]"
                  )}
                >
                  {opt.label}
                  {value === opt.value && <Check size={14} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterDropdown;
