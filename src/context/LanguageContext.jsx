import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import en from "@/locales/en";
import so from "@/locales/so";

export const LANGUAGE_STORAGE_KEY = "uniso_language";
export const LANGUAGE_PROMPT_KEY = "uniso_language_prompt_seen";

const LOCALES = { en, so };
const SUPPORTED_LANGUAGES = Object.keys(LOCALES);

const getBrowserLanguage = () => {
  if (typeof navigator === "undefined") return "en";
  const values = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
  return values.some((value) => value.toLowerCase().startsWith("so")) ? "so" : "en";
};


const getInitialLanguage = () => {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (SUPPORTED_LANGUAGES.includes(saved)) return saved;
  return getBrowserLanguage();
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);
  const [showSomaliPrompt, setShowSomaliPrompt] = useState(false);

  // FIX: Somali (so) uses Latin script and reads left-to-right, exactly
  // like English. It is NOT an RTL language (that would be Arabic/Hebrew/etc).
  // The previous code set dir="rtl" for "so", which flipped every flex
  // container in the app (logo jumping to the right, nav mirroring, etc).
  // Both supported languages are LTR, so this is hardcoded intentionally —
  // don't derive it from `language` again unless you add an actual RTL
  // language (e.g. "ar") in the future.
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
  }, [language]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const promptSeen = localStorage.getItem(LANGUAGE_PROMPT_KEY);

    if (!savedLanguage && !promptSeen && getBrowserLanguage() === "so") {
      setShowSomaliPrompt(true);
    }
  }, []);

  const setLanguage = useCallback((nextLanguage) => {
    const safeLanguage = SUPPORTED_LANGUAGES.includes(nextLanguage) ? nextLanguage : "en";
    localStorage.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
    localStorage.setItem(LANGUAGE_PROMPT_KEY, "true");
    setLanguageState(safeLanguage);
    setShowSomaliPrompt(false);
  }, []);

  const dismissSomaliPrompt = useCallback(() => {
    localStorage.setItem(LANGUAGE_PROMPT_KEY, "true");
    setShowSomaliPrompt(false);
  }, []);

  const value = useMemo(() => {
    const localeObj = LOCALES[language] || LOCALES.en;

    const getValueByPath = (obj, path) => {
      return path.split('.').reduce((current, segment) => {
        if (current && typeof current === 'object' && segment in current) {
          return current[segment];
        }
        return undefined;
      }, obj);
    };

    const t = new Proxy(function translationFunction(key) {
      if (typeof key === "string") {
        if (localeObj.common && key in localeObj.common) {
          return localeObj.common[key];
        }

        const nested = getValueByPath(localeObj, key);
        if (nested !== undefined) {
          return nested;
        }

        return key;
      }
      return key;
    }, {
      get(target, prop) {
        if (prop === Symbol.toStringTag || prop === "constructor" || prop === "prototype") {
          return target[prop];
        }
        if (prop in localeObj) {
          return localeObj[prop];
        }
        if (typeof prop === "string" && prop.includes(".")) {
          const nested = getValueByPath(localeObj, prop);
          if (nested !== undefined) {
            return nested;
          }
        }
        return undefined;
      },
    });

    return {
      t,
      language,
      setLanguage,
      lang: language,
      setLang: setLanguage,
      // FIX: was `language === "so" ? "rtl" : "ltr"`. Somali is LTR.
      dir: "ltr",
      languages: SUPPORTED_LANGUAGES,
      isSomaliPromptOpen: showSomaliPrompt,
      acceptSomaliPrompt: () => setLanguage("so"),
      dismissSomaliPrompt,
    };
  }, [dismissSomaliPrompt, language, setLanguage, showSomaliPrompt]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
      {showSomaliPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
            <div className="h-1 bg-[#2C2DE0]" />
            <div className="p-6 text-center">
              <p className="text-base font-black text-gray-900 dark:text-white">
                {so.language.browserSomaliQuestion}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage("so")}
                  className="rounded-xl bg-[#58CC02] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_#46A302] transition-all duration-150 hover:translate-y-0.5 hover:shadow-[0_2px_0_#46A302] active:translate-y-1 active:shadow-none"
                >
                  {so.language.yesSomali}
                </button>
                <button
                  type="button"
                  onClick={dismissSomaliPrompt}
                  className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  {so.language.noSomali}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return context;
};