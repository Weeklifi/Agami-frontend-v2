import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../lib/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("agami_lang") || "en");

  useEffect(() => {
    localStorage.setItem("agami_lang", lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "en" ? "bn" : "en"));

  const t = (key, vars) => {
    const entry = translations[key];
    let text = entry ? (entry[lang] ?? entry.en) : key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
