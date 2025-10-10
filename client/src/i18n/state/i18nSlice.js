// src/i18n/state/i18nSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialLang = (() => {
  try {
    const fromLS = localStorage.getItem("lang");
    return (fromLS || import.meta.env.VITE_LOCALE || "en").trim();
  } catch {
    return (import.meta.env.VITE_LOCALE || "en").trim();
  }
})();

const i18nSlice = createSlice({
  name: "i18n",
  initialState: {
    current: initialLang,
    default: (import.meta.env.VITE_LOCALE || "en").trim(),
    available: (import.meta.env.VITE_LANGS || "en,de,tr").split(","),
    version: 1,
  },
  reducers: {
    setLanguage(state, { payload }) {
      const lang = String(payload || state.default).trim();
      state.current = lang;
      state.version += 1;
      try {
        localStorage.setItem("lang", lang);
        if (typeof document !== "undefined") {
          document.documentElement.lang = lang;
        }
      } catch {
        toast.error("Cannot access localStorage. Your language preference cannot be saved.");
      }
    },
  },
});

export const { setLanguage } = i18nSlice.actions;
export default i18nSlice.reducer;
