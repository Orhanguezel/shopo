// src/api-manage/MainApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { normalizeError } from "@/api-manage/api-error-response/normalizeError";

const DEV = import.meta.env.DEV === true;

/* ================= i18n MODE =================
 * VITE_I18N_MODE: 'off' | 'static' | 'api'
 *  - off    : i18n isteklerini ağ çağrısı yapmadan {} döndür
 *  - static : {origin}{VITE_I18N_STATIC_PREFIX}/{lang}/{ns}.json
 *  - api    : {VITE_I18N_API_BASE}/{lang}?ns={ns}  (yoksa {API_BASE_URL}/i18n)
 * ============================================ */
const I18N_MODE = (import.meta.env.VITE_I18N_MODE || "off").trim(); // <-- varsayılan: off
const I18N_STATIC_PREFIX = (import.meta.env.VITE_I18N_STATIC_PREFIX || "/locales").replace(/\/+$/,"");
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/,"");
const I18N_API_BASE =
  (import.meta.env.VITE_I18N_API_BASE || (API_BASE_URL ? `${API_BASE_URL}/i18n` : "")).replace(/\/+$/,"");

/** ----- helpers ----- */
export const toFormData = (obj = {}) => {
  if (obj instanceof FormData) return obj;
  const fd = new FormData();
  Object.entries(obj).forEach(([key, val]) => {
    if (val == null) return;
    if (key === "images") {
      const arr = Array.isArray(val) ? val : [val];
      arr.forEach((f) => f != null && fd.append("images", f));
      return;
    }
    if (typeof val === "object" && !(val instanceof File) && !(val instanceof Blob)) {
      fd.append(key, JSON.stringify(val));
    } else {
      fd.append(key, val);
    }
  });
  return fd;
};

const getLang = () => {
  try {
    if (typeof window === "undefined")
      return (import.meta.env.VITE_LOCALE || "de").trim();
    const stored = localStorage.getItem("lang");
    if (stored) return stored;
    const nav = window.navigator?.language || "";
    return (nav.split("-")[0] || (import.meta.env.VITE_LOCALE || "de")).trim();
  } catch {
    return (import.meta.env.VITE_LOCALE || "de").trim();
  }
};

const readCookie = (name) => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

const ENV_TENANT = (import.meta.env.VITE_TENANT || "default").trim();

/* ===== Base Query ===== */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL || "",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const st = getState?.();
    const lang = st?.i18n?.current || getLang();

    headers.set("X-Tenant", ENV_TENANT);
    headers.set("Accept-Language", lang);
    headers.set("X-Requested-With", "XMLHttpRequest");

    const csrf = readCookie("XSRF-TOKEN");
    if (csrf) headers.set("X-CSRF-Token", csrf);

    return headers;
  },
});

/* ===== Tools ===== */
const stripHost = (u) => String(u || "").replace(/^https?:\/\/[^/]+/i, "");
const isI18nPath = (url) => {
  const path = stripHost(url).split("?")[0] || url;
  // Destek: /i18n/tr veya /locales/tr gibi çağrılar
  return /^\/?(i18n|locales)\/[^/?#]+/i.test(path);
};
const extractI18nParts = (url, params = {}) => {
  const path = stripHost(url).split("?")[0] || url;
  // /i18n/tr  -> lang = tr
  // /locales/tr -> lang = tr
  const m = path.match(/^\/?(?:i18n|locales)\/([^/?#]+)/i);
  const lang = m?.[1] || "en";
  const ns = params.ns || params.namespace || "common";
  return { lang, ns };
};

/* ===== Robust wrapper: _lang/_lv sadece GET'e ekle ===== */
const isMeLike = (url) => {
  const path = stripHost(url).split("?")[0] || url;
  return /\/(?:users\/)?(?:account\/)?me$/i.test(path);
};

// Bazı GET isteklerine _lang/_lv eklemiyoruz (örn: brand, i18n/locales)
const shouldAttachLangParams = (url) => {
  try {
    const path = stripHost(url).split("?")[0] || url;
    if (/\/brand(?:\/|$)/i.test(path)) return false;
    if (/\/(i18n|locales)(?:\/|$)/i.test(path)) return false;
    return true;
  } catch {
    return true;
  }
};

const robustBaseQuery = async (args, api, extra) => {
  const st = api.getState?.();
  const _lang = st?.i18n?.current || getLang();
  const _lv = st?.i18n?.version || 1;

  // ---- I18N özel yol ----
  if (typeof args === "object" && args != null && isI18nPath(args.url)) {
    const { lang, ns } = extractI18nParts(args.url, args.params);

    // MODE: off  -> hiç fetch yapma, {} döndür (404 log’u da olmaz)
    if (I18N_MODE === "off") {
      if (DEV) console.log(`🌐 [i18n] mode=off → {}`, { lang, ns });
      return { data: {} };
    }

    try {
      let absolute = "";
      if (I18N_MODE === "static") {
        // /locales/{lang}/{ns}.json (prefix konfigüre edilebilir)
        absolute = `${window.location.origin}${I18N_STATIC_PREFIX}/${lang}/${ns}.json`;
      } else if (I18N_MODE === "api" && I18N_API_BASE) {
        // {API}/i18n/{lang}?ns={ns}
        absolute = `${I18N_API_BASE}/${lang}?ns=${encodeURIComponent(ns)}`;
      } else {
        // emniyet: mod tanımsızsa hiç fetch yapma
        if (DEV) console.warn("🌐 [i18n] invalid mode, returning {}");
        return { data: {} };
      }

      if (DEV) console.log(`🌐 [i18n:${I18N_MODE}] GET → ${absolute}`);

      const resp = await fetch(absolute, {
        method: "GET",
        credentials: I18N_MODE === "api" ? "include" : "omit",
        headers: { Accept: "application/json" },
      });

      if (!resp.ok) {
        if (DEV) console.warn(`🌐 [i18n] ${resp.status} — returning {}`);
        return { data: {} };
      }

      const text = await resp.text();
      try {
        const json = JSON.parse(text);
        return { data: json };
      } catch {
        if (DEV) console.warn("🌐 [i18n] Non-JSON body — returning {}");
        return { data: {} };
      }
    } catch (err) {
      if (DEV) console.warn("🌐 [i18n] fetch failed — returning {}", err);
      return { data: {} };
    }
  }

  // ---- Normal RTK flow ----
  let patched = args;

  if (typeof args === "object" && args != null) {
    const { url, params, method, ...rest } = args;
    const m = String(method || "GET").toUpperCase();

    let finalParams = params || {};
    if (m === "GET" && shouldAttachLangParams(url)) {
      finalParams = { ...(params || {}), _lang, _lv };
    }

    patched = { url, method, params: finalParams, ...rest };
  }

  if (DEV) {
    try {
      const m = typeof patched === "string" ? "GET" : (patched.method || "GET");
      const u = typeof patched === "string" ? patched : patched.url;
      console.log(`📡 [API] ${m.toUpperCase()} → ${u}`, { _lang, _lv });
    } catch {
      console.log("📡 [API] (could not parse request)");
    }
  }

  const res = await rawBaseQuery(patched, api, extra);

  if (res.error) {
    const e = normalizeError(res.error);

    try {
      const url = typeof patched === "string" ? patched : patched.url;
      if (e.status === 401 && isMeLike(url)) {
        if (DEV) console.warn(`🔐 401 on "${url}" — treating as guest (null).`);
        return { data: null };
      }
    } catch {
      // ignore
    }

    if (e.status === 401 || e.status === 403) {
      if (DEV) console.warn("🚪 Unauthorized/Forbidden", e.message);
    } else if (DEV) {
      console.error("❌ API ERROR", e);
    }
    return { error: e };
  }

  return res;
};

/* ===== RTK API ===== */
export const api = createApi({
  reducerPath: "api",
  baseQuery: robustBaseQuery,
  tagTypes: [
    "Product",
    "ProductList",
    "Category",
    "Order",
    "OrderList",
    "Inventory",
    "User",
    "IDENTITIES",
    "ADDRESSES",
    "SellerProduct",
    "SellerProductList",
  ],
  endpoints: () => ({}),
});
