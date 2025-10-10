// src/api-manage/sellerProductsApi.js
import { api } from "@/api-manage/MainApi";

/* ------------- helpers ------------- */
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

/** Objeyi güvenli şekilde FormData'ya çevirir. File/File[] alanları 'images' vb. isimle gönderilebilir. */
function toFormData(payload) {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();

  const append = (key, val) => {
    if (val == null) return;

    // File / Blob
    if (typeof Blob !== "undefined" && (val instanceof Blob)) {
      fd.append(key, val);
      return;
    }

    // Array (ör. images veya dizi alanlar)
    if (Array.isArray(val)) {
      if (val.length && typeof Blob !== "undefined" && (val[0] instanceof Blob)) {
        val.forEach((f) => fd.append(key, f));
      } else {
        fd.append(key, JSON.stringify(val));
      }
      return;
    }

    // Object (i18n vb.)
    if (typeof val === "object") {
      fd.append(key, JSON.stringify(val));
      return;
    }

    // Primitive
    fd.append(key, String(val));
  };

  Object.entries(payload || {}).forEach(([k, v]) => append(k, v));
  return fd;
}

/** Seller API base — swagger’a göre: /api/product/seller */
const baseSeller = "/product/seller";

export const sellerProductsApi = api.injectEndpoints({
  endpoints: (build) => ({
    /* LIST — sadece kendi ürünleri */
    listMyProducts: build.query({
      query: (params = {}) => {
        const { asSellerId, ...qp } = params;
        const headers = asSellerId ? { "x-as-seller-id": asSellerId } : undefined;
        return { url: `${baseSeller}/`, params: qp, headers };
      },
      transformResponse: (res) => {
        // { success, data:[], meta:{} } formatı
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const meta = res?.meta || {};
        const items = data.map((x) => carryPrices(x));
        return { items, total: meta?.total ?? items.length, meta };
      },
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((p) => ({ type: "SellerProduct", id: p?.id || p?._id })),
              { type: "SellerProductList", id: "MY" },
            ]
          : [{ type: "SellerProductList", id: "MY" }],
    }),

    /* DETAIL — sadece kendi ürünü */
    getMyProductById: build.query({
      query: ({ id, asSellerId } = {}) => {
        const headers = asSellerId ? { "x-as-seller-id": asSellerId } : undefined;
        return { url: `${baseSeller}/${id}`, headers };
      },
      transformResponse: (res) => carryPrices(res?.data ?? res),
      providesTags: (_r, _e, arg) => [{ type: "SellerProduct", id: arg?.id }],
    }),

    /* CREATE — multipart/form-data */
    createMyProduct: build.mutation({
      query: (body = {}) => {
        const { asSellerId, ...rest } = body;
        const form = toFormData(rest);
        const headers = {};
        if (asSellerId) headers["x-as-seller-id"] = asSellerId;
        return { url: `${baseSeller}/`, method: "POST", body: form, headers };
      },
      transformResponse: (res) => carryPrices(res?.data ?? res),
      invalidatesTags: () => [{ type: "SellerProductList", id: "MY" }],
    }),

    /* UPDATE — multipart/form-data */
    updateMyProduct: build.mutation({
      query: ({ id, asSellerId, ...rest } = {}) => {
        const form = toFormData(rest);
        const headers = {};
        if (asSellerId) headers["x-as-seller-id"] = asSellerId;
        return { url: `${baseSeller}/${id}`, method: "PUT", body: form, headers };
      },
      transformResponse: (res) => carryPrices(res?.data ?? res),
      invalidatesTags: (_r, _e, arg) => [
        { type: "SellerProduct", id: arg?.id },
        { type: "SellerProductList", id: "MY" },
      ],
    }),

    /* DELETE — kendi ürünü */
    deleteMyProduct: build.mutation({
      query: ({ id, asSellerId } = {}) => {
        const headers = asSellerId ? { "x-as-seller-id": asSellerId } : undefined;
        return { url: `${baseSeller}/${id}`, method: "DELETE", headers };
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "SellerProduct", id: arg?.id },
        { type: "SellerProductList", id: "MY" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useListMyProductsQuery,
  useGetMyProductByIdQuery,
  useCreateMyProductMutation,
  useUpdateMyProductMutation,
  useDeleteMyProductMutation,
} = sellerProductsApi;
