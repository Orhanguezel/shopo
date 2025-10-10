// client/api-manage/another-formated-api/shapeList.js
export const shapeList = (res) => {
  const items =
    res?.data?.items ??
    res?.data?.products ??
    res?.items ??
    res?.products ??
    res?.data ??
    (Array.isArray(res) ? res : []) ??
    [];

  const total =
    res?.meta?.total ??
    res?.total ??
    res?.data?.total ??
    (Array.isArray(items) ? items.length : 0);

  const page = Number(res?.meta?.page ?? res?.page ?? 1);

  // ❌  res?.meta?.pageSize ?? ... ?? (items.length || 24)
  // ✅  nullish coalescing ile tutarlı: items.length yerine inferredLen ?? 24
  const inferredLen = Array.isArray(items) ? items.length : undefined;
  const pageSize = Number(
    res?.meta?.pageSize ??
      res?.limit ??
      res?.pageSize ??
      inferredLen ??
      24
  );

  // '|| 1' karışımı yerine güvenli bölen hesapla
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 1;

  const totalPages = Number(
    res?.meta?.totalPages ??
      res?.totalPages ??
      Math.ceil(total / safePageSize)
  );

  return { items, total, meta: { page, pageSize, totalPages, ...(res?.meta || {}) } };
};

export const pickData = (res) => res?.data ?? res;
