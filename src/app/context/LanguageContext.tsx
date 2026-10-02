"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { dictionaries, type Language, type TranslationKey } from "@/lib/i18n/dictionary";

const STORAGE_KEY = "xerin_lang";
const COOKIE_KEY = "xerin_lang";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => dictionaries.en[key] ?? key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const stored =
      (typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEY) as Language)) ||
      readCookie(COOKIE_KEY);
    if (stored === "en" || stored === "sw") {
      setLangState(stored);
      document.documentElement.lang = stored === "sw" ? "sw" : "en";
    }
  }, []);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `${COOKIE_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = next === "sw" ? "sw" : "en";
    } catch {}
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let text = dictionaries[lang][key] ?? dictionaries.en[key] ?? String(key);
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
