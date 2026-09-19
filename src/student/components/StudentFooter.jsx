import { useLanguage } from "@/hooks/useLanguage";
import { sectionWrap } from "@/shared/constants/surfaces";

const StudentFooter = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 border-t border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl">
      <div className={sectionWrap}>
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {t.common.appName} · {t.dashboard.footerRights}
          </p>
          <p className="text-xs text-gray-400">{t.dashboard.footerBuilt}</p>
        </div>
      </div>
    </footer>
  );
};

export default StudentFooter;
