import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData, shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * Public Orders
 *  POST   {public.orders}                        -> create (supports Idempotency-Key)
 *  GET    {public.orders}                        -> my orders (paged or flat)
 *  GET    {public.orders}/:id                    -> order detail
 *  PUT    {public.orders}/:id/address            -> { shippingAddress }
 */
export const publicOrdersApi = api
  .enhanceEndpoints({ addTagTypes: ["Order", "OrderList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /** Create order (idempotent) */
      createOrder: build.mutation({
        // args: { data, idempotencyKey? }
        query: ({ data, idempotencyKey }) => ({
          url: R.public.orders.create(),
          method: "POST",
          body: data,
          headers: idempotencyKey
            ? { "Idempotency-Key": idempotencyKey }
            : undefined,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "OrderList", id: "PUBLIC" }],
      }),

      /** List my orders */
      getMyOrders: build.query({
        // params: { page?, pageSize?, status?, q? ... }
        query: (params = {}) => ({ url: R.public.orders.list(), params }),
        transformResponse: shapeList, // -> { items, total }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((o) => ({
                type: "Order",
                id: o?.id || o?._id,
              })),
              { type: "OrderList", id: "PUBLIC" },
            ]
            : [{ type: "OrderList", id: "PUBLIC" }],
      }),

      /** Get single order (owner) */
      getMyOrderById: build.query({
        query: (id) => ({ url: R.public.orders.get(id) }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "Order", id }],
      }),

      /** Update shipping address */
      updateMyOrderAddress: build.mutation({
        // args: { id, shippingAddress }
        query: ({ id, shippingAddress }) => ({
          url: R.public.orders.$.child(id).custom("address"),
          method: "PUT",
          body: { shippingAddress },
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetMyOrderByIdQuery,
  useUpdateMyOrderAddressMutation,
} = publicOrdersApi;
