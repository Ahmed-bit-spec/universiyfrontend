import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, CheckCircle2, Eye, MoreHorizontal, Pencil, Shield, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const UserActionDropdown = ({ labels, user, onView, onEdit, onPromote, onSuspend, onVerify, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const itemClass = cn(
    "flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-semibold",
    "text-gray-700 hover:bg-[#2C2DE0]/10 hover:text-[#2C2DE0]",
    "dark:text-gray-200 dark:hover:text-[#2C2DE0] transition-colors"
  );

  const run = (callback) => {
    setOpen(false);
    callback?.(user);
  };

  return (
    <div ref={ref} className="relative inline-flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
        aria-label={labels.actions}
      >
        <MoreHorizontal size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200/80 bg-white/95 py-1 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/95"
          >
            <button type="button" className={itemClass} onClick={() => run(onView)}>
              <Eye size={14} /> {labels.viewDetails}
            </button>
            <button type="button" className={itemClass} onClick={() => run(onEdit)}>
              <Pencil size={14} /> {labels.editUser}
            </button>
            {user.role === "student" && (
              <button type="button" className={itemClass} onClick={() => run(onPromote)}>
                <Shield size={14} /> {labels.makeAdmin}
              </button>
            )}
            {!user.universityVerified && (
              <button type="button" className={itemClass} onClick={() => run(onVerify)}>
                <CheckCircle2 size={14} /> {labels.verifyUniversity}
              </button>
            )}
            {user.accountStatus === "active" && (
              <button type="button" className={itemClass} onClick={() => run(onSuspend)}>
                <Ban size={14} /> {labels.suspend}
              </button>
            )}
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400 transition-colors"
              onClick={() => run(onDelete)}
            >
              <Trash2 size={14} /> {labels.delete}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserActionDropdown;
