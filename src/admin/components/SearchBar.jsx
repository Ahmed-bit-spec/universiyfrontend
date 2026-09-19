import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SearchBar = ({
  value,
  onChange,
  placeholder,
  className,
  onClear,
}) => (
  <motion.div
    layout
    className={cn(
      "relative flex items-center",
      className
    )}
  >
    <Search
      size={16}
      className="absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none"
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-xl border border-gray-200/80 dark:border-white/10",
        "bg-white/70 dark:bg-white/5 backdrop-blur-md",
        "py-2.5 pl-10 pr-10 text-sm text-gray-900 dark:text-white",
        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/30 focus:border-[#2C2DE0]/40",
        "transition-all duration-200"
      )}
    />
    {value && (
      <button
        type="button"
        onClick={() => {
          onChange?.("");
          onClear?.();
        }}
        className="absolute right-3 rounded-md p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        <X size={14} />
      </button>
    )}
  </motion.div>
);

export default SearchBar;
