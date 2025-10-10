// client/api-manage/api-call-functions/admin/orders.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList, pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * Admin Orders
 *  GET    /orders/admin                         -> list (filters)
 *  GET    /orders/admin/:id                     -> by id
 *  GET    /orders/admin/by-no/:orderNo          -> by order number
 *  PUT    /orders/admin/:id/status              -> { status }
 *  PUT    /orders/admin/:id/deliver             -> mark delivered
 *  POST   /orders/admin/:id/notes               -> { text }
 *  POST   /orders/admin/:id/cancel              -> { reason }
 *  DELETE /orders/admin/:id                     -> delete
 */
export const adminOrdersApi = api
  .enhanceEndpoints({ addTagTypes: ["Order", "OrderList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /** List orders (paged) */
      listAdminOrders: build.query({
        query: (params = {}) => ({
          url: R.admin.orders.list(),
          params: { page: 1, pageSize: 20, ...params },
        }),
        transformResponse: shapeList,
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((o) => ({ type: "Order", id: o?.id || o?._id })),
              { type: "OrderList", id: "ADMIN" },
            ]
            : [{ type: "OrderList", id: "ADMIN" }],
      }),

      /** Get by ID */
      getAdminOrderById: build.query({
        query: (id) => ({ url: R.admin.orders.get(id) }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "Order", id }],
      }),

      /** Get by order number */
      getAdminOrderByNo: build.query({
        query: (orderNo) => ({ url: R.admin.orders.$.custom(`by-no/${orderNo}`) }),
        transformResponse: pickData,
        providesTags: (result) =>
          result?._id || result?.id ? [{ type: "Order", id: result._id || result.id }] : [],
      }),

      /** Update status */
      updateAdminOrderStatus: build.mutation({
        query: ({ id, status }) => ({
          url: R.admin.orders.$.custom(`${id}/status`),
          method: "PUT",
          body: { status },
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }, { type: "OrderList", id: "ADMIN" }],
      }),

      /** Mark delivered (→ completed) */
      markAdminOrderDelivered: build.mutation({
        query: (id) => ({ url: R.admin.orders.$.custom(`${id}/deliver`), method: "PUT" }),
        invalidatesTags: (_r, _e, id) => [{ type: "Order", id }, { type: "OrderList", id: "ADMIN" }],
      }),

      /** Add timeline note */
      addAdminOrderNote: build.mutation({
        query: ({ id, text }) => ({
          url: R.admin.orders.$.custom(`${id}/notes`),
          method: "POST",
          body: { text },
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }],
      }),

      /** Cancel order */
      cancelAdminOrder: build.mutation({
        query: ({ id, reason }) => ({
          url: R.admin.orders.$.custom(`${id}/cancel`),
          method: "POST",
          body: { reason },
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }, { type: "OrderList", id: "ADMIN" }],
      }),

      /** Delete order */
      deleteAdminOrder: build.mutation({
        query: (id) => ({ url: R.admin.orders.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [{ type: "Order", id }, { type: "OrderList", id: "ADMIN" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useGetAdminOrderByNoQuery,
  useUpdateAdminOrderStatusMutation,
  useMarkAdminOrderDeliveredMutation,
  useAddAdminOrderNoteMutation,
  useCancelAdminOrderMutation,
  useDeleteAdminOrderMutation,
} = adminOrdersApi;
