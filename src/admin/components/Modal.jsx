import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}) => {
  const { t } = useLanguage();
  const ap = t.adminPanel;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-auto w-full rounded-2xl border border-gray-200/80 dark:border-white/10",
                "bg-white/95 dark:bg-gray-950/95 shadow-2xl backdrop-blur-xl",
                sizes[size]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-white/10 px-6 py-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {title ?? ap.modal.defaultTitle}
                  </h2>
                  {description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                  aria-label={ap.common.close}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-5">{children}</div>
              {footer && (
                <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-white/10 px-6 py-4">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
