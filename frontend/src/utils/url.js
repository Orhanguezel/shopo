export function buildProductPath(slug) {
  if (!slug) {
    return "/products";
  }

  return `/urun/${encodeURIComponent(slug)}`;
}

export function buildProductUrl(baseUrl, slug) {
  const normalizedBaseUrl = String(baseUrl || "").replace(/\/$/, "");
  return `${normalizedBaseUrl}${buildProductPath(slug)}`;
}
