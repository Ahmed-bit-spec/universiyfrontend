import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, Clock, Palette } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "@/admin/components/PageTransition";
import PageHeader from "@/admin/components/PageHeader";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const SettingsSection = ({ icon: Icon, title, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-6"
  >
    <div className="flex items-center gap-3 mb-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2C2DE0]/10 text-[#2C2DE0]">
        <Icon size={18} />
      </div>
      <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </motion.section>
);

const ToggleRow = ({ label, defaultOn = false }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/10 last:border-0">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          on ? "bg-[#2C2DE0]" : "bg-gray-300 dark:bg-gray-700"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            on && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
};

const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const ap = t.adminPanel;
  const p = ap.pages.settings;

  return (
    <PageTransition>
      <PageHeader
        title={p.title}
        subtitle={p.subtitle}
        actions={
          <button
            type="button"
            onClick={() => toast.message(ap.toast.saved)}
            className="rounded-xl bg-[#2C2DE0] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#2C2DE0] transition-colors"
          >
            {ap.common.save}
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SettingsSection icon={Palette} title={p.appearance}>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t.settings.darkMode}
            </span>
            <ThemeToggle showLabel />
          </div>
          <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-white/10">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t.settings.languageSection}
            </span>
            <div className="flex gap-2">
              {["en", "so"].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                    language === lang
                      ? "bg-[#2C2DE0] text-white"
                      : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                  )}
                >
                  {lang === "en" ? t.settings.langEnglish : t.settings.langSomali}
                </button>
              ))}
            </div>
          </div>
        </SettingsSection>

        <SettingsSection icon={Bell} title={p.notifications}>
          <ToggleRow label={p.emailAlerts} defaultOn />
          <ToggleRow label={p.pushAlerts} />
        </SettingsSection>

        <SettingsSection icon={Clock} title={p.libraryHours}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {p.openTime}
              </label>
              <input
                type="time"
                defaultValue="07:00"
                className="mt-2 w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {p.closeTime}
              </label>
              <input
                type="time"
                defaultValue="17:00"
                className="mt-2 w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection icon={Shield} title={p.security}>
          <ToggleRow label={p.twoFactor} />
          <div className="pt-3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {p.sessionTimeout}
            </label>
            <select className="mt-2 w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm">
              <option>{p.timeout15}</option>
              <option>{p.timeout30}</option>
              <option>{p.timeout60}</option>
            </select>
          </div>
        </SettingsSection>
      </div>
    </PageTransition>
  );
};

export default SettingsPage;
