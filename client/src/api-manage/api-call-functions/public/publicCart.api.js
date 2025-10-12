import { api } from "@/api-manage/MainApi";
import { Extra } from "@/api-manage/ApiRoutes";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/* ---------- helpers ---------- */
const fmt = (
  num = 0,
  currency = "EUR",
  locale = typeof navigator !== "undefined" ? navigator.language : "de-DE"
) => new Intl.NumberFormat(locale, { style: "currency", currency }).format(Number(num || 0));

const getSessionHeaders = (session) => (session ? { "x-session-id": session } : undefined);

/* ---------- product type normalize ---------- */
const ALLOWED_PRODUCT_TYPES = ["product", "ensotekprod", "sparepart", "menuitem"];

export const normalizeProductType = (t) => {          // <-- export eklendi
  const raw = String(t || "product").toLowerCase().trim();
  // yaygın eşanlamlılar / düzeltmeler
  const map = {
    simple: "product",
    normal: "product",
    default: "product",
    spare: "sparepart",
    "spare-part": "sparepart",
    "spare_part": "sparepart",
    menu: "menuitem",
    "menu-item": "menuitem",
    "menu_item": "menuitem",
  };
  const candidate = map[raw] || raw;
  return ALLOWED_PRODUCT_TYPES.includes(candidate) ? candidate : "product";
};

/* --- request payload normalizer (STRICT) --- */
/* Backend’in 422 vermemesi için yalnızca şu alanlar body’de olacak:
   { productId, productType, quantity, [variant] }  */
const nSession = (b) => b?.session || b?.sessionId;
const nProductId = (b) => b?.productId || b?.product || b?.id;
const nQty = (b) => {
  const q = b?.quantity ?? b?.qty ?? 1;
  const num = Number(q);
  return Number.isFinite(num) && num > 0 ? num : 1;
};
const withStrictBody = (body = {}) => {
  const session = nSession(body);
  const productId = nProductId(body);
  const quantity = nQty(body);
  const productType = normalizeProductType(body?.productType);
  const variant = body?.variant ?? undefined;

  const payload = {
    productId,
    productType,
    quantity,
    ...(variant ? { variant } : {}),
  };

  return { payload, session };
};

/* ---------- normalize ---------- */
const normalizeItem = (raw, currency) => {
  const it = { ...raw };

  const productId =
    it.productId || it.product?._id || it.product?.id || it.product?.$oid || it.product;
  const lineId = it.lineId || it._id?.$oid || it._id;
  const id =
    it.id ||
    lineId ||
    productId ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Math.random()));

  const quantity = it.quantity ?? it.qty ?? it.count ?? 1;

  const unitNumeric =
    (Number.isFinite(it.price_cents) ? it.price_cents / 100 : undefined) ??
    it.priceAtAddition ??
    it.price ??
    it.unitPrice ??
    it.product?.price?.current ??
    it.product?.price ??
    0;

  const lineNumeric =
    (Number.isFinite(it.line_total_cents) ? it.line_total_cents / 100 : undefined) ??
    it.lineTotal ??
    it.total ??
    unitNumeric * Number(quantity || 0);

  const image =
    it.image ||
    it.thumbnail ||
    it.product?.thumbnail ||
    it.product?.images?.[0] ||
    it.menu?.snapshot?.image ||
    null;

  const title =
    it.title || it.name || it.product?.name || it.menu?.snapshot?.name || "—";

  return {
    id,
    lineId: lineId || id,
    productId,
    productType: it.productType || "product",
    title,
    image,
    quantity: Number(quantity || 1),
    unitPrice: Number(unitNumeric || 0),
    unitPriceStr: it.price_str || fmt(unitNumeric, currency),
    lineTotal: Number(lineNumeric || 0),
    lineTotalStr: it.line_total_str || fmt(lineNumeric, currency),
    attrs: it.attrs || {},
    unitCurrency: it.unitCurrency || currency,
    raw: it,
  };
};

const shapeCart = (res) => {
  const data = pickData(res) || {};
  const currency = data.currency || data.unitCurrency || "EUR";

  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.lines)
    ? data.lines
    : [];
  const items = rawItems.map((x) => normalizeItem(x, currency));

  const subtotalNum = items.reduce((s, x) => s + Number(x.lineTotal || 0), 0);
  const discountNum = Number(data.discount) || 0;
  const shippingNum = Number(data.deliveryFee) || 0;
  const taxNum = Number(data.taxTotal) || 0;

  const totalNum =
    (Number.isFinite(Number(data.total)) && Number(data.total)) ||
    (Number.isFinite(Number(data.totalPrice)) && Number(data.totalPrice)) ||
    subtotalNum - discountNum + shippingNum + taxNum;

  const totals =
    data.totals || {
      subtotal: fmt(subtotalNum, currency),
      discount: fmt(discountNum, currency),
      shipping: fmt(shippingNum, currency),
      tax: fmt(taxNum, currency),
      total: fmt(totalNum, currency),
    };

  return {
    ...data,
    id: data.id || data._id?.$oid || data._id || "ME",
    currency,
    items,
    totals,
    _numbers: {
      subtotal: subtotalNum,
      discount: discountNum,
      shipping: shippingNum,
      tax: taxNum,
      total: totalNum,
    },
  };
};

/* ---------- RTK Query ---------- */
export const publicCartApi = api
  .enhanceEndpoints({ addTagTypes: ["Cart", "Order"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // GET /api/cart
      getMyCart: build.query({
        query: (arg = {}) => {
          const { session, sessionId } = arg || {};
          const sid = session || sessionId;
          return {
            url: Extra.public.cart.list(),
            params: sid ? { session: sid } : undefined,
            headers: getSessionHeaders(sid),
          };
        },
        transformResponse: shapeCart,
        providesTags: (result) => {
          const id = result?.id || "ME";
          return [{ type: "Cart", id }, { type: "Cart", id: "ME" }];
        },
      }),

      // POST /api/cart/add
      addCartItem: build.mutation({
        // arg: { productId, productType, quantity, variant?, session? }
        query: (arg) => {
          const { payload, session } = withStrictBody(arg);
          return {
            url: Extra.public.cart.add(),
            method: "POST",
            body: payload,
            headers: getSessionHeaders(session),
          };
        },
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),

      // PATCH /api/cart/increase
      increaseQuantity: build.mutation({
        // arg: { productId, productType?, quantity?, variant?, session? }
        query: (arg) => {
          const { payload, session } = withStrictBody(arg);
          return {
            url: Extra.public.cart.increase(),
            method: "PATCH",
            body: payload,
            headers: getSessionHeaders(session),
          };
        },
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),

      // PATCH /api/cart/decrease
      decreaseQuantity: build.mutation({
        query: (arg) => {
          const { payload, session } = withStrictBody(arg);
          return {
            url: Extra.public.cart.decrease(),
            method: "PATCH",
            body: payload,
            headers: getSessionHeaders(session),
          };
        },
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),

      // PATCH /api/cart/remove  **veya**  DELETE /api/cart/items/:lineId (arg.lineId varsa)
      removeFromCart: build.mutation({
        // arg: { productId, productType?, variant?, session? }  | { lineId, session? }
        query: (arg = {}) => {
          const lineId = arg?.lineId || arg?._id || arg?.line_id;
          const sid = nSession(arg);

          // lineId verilmişse doğrudan satırı sil (özellikle menuitem için)
          if (lineId) {
            return {
              url: Extra.public.cart.items.byId(lineId),
              method: "DELETE",
              headers: getSessionHeaders(sid),
            };
          }

          // ürün bazlı silme
          const { payload, session } = withStrictBody(arg);
          const { productId, productType, variant } = payload;

          const body = {
            productId,
            productType, // <<<<< ÖNEMLİ: artık gönderiyoruz
            ...(variant ? { variant } : {}),
          };

          return {
            url: Extra.public.cart.remove(),
            method: "PATCH",
            body,
            headers: getSessionHeaders(session),
          };
        },
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),

      // DELETE /api/cart/clear
      clearCart: build.mutation({
        query: (body = {}) => {
          const sid = nSession(body);
          return {
            url: Extra.public.cart.clear(),
            method: "DELETE",
            body: {}, // çoğu backend body istemiyor
            headers: getSessionHeaders(sid),
          };
        },
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),

      // POST /api/cart/items (menü/özel satır)
      addMenuLine: build.mutation({
        query: (body) => {
          const sid = nSession(body);
          return {
            url: Extra.public.cart.items.create(),
            method: "POST",
            body,
            headers: getSessionHeaders(sid),
          };
        },
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),

      // PATCH /api/cart/items/:lineId
      updateMenuLine: build.mutation({
        query: ({ lineId, data, session, sessionId }) => {
          const sid = session || sessionId;
          return {
            url: Extra.public.cart.items.byId(lineId),
            method: "PATCH",
            body: data,
            headers: getSessionHeaders(sid),
          };
        },
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),

      // DELETE /api/cart/items/:lineId
      removeMenuLine: build.mutation({
        query: ({ lineId, session, sessionId }) => {
          const sid = session || sessionId;
          return {
            url: Extra.public.cart.items.byId(lineId),
            method: "DELETE",
            headers: getSessionHeaders(sid),
          };
        },
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),

      // PATCH /api/cart/pricing
      updatePricing: build.mutation({
        query: (body) => {
          const sid = nSession(body);
          return {
            url: Extra.public.cart.pricing(),
            method: "PATCH",
            body,
            headers: getSessionHeaders(sid),
          };
        },
        invalidatesTags: [{ type: "Cart", id: "ME" }],
      }),

      // POST /api/cart/checkout
      checkoutCart: build.mutation({
        query: ({ data, idempotencyKey, session, sessionId }) => {
          const sid = session || sessionId;
          return {
            url: Extra.public.cart.checkout(),
            method: "POST",
            body: data,
            headers: {
              ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
              ...getSessionHeaders(sid),
            },
          };
        },
        transformResponse: pickData,
        invalidatesTags: [
          { type: "Cart", id: "ME" },
          { type: "Order", id: "LIST" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useGetMyCartQuery,
  useAddCartItemMutation,
  useIncreaseQuantityMutation,
  useDecreaseQuantityMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useAddMenuLineMutation,
  useUpdateMenuLineMutation,
  useRemoveMenuLineMutation,
  useUpdatePricingMutation,
  useCheckoutCartMutation,
} = publicCartApi;
