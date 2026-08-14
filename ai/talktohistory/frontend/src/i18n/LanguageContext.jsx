import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translate } from "./translations";
import { normalizeChatLanguage, resolveAppLanguage, persistChatLanguage } from "../data/chatLanguage";
import { getUserProfile, setUserProfile } from "../data/userProfile";
import { getActiveUserId } from "../data/accounts";

export function readAppLanguage() {
  return resolveAppLanguage(getUserProfile());
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readAppLanguage);

  useEffect(() => {
    const sync = () => setLang(readAppLanguage());
    window.addEventListener("yallo:language-change", sync);
    return () => window.removeEventListener("yallo:language-change", sync);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "es" ? "es" : lang === "fr" ? "fr" : "en";
    persistChatLanguage(lang);
  }, [lang]);

  const setLanguage = useCallback((code) => {
    const next = normalizeChatLanguage(code);
    persistChatLanguage(next);
    if (getActiveUserId()) {
      setUserProfile({ chatLanguage: next });
    }
    setLang(next);
    window.dispatchEvent(new CustomEvent("yallo:language-change", { detail: next }));
  }, []);

  const t = useCallback((key, vars = {}) => translate(lang, key, vars), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n requires LanguageProvider");
  return ctx;
}
