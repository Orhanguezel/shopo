// src/i18n/I18nProvider.jsx
import { createContext, useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetTranslationsQuery } from "@/api-manage/api-call-functions/i18n";

const I18nCtx = createContext({ t: (k) => k, lang: "en", dict: {} });

export const I18nProvider = ({ ns = "common", children }) => {
  const lang = useSelector((s) => s.i18n?.current || "en");
  const { data: dict = {} } = useGetTranslationsQuery({ lang, ns });

  const value = useMemo(() => ({
    lang,
    dict,
    t: (key, vars = {}) => {
      const raw = (dict && dict[key]) != null ? dict[key] : key;
      return String(raw).replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ""));
    },
  }), [lang, dict]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
};

export const useT = () => useContext(I18nCtx);
