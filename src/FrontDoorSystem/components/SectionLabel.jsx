const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-8 sm:mb-10">
    <div className="h-px flex-1 bg-gray-200/80 dark:bg-white dark:bg-gray-900/10" />
    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 dark:text-gray-400 whitespace-nowrap">
      {children}
    </span>
    <div className="h-px flex-1 bg-gray-200/80 dark:bg-white dark:bg-gray-900/10" />
  </div>
);

export default SectionLabel;
