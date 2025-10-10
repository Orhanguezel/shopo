// src/hooks/useThemeMode.js
import { useState, useEffect } from "react";

export function useThemeMode() {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme_mode");
    if (stored === "dark" || stored === "light") {
      setMode(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  const toggle = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("theme_mode", newMode);
  };

  return [mode, toggle];
}
