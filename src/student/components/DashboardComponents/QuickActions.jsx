import { Link } from "react-router-dom";
import { BookOpen, Armchair, BookCopy, BookmarkCheck, Users, UserCircle, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const ACTION_ICONS = [BookOpen, Armchair, BookCopy, BookmarkCheck, Users, UserCircle];
const ACTION_HREFS = ["/e-library", "/seats", "/e-library/my-borrows", "/my-reservations", "/community", "/profile"];
const ACTION_FALLBACKS = [
  "Browse library",
  "Reserve a seat",
  "My borrowed books",
  "My reservations",
  "Community",
  "Profile",
];

const QuickActions = () => {
  const { t } = useLanguage();
  const qa = t?.quickActions ?? {};

  const actions = ACTION_FALLBACKS.map((fallback, i) => ({
    icon: ACTION_ICONS[i],
    href: ACTION_HREFS[i],
    label: qa?.items?.[i] ?? fallback,
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map(({ icon: Icon, label, href }) => (
        <Link
          key={href}
          to={href}
          className="group relative bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 pt-4 pb-3.5 flex flex-col gap-3 hover:border-[#2C2DE0] dark:hover:border-[#2C2DE0] hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5 transition-all duration-150"
        >
          <div className="w-11 h-11 rounded-xl dark:bg-[#2C2DE0]/10 flex items-center justify-center">
            <Icon size={19} className="text-[#2C2DE0]" strokeWidth={2.2} />
          </div>
          <span className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug">{label}</span>
          <ArrowUpRight
            size={13}
            className="absolute top-4 right-4 text-gray-300 dark:text-gray-700 group-hover:text-[#2C2DE0] transition-colors"
          />
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;