import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

const ThemeToggle = ({ className = "", size = "md", showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const label = isDark ? t.settings.switchLightMode : t.settings.switchDarkMode;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl
        text-gray-500 dark:text-gray-400
        hover:text-gray-900 dark:hover:text-white
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2DE0]/50
        transition-all duration-150
        ${showLabel ? "px-3 py-2 text-sm font-semibold" : sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {showLabel && <span>{isDark ? t.settings.lightMode : t.settings.darkMode}</span>}
    </button>
  );
};

export default ThemeToggle;
