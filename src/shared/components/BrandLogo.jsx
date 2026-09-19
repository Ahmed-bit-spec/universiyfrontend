import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const BrandLogo = ({ to = "/" }) => {
  const { t } = useLanguage();

  return (
    <Link to={to} className="flex items-center gap-2.5 group shrink-0">
      <div className="w-8 h-8 rounded-lg bg-[#2C2DE0] flex items-center justify-center shadow-sm shadow-[#2C2DE0]/20">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="2" y="2" width="5" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="9" y="2" width="5" height="4" rx="1" fill="white" opacity="0.6" />
          <rect x="9" y="8" width="5" height="6" rx="1" fill="white" opacity="0.9" />
          <rect x="2" y="11" width="5" height="3" rx="1" fill="white" opacity="0.6" />
        </svg>
      </div>
      <div className="leading-none min-w-0">
        <span className="block text-[13px] font-black tracking-tight text-gray-900 dark:text-white group-hover:text-[#2C2DE0] dark:group-hover:text-[#2C2DE0] transition-colors truncate">
          {t.common.appName}
        </span>
        <span className="block text-[9px] font-semibold tracking-[0.15em] uppercase text-[#2C2DE0]">
          {t.common.university}
        </span>
      </div>
    </Link>
  );
};

export default BrandLogo;
