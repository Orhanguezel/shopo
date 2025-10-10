// client/api-manage/api-call-functions/admin/stockledger.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – Stockledger
 *  - CREATE : POST /stockledger                      { product, type, quantity, note(i18n) }
 *  - LIST   : GET  /stockledger                      ?product=&type=&from=&to=&limit=&sort=
 *  - LEGACY : GET  /stock-ledger                     (legacyPath:true)
 *  - INV    : GET  /inventory/:product               → { onHand, reserved, available }
 *
 * Not: REGISTRY.admin.stockledger genellikle legacy ('stock-ledger') için kullanılır.
 */
export const adminStockledgerApi = api
  .enhanceEndpoints({ addTagTypes: ["StockMovement", "StockMovementList", "Inventory"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* CREATE MOVEMENT (new path) */
      createStockMovement: build.mutation({
        query: (body) => ({
          url: "/stockledger",
          method: "POST",
          body,
        }),
        invalidatesTags: (_res, _err, body) => ([
          { type: "StockMovementList", id: "ADMIN" },
          body?.product ? { type: "Inventory", id: body.product } : null,
        ].filter(Boolean)),
      }),

      /* LIST MOVEMENTS (supports legacyPath) */
      listStockMovements: build.query({
        // args: { product?, type?, from?, to?, limit?, sort?, legacyPath? }
        query: (args = {}) => {
          const { legacyPath, ...params } = args || {};
          // legacy → R.admin.stockledger.list()  ("/stock-ledger")
          // new    → "/stockledger"
          return legacyPath
            ? { url: R.admin.stockledger.list(), params }
            : { url: "/stockledger", params };
        },
        transformResponse: (res) => {
          const items = res?.data ?? res ?? [];
          const total =
            res?.meta?.total ??
            res?.total ??
            (Array.isArray(items) ? items.length : 0);
          return { items, total, meta: res?.meta };
        },
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((m) => ({
                type: "StockMovement",
                id: m?._id || m?.id,
              })),
              { type: "StockMovementList", id: "ADMIN" },
            ]
            : [{ type: "StockMovementList", id: "ADMIN" }],
      }),

      /* INVENTORY SNAPSHOT (public/non-admin path) */
      getInventoryForProduct: build.query({
        query: (productId) => ({ url: `/inventory/${productId}` }),
        transformResponse: pickData,
        providesTags: (_res, _e, productId) => [{ type: "Inventory", id: productId }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useCreateStockMovementMutation,
  useListStockMovementsQuery,
  useGetInventoryForProductQuery,
} = adminStockledgerApi;
