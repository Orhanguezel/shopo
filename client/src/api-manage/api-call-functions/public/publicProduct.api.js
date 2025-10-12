// src/api-manage/api-call-functions/public/publicProduct.api.js

import { api } from "@/api-manage/MainApi";
import { R, Extra } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";
import { toShopoProduct } from "@/api-manage/another-formated-api/adapters";

/** Backend public list’i shopo döndürmüyorsa TRUE kalsın */
const useShopoNormalizer = true;

/* ---- helpers ---- */
const toNum = (v) => {
  if (v == null) return undefined;
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v === "string") {
    const parsed = Number(v.replace(/[^\d.,-]/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  if (typeof v === "object") {
    return (
      toNum(v.current) ??
      toNum(v.raw) ??
      toNum(v.value) ??
      toNum(v.amount) ??
      toNum(v.gross) ??
      toNum(v.net)
    );
  }
  return undefined;
};

const carryPrices = (obj) => {
  const p = { ...obj };
  const base =
    (typeof p.price === "number" ? p.price : undefined) ??
    toNum(p.price) ??
    toNum(p.main_price);

  const sale =
    (typeof p.salePrice === "number" ? p.salePrice : undefined) ??
    toNum(p.salePrice) ??
    toNum(p.sale_price) ??
    toNum(p.offer_price) ??
    toNum(p.offerPrice);

  const disc =
    (typeof p.discountPercent === "number" ? p.discountPercent : undefined) ??
    toNum(p.discountPercent) ??
    toNum(p.discount_pct) ??
    toNum(p.discount);

  if (Number.isFinite(base)) p.price = base;
  if (Number.isFinite(sale)) p.salePrice = sale;
  if (Number.isFinite(disc)) p.discountPercent = Number(disc);

  if (Number.isFinite(p.salePrice) && Number.isFinite(p.price) && p.salePrice >= p.price) {
    delete p.salePrice;
    delete p.discountPercent;
  }
  return p;
};

const normalizeList = (items) => {
  const mapped = useShopoNormalizer ? items.map(toShopoProduct) : items;
  return mapped.map((m, i) => carryPrices({ ...m, ...items[i] }));
};

/** Sadece SLUG endpoint adayları */
const slugUrlCandidates = (slug) => {
  const c = [];
  if (Extra?.public?.products?.bySlug) c.push(Extra.public.products.bySlug(slug));
  c.push(`/api/product/slug/${encodeURIComponent(slug)}`); // doğrudan slug rotası
  return c;
};

export const publicProductsApi = api.injectEndpoints({
  endpoints: (build) => ({
    /* LIST (PUBLIC) */
    getPublicProducts: build.query({
      query: (params = {}) => {
        const { page = 1, pageSize, limit = pageSize ?? 24, view, ...rest } = params;
        const qp = { page, limit, ...rest };
        if (view === "shopo") qp.view = "shopo";
        return { url: R.public.products.list(), params: qp };
      },
      transformResponse: (res) => {
        const { items, total, meta } = shapeList(res);
        return { items: normalizeList(items), total, meta };
      },
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((p) => ({ type: "Product", id: p?.id || p?._id })),
              { type: "ProductList", id: "PUBLIC" },
            ]
          : [{ type: "ProductList", id: "PUBLIC" }],
    }),

    /* GET BY SLUG — ID fallback KALDIRILDI */
    getProductBySlug: build.query({
      async queryFn(arg, _api, _extra, baseQuery) {
        const slug = typeof arg === "string" ? arg : arg?.slug;
        if (!slug) return { error: { status: 400, data: "Missing slug" } };

        let lastErr = null;
        for (const url of slugUrlCandidates(slug)) {
          const res = await baseQuery({ url });
          if (!res.error) {
            const data = res.data?.data ?? res.data;
            const base = useShopoNormalizer ? toShopoProduct(data) : data;
            return { data: carryPrices({ ...base, ...data }) };
          }
          lastErr = res.error;
        }
        return { error: lastErr || { status: 404, data: "Not found" } };
      },
      providesTags: (result) =>
        result?.id || result?._id ? [{ type: "Product", id: result.id || result._id }] : [],
    }),

    /* GET BY ID (ayrı, gerekirse elde kullan) */
    getProductById: build.query({
      query: (id) => ({ url: R.public.products.get(id) }),
      transformResponse: (res) => {
        const data = res?.data ?? res;
        const base = useShopoNormalizer ? toShopoProduct(data) : data;
        return carryPrices({ ...base, ...data });
      },
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    /* RELATED — sadece SLUG odaklı */
    getRelatedProducts: build.query({
      async queryFn(arg, _api, _extra, baseQuery) {
        const slug = typeof arg === "string" ? arg : arg?.slug;
        if (!slug) return { data: [] };

        if (Extra?.public?.products?.relatedBySlug) {
          const r1 = await baseQuery({ url: Extra.public.products.relatedBySlug(slug) });
          if (!r1.error) {
            const { items } = shapeList(r1.data);
            return { data: normalizeList(items) };
          }
        }

        // Fallback: list endpoint + muhtemel paramlar
        const candidates = [
          { params: { relatedTo: slug } },
          { params: { like: slug } },
          { params: { q: slug, view: "shopo" } },
        ];
        for (const c of candidates) {
          const r = await baseQuery({ url: R.public.products.list(), params: c.params });
          if (!r.error) {
            const { items } = shapeList(r.data);
            return { data: normalizeList(items) };
          }
        }
        return { data: [] };
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? result.map((p) => ({ type: "Product", id: p?.id || p?._id }))
          : [],
    }),

    /* SELLER PRODUCTS — (sellerId kalsın) */
    getSellerProducts: build.query({
      async queryFn(arg, _api, _extra, baseQuery) {
        const sellerId = arg?.sellerId;
        if (!sellerId) return { data: [] };

        if (Extra?.public?.products?.bySeller) {
          const r = await baseQuery({ url: Extra.public.products.bySeller(sellerId) });
          if (!r.error) {
            const { items } = shapeList(r.data);
            return { data: normalizeList(items) };
          }
        }

        const paramsList = [{ sellerId }, { seller: sellerId }, { seller_id: sellerId }];
        for (const params of paramsList) {
          const r = await baseQuery({ url: R.public.products.list(), params });
          if (!r.error) {
            const { items } = shapeList(r.data);
            return { data: normalizeList(items) };
          }
        }
        return { data: [] };
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? result.map((p) => ({ type: "Product", id: p?.id || p?._id }))
          : [],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPublicProductsQuery,
  useGetProductBySlugQuery,
  useGetProductByIdQuery,
  useGetRelatedProductsQuery,
  useGetSellerProductsQuery,
} = publicProductsApi;
