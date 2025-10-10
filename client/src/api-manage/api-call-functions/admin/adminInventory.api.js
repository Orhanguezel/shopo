// client/api-manage/api-call-functions/admin/inventory.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

const pickData = (res) => res?.data ?? res;

/**
 * ADMIN – Inventory
 *  - GET    /inventory/admin                     ?page=&limit=&low=&q=
 *  - GET    /inventory/admin/:productId
 *  - PATCH  /inventory/admin/:productId/safety   { safetyStock }
 *  - POST   /inventory/admin/rebuild             {}            → Tüm ürünler
 *  - POST   /inventory/admin/rebuild             { productId } → Tek ürün
 */
export const adminInventoryApi = api
  .enhanceEndpoints({ addTagTypes: ["Inventory", "InventoryList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST (paged + filters) */
      listAdminInventories: build.query({
        query: (params = {}) => ({
          url: R.admin.inventory.list(),
          params,
        }),
        transformResponse: (res) => {
          const { items, total, meta } = shapeList(res);
          return { items, total, meta };
        },
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((it) => ({
                type: "Inventory",
                id: it?.product || it?._id || it?.id,
              })),
              { type: "InventoryList", id: "ADMIN" },
            ]
            : [{ type: "InventoryList", id: "ADMIN" }],
      }),

      /* GET BY PRODUCT */
      getAdminInventoryByProduct: build.query({
        query: (productId) => ({ url: R.admin.inventory.get(productId) }),
        transformResponse: pickData,
        providesTags: (_r, _e, productId) => [{ type: "Inventory", id: productId }],
      }),

      /* UPDATE SAFETY STOCK */
      updateSafetyStock: build.mutation({
        query: ({ productId, safetyStock }) => ({
          url: R.admin.inventory.$.custom(`${productId}/safety`),
          method: "PATCH",
          body: { safetyStock },
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, { productId }) => [
          { type: "Inventory", id: productId },
          { type: "InventoryList", id: "ADMIN" },
        ],
      }),

      /* REBUILD ALL */
      rebuildAllInventories: build.mutation({
        query: () => ({
          url: R.admin.inventory.$.custom("rebuild"),
          method: "POST",
          body: {},
        }),
        transformResponse: (res) => res ?? { success: true },
        invalidatesTags: [{ type: "InventoryList", id: "ADMIN" }],
      }),

      /* REBUILD SINGLE */
      rebuildInventoryForProduct: build.mutation({
        query: (productId) => ({
          url: R.admin.inventory.$.custom("rebuild"),
          method: "POST",
          body: { productId },
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, productId) => [
          { type: "Inventory", id: productId },
          { type: "InventoryList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminInventoriesQuery,
  useGetAdminInventoryByProductQuery,
  useUpdateSafetyStockMutation,
  useRebuildAllInventoriesMutation,
  useRebuildInventoryForProductMutation,
} = adminInventoryApi;
