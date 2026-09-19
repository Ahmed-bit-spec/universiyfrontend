// teacher/pages/TeacherPlaceholderPage.jsx
// Used for pages that are not yet built.
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const TeacherPlaceholderPage = ({ title, icon: Icon, description }) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-28 text-center"
    >
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border",
          isDark ? "bg-white/5 border-white/10" : "bg-[#2C2DE0] border-[#2C2DE0]"
        )}
      >
        <Icon size={28} className="text-[#2C2DE0]" />
      </div>
      <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm leading-relaxed">
        {description}
      </p>
      <div className="mt-6">
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#2C2DE0] bg-[#2C2DE0]/10 border border-[#2C2DE0]/20 px-3 py-1.5 rounded-lg">
          Coming Soon
        </span>
      </div>
    </motion.div>
  );
};

export default TeacherPlaceholderPage;