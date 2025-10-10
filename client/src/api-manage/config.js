// src/api-manage/config.js
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/,""); // "" veya "http://.../api"
const API_PREFIX  = (import.meta.env.VITE_API_PREFIX || "api").replace(/^\/+|\/+$/g,"");
const API_VERSION = (import.meta.env.VITE_API_VERSION || "").replace(/^\/+|\/+$/g,"");
const hasApiSuffix = API_BASE.endsWith("/api");

export const join = (...parts) =>
  parts.flat().filter(Boolean).map(p => String(p).replace(/^\/+|\/+$/g,"")).join("/").replace(/\/{2,}/g,"/");

const prefixWithVersion = API_VERSION ? join(API_PREFIX, API_VERSION) : API_PREFIX;

export const apiUrl = (path = "") => {
  const clean = String(path).trim();
  if (!API_BASE) return `/${join(prefixWithVersion, clean)}`;           // Proxy: "/api[/v1]/xxx"
  if (hasApiSuffix) return `${API_BASE}/${join(API_VERSION, clean)}`;   // Base .../api ise: "..../api[/v1]/xxx"
  return `${API_BASE}/${join(prefixWithVersion, clean)}`;               // Base .../backend ise: ".../backend/api[/v1]/xxx"
};
