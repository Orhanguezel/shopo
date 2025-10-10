/* ---------- ID helpers ---------- */
export const isObjectId = (v) => typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v);

export const normId = (v) => {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (typeof v.$oid === "string") return v.$oid;
    if (typeof v.toString === "function") {
      const s = v.toString();
      if (s && s !== "[object Object]") return s;
    }
  }
  return undefined;
};

export const getProductId = (d) =>
  normId(d?.id ?? d?._id ?? d?.productId ?? d?.product?._id ?? d?.product?.id);

export const pickVariantId = (d) =>
  normId(
    d?.variantId ||
      d?.variant?._id ||
      d?.variant?.id ||
      d?.defaultVariantId ||
      d?.defaultVariant?._id ||
      d?.defaultVariant?.id ||
      d?.variants?.[0]?._id ||
      d?.variants?.[0]?.id
  );

/** Sadece slug döndürür; ID'ye ASLA düşmez */
export const getProductSlug = (d) => {
  const s1 = typeof d?.slugCanonical === "string" && d.slugCanonical !== "[object Object]" ? d.slugCanonical : "";
  const s2 = typeof d?.slug === "string" && d.slug !== "[object Object]" ? d.slug : "";
  return s1 || s2 || "";
};

/* ---------- UI helpers ---------- */
export const pickTitle = (p) => {
  const t = p?.title || p?.name || p?.title_i18n || p?.productTitle;
  if (!t) return "—";
  if (typeof t === "string") return t;
  try {
    const lang = (typeof navigator !== "undefined" ? navigator.language : "en").slice(0, 2);
    return t[lang] || t.en || t.tr || Object.values(t).find(Boolean) || "—";
  } catch {
    return "—";
  }
};

export const pickImageUrl = (p) => {
  if (typeof p?.image === "string") return p.image;
  if (p?.image && typeof p.image === "object") return p.image.thumbnail || p.image.url || p.image.webp;
  if (typeof p?.thumbnail === "string") return p.thumbnail;

  const imgs = Array.isArray(p?.images) ? p.images : [];
  if (imgs.length > 0) {
    const f = imgs[0];
    if (typeof f === "string") return f;
    if (f && typeof f === "object") return f.thumbnail || f.url || f.webp;
  }

  const gal = Array.isArray(p?.gallery) ? p.gallery : [];
  if (gal.length > 0) {
    const g0 = gal[0];
    if (typeof g0 === "string") return g0;
    if (g0 && typeof g0 === "object") return g0.thumbnail || g0.url || g0.webp;
  }

  return `${import.meta.env.VITE_PUBLIC_URL}/assets/images/product-img-1.jpg`;
};

/* ---------- Price helpers ---------- */
export const toNum = (v) => {
  if (v == null) return undefined;
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v === "string") {
    const parsed = Number(String(v).replace(/[^\d.,-]/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  if (typeof v === "object") {
    if (typeof v.current === "number") return v.current;
    if (typeof v.current === "string") return toNum(v.current);
    if (typeof v.current?.value === "number") return v.current.value;
    if (typeof v.value === "number") return v.value;
    if (typeof v.amount === "number") return v.amount;
    if (typeof v.gross === "number") return v.gross;
    if (typeof v.net === "number") return v.net;
  }
  return undefined;
};

/** base (price) + offer (sale/discount) */
export const pickPrices = (p) => {
  const base = toNum(p?.price) ?? toNum(p?.price?.current) ?? toNum(p?.price?.raw);
  let sale = toNum(p?.salePrice);
  const discountPct = toNum(p?.discountPercent);

  if ((sale == null || !Number.isFinite(sale)) && Number.isFinite(base) && Number.isFinite(discountPct)) {
    const pct = Math.max(0, Math.min(100, discountPct));
    sale = +(base * (1 - pct / 100)).toFixed(2);
  }

  const offer = sale != null && sale < base ? sale : base ?? 0;
  const main = sale != null && base != null && base > offer ? base : "";

  return { main, offer };
};

export const fmtMoney = (n) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- Session ---------- */
export const getSessionId = () => {
  try {
    let s = localStorage.getItem("cart_session");
    if (!s) {
      s = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("cart_session", s);
    }
    return s;
  } catch {
    return undefined;
  }
};

/* ---------- Product type canonicalization ---------- */
export const ALLOWED_PRODUCT_TYPES = ["product", "ensotekprod", "sparepart", "menuitem"];

export const canonicalizeProductType = (raw, obj) => {
  const v = String(raw || "").trim().toLowerCase();
  if (ALLOWED_PRODUCT_TYPES.includes(v)) return v;

  const map = {
    simple: "product",
    variable: "product",
    configurable: "product",
    grouped: "product",
    bundle: "product",
    external: "product",
    downloadable: "product",
    virtual: "product",
    physical: "product",
    standard: "product",
    default: "product",
    menu: "menuitem",
    "menu-item": "menuitem",
    menu_item: "menuitem",
    food: "menuitem",
    meal: "menuitem",
    dish: "menuitem",
    spare: "sparepart",
    "spare-part": "sparepart",
    part: "sparepart",
    replacement: "sparepart",
    ensotek: "ensotekprod",
    "ensotek-prod": "ensotekprod",
  };
  if (map[v]) return map[v];

  const o = obj || {};
  const looksMenu = !!o.menu || !!o.menuSelections || !!o.modifiers || !!o.variantCode || !!o.menuItemCode;
  if (looksMenu) return "menuitem";

  const looksSpare =
    o.isSparePart === true ||
    /spare|part|replacement/i.test(String(o?.category || "")) ||
    /spare|part|replacement/i.test(String(o?.productType || o?.product_type || ""));
  if (looksSpare) return "sparepart";

  return "product";
};

export const pickProductType = (d, fallback = "product") =>
  canonicalizeProductType(d?.productType || d?.product_type || fallback, d);

const helpers = {
  isObjectId,
  normId,
  getProductId,
  pickVariantId,
  getProductSlug,
  pickTitle,
  pickImageUrl,
  toNum,
  pickPrices,
  fmtMoney,
  getSessionId,
  pickProductType,
  canonicalizeProductType,
  ALLOWED_PRODUCT_TYPES,
};
export default helpers;
