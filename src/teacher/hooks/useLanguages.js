// teacher/hooks/useTeacherLanguage.js
// Mirrors your existing useLanguage hook pattern but scoped to teacher translations.
// Swap useLanguage for your real hook if it already provides lang.
import useLanguage from "@/hooks/useLanguage";
import { teacherEn } from "../config/en";
import { teacherSo } from "../config/so";

export const useTeacherLanguage = () => {
  // useLanguage already exposes { lang } — "en" | "so"
  const { lang } = useLanguage();
  const t = lang === "so" ? teacherSo : teacherEn;
  return { t, lang };
};