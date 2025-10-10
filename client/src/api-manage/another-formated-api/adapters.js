// client/api-manage/another-formated-api/adapters.js

const ENV_CURRENCY = (import.meta.env.VITE_CURRENCY || "USD").toUpperCase();
const ENV_LOCALE   = (import.meta.env.VITE_PRICE_LOCALE || "en-US");

/** Fiyatı daima UI’nin beklediği "₺12,34" / "$12.34" stringine çevirir */
const asPriceStr = (v) => {
  if (v == null) return null;
  if (typeof v === "string") return v;

  const fmt = (amount, currency = ENV_CURRENCY) =>
    new Intl.NumberFormat(ENV_LOCALE, { style: "currency", currency }).format(amount);

  // cents integer ise
  if (typeof v === "number") return fmt(v / 100);

  // { cents, currency? }
  if (typeof v === "object" && typeof v.cents === "number") {
    return fmt(v.cents / 100, v.currency || ENV_CURRENCY);
  }

  // { amount, currency? } gibi varyantlar
  if (typeof v === "object" && typeof v.amount === "number") {
    return fmt(v.amount, v.currency || ENV_CURRENCY);
  }

  return String(v);
};

const pickImage = (p) =>
  p.image ||
  p.images?.[0]?.url ||
  (typeof p.images?.[0] === "string" ? p.images[0] : null) ||
  "/images/placeholder.png";

export const toShopoProduct = (p = {}) => ({
  id: String(p.id ?? p._id ?? ""),
  image: pickImage(p),
  brand: p.brand?.name ?? p.brand ?? "",
  review: Number(p.review ?? p.review_avg ?? p.rating ?? 0),
  title: p.title ?? p.name ?? "",
  offer_price: asPriceStr(p.offer_price ?? p.offer_price_str ?? p.salePrice ?? p.sale_price ?? null),
  price: asPriceStr(p.price ?? p.price_str ?? p.price_cents ?? p.priceCents ?? null),
  campaingn_product: !!(p.campaign_product ?? p.campaingn_product),
  cam_product_available: p.campaign_available ?? p.cam_product_available ?? true,
  cam_product_sale: p.campaign_sale ?? p.cam_product_sale ?? false,
  product_type: p.product_type ?? p.type ?? "simple",
});
