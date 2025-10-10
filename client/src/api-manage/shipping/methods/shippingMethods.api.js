// src/features/shipping/methods/shippingMethods.api.js
import { api, shapeList, pickData } from "@/lib/api/baseApi";

/**
 * Paths (backend’ine göre düzenle):
 * - Admin methods:  /shipping/admin/methods
 * - Public methods: /shipping/public/methods
 */
export const shippingMethodsApi = api
  .enhanceEndpoints({ addTagTypes: ["ShippingMethod"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* ADMIN — LIST */
      listShippingMethods: build.query({
        // params: { active?, q?, limit?, sort? ... }
        query: (params = {}) => ({
          url: "/shipping/admin/methods",
          params,
        }),
        transformResponse: shapeList,
        providesTags: (res) =>
          res?.items?.length
            ? [
                ...res.items.map((m) => ({
                  type: "ShippingMethod",
                  id: m?._id || m?.id || m?.code,
                })),
                { type: "ShippingMethod", id: "LIST" },
              ]
            : [{ type: "ShippingMethod", id: "LIST" }],
      }),

      /* ADMIN — GET BY ID */
      getShippingMethodById: build.query({
        query: (id) => ({ url: `/shipping/admin/methods/${id}` }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "ShippingMethod", id }],
      }),

      /* ADMIN — CREATE */
      createShippingMethod: build.mutation({
        // body: { code, name:{tr,en}, active, currency, calc, flatPrice_cents, order, ... }
        query: (data) => ({
          url: "/shipping/admin/methods",
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "ShippingMethod", id: "LIST" }],
      }),

      /* ADMIN — UPDATE */
      updateShippingMethod: build.mutation({
        query: ({ id, data }) => ({
          url: `/shipping/admin/methods/${id}`,
          method: "PUT",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, { id }) => [
          { type: "ShippingMethod", id },
          { type: "ShippingMethod", id: "LIST" },
        ],
      }),

      /* ADMIN — DELETE */
      deleteShippingMethod: build.mutation({
        query: (id) => ({
          url: `/shipping/admin/methods/${id}`,
          method: "DELETE",
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, id) => [
          { type: "ShippingMethod", id },
          { type: "ShippingMethod", id: "LIST" },
        ],
      }),

      /* PUBLIC — LIST ACTIVE */
      listActiveShippingMethods: build.query({
        // params: { zoneId?, ... }
        query: (params = {}) => ({
          url: "/shipping/public/methods",
          params,
        }),
        transformResponse: shapeList,
        providesTags: [{ type: "ShippingMethod", id: "PUBLIC_LIST" }],
      }),

      /* PUBLIC — QUOTE */
      quoteShippingMethod: build.mutation({
        // body: { code, subtotal_cents, weight_grams }
        query: (data) => ({
          url: "/shipping/public/methods/quote",
          method: "POST",
          body: data,
        }),
        transformResponse: pickData, // -> { price_cents, currency, ... }
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListShippingMethodsQuery,
  useGetShippingMethodByIdQuery,
  useCreateShippingMethodMutation,
  useUpdateShippingMethodMutation,
  useDeleteShippingMethodMutation,
  useListActiveShippingMethodsQuery,
  useQuoteShippingMethodMutation,
} = shippingMethodsApi;
