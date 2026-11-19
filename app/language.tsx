"use client";

import "@ui5/webcomponents-base/dist/generated/json-imports/i18n.js";
import "@ui5/webcomponents/dist/generated/json-imports/i18n.js";
import "@ui5/webcomponents-fiori/dist/generated/json-imports/i18n.js";
import "@ui5/webcomponents-localization/dist/Assets.js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { setLanguage as setUi5Language } from "@ui5/webcomponents-base/dist/config/Language.js";
import { LANGUAGE_COOKIE, type Language } from "../lib/i18n/language";
import { translate } from "../lib/i18n/messages";
import { formatDate, formatDateTime } from "../lib/register/workflow";

const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void }>({
  language: "de",
  setLanguage: () => {},
});

export function LanguageProvider({ initial, children }: { initial: Language; children: ReactNode }) {
  const [language, updateLanguage] = useState(initial);

  useEffect(() => {
    document.documentElement.lang = language;
    void setUi5Language(language);
  }, [language]);

  function setLanguage(value: Language) {
    document.cookie = `${LANGUAGE_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
    updateLanguage(value);
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const { language, setLanguage } = useContext(LanguageContext);
  return {
    language,
    setLanguage,
    t: (message: string, ...args: (string | number | undefined)[]) => translate(language, message, ...args),
    date: (iso: string) => formatDate(iso, language),
    dateTime: (iso: string) => formatDateTime(iso, language),
  };
}
