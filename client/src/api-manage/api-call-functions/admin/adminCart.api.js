// client/api-manage/api-call-functions/admin/cart.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * Admin Cart endpoints
 *  GET    /cart/admin
 *  GET    /cart/admin/:id
 *  PUT    /cart/admin/:id            -> { status?, couponCode?, isActive? }
 *  PATCH  /cart/admin/:id/toggle-active
 *  DELETE /cart/admin/:id
 */
export const adminCartApi = api
  .enhanceEndpoints({ addTagTypes: ["Cart", "CartList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /** LIST: /cart/admin */
      listAdminCarts: build.query({
        query: (params = {}) => ({
          url: R.admin.cart.list(),
          params: { page: 1, pageSize: 50, ...params },
        }),
        transformResponse: shapeList, // { items, total, meta }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((c) => ({
                type: "Cart",
                id: c?.id || c?._id,
              })),
              { type: "CartList", id: "ADMIN" },
            ]
            : [{ type: "CartList", id: "ADMIN" }],
      }),

      /** GET: /cart/admin/:id */
      getAdminCartById: build.query({
        query: (id) => ({ url: R.admin.cart.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "Cart", id }],
      }),

      /** PUT: /cart/admin/:id */
      updateAdminCart: build.mutation({
        query: ({ id, data }) => ({
          url: R.admin.cart.update(id),
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Cart", id },
          { type: "CartList", id: "ADMIN" },
        ],
      }),

      /** PATCH: /cart/admin/:id/toggle-active */
      toggleAdminCartActive: build.mutation({
        query: (id) => ({
          url: R.admin.cart.$.custom(`${id}/toggle-active`),
          method: "PATCH",
        }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Cart", id },
          { type: "CartList", id: "ADMIN" },
        ],
      }),

      /** DELETE: /cart/admin/:id */
      deleteAdminCart: build.mutation({
        query: (id) => ({ url: R.admin.cart.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Cart", id },
          { type: "CartList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminCartsQuery,
  useGetAdminCartByIdQuery,
  useUpdateAdminCartMutation,
  useToggleAdminCartActiveMutation,
  useDeleteAdminCartMutation,
} = adminCartApi;
