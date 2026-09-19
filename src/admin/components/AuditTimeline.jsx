import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const formatValue = (value, labels) => {
  if (value === true) return labels.yes;
  if (value === false) return labels.no;
  if (value === null || value === undefined || value === "") return labels.notAvailable;
  return String(value);
};

const AuditTimeline = ({ items = [], labels }) => {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-gray-200/70 bg-white/60 p-6 text-sm text-gray-500 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
        {labels.empty}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white/60 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
      <div className="space-y-0">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            <div className="flex flex-col items-center">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#2C2DE0]/10 text-[#2C2DE0] ring-1 ring-[#2C2DE0]/20 dark:text-[#2C2DE0]">
                <Activity size={15} />
              </span>
              {index < items.length - 1 && (
                <span className="mt-2 h-full w-px bg-gray-200 dark:bg-white/10" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {labels.actions[item.action] || item.action}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {item.performedBy?.name || labels.system} - {item.createdAt ? new Date(item.createdAt).toLocaleString() : labels.notAvailable}
              </p>
              {item.details?.changes?.length > 0 && (
                <div className="mt-3 grid gap-2">
                  {item.details.changes.map((change) => (
                    <div
                      key={change.field}
                      className="rounded-xl border border-gray-200/70 bg-white/50 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <p className="font-bold text-gray-700 dark:text-gray-200">
                        {labels.fields?.[change.field] || change.field}
                      </p>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">
                        {labels.from}: {formatValue(change.from, labels)} - {labels.to}: {formatValue(change.to, labels)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {!item.details?.changes?.length && item.details?.to !== undefined && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {labels.to}: {formatValue(item.details.to, labels)}
                </p>
              )}
              {!item.details?.changes?.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {["provider", "lastLogin", "deletedAt"].map((field) =>
                    item.details?.[field] ? (
                      <span
                        key={field}
                        className="rounded-full border border-gray-200/70 bg-white/50 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300"
                      >
                        {labels.fields?.[field] || field}: {formatValue(
                          field === "lastLogin" || field === "deletedAt"
                            ? new Date(item.details[field]).toLocaleString()
                            : item.details[field],
                          labels
                        )}
                      </span>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AuditTimeline;
