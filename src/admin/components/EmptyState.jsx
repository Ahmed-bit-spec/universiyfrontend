import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const EmptyState = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
}) => {
  const { t } = useLanguage();
  const ap = t.adminPanel;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2C2DE0]/10 text-[#2C2DE0] ring-1 ring-[#2C2DE0]/20">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
        {title ?? ap.empty.title}
      </h3>
      <p className="mt-2 max-w-sm text-xs text-gray-500 dark:text-gray-400">
        {description ?? ap.empty.description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
