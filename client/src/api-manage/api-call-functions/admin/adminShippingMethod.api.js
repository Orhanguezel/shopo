// client/api-manage/api-call-functions/admin/shipping-methods.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList, pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – Shipping Methods
 *  - LIST   : GET  {shipping/method}
 *  - GET    : GET  {shipping/method}/:id
 *  - CREATE : POST {shipping/method}
 *  - UPDATE : PUT  {shipping/method}/:id
 *  - DELETE : DELETE {shipping/method}/:id
 *
 * Not: REGISTRY.admin.shippingMethod → "shipping/method"
 */
export const shippingAdminMethodsApi = api
  .enhanceEndpoints({ addTagTypes: ["ShippingMethod", "ShippingMethodList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listAdminShippingMethods: build.query({
        query: (params = {}) => ({ url: R.admin.shippingMethod.list(), params }),
        transformResponse: shapeList,
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((m) => ({ type: "ShippingMethod", id: m?._id || m?.id })),
              { type: "ShippingMethodList", id: "ADMIN" },
            ]
            : [{ type: "ShippingMethodList", id: "ADMIN" }],
      }),

      getAdminShippingMethodById: build.query({
        query: (id) => ({ url: R.admin.shippingMethod.get(id) }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "ShippingMethod", id }],
      }),

      createShippingMethod: build.mutation({
        query: (body) => ({ url: R.admin.shippingMethod.create(), method: "POST", body }),
        invalidatesTags: [{ type: "ShippingMethodList", id: "ADMIN" }],
      }),

      updateShippingMethod: build.mutation({
        query: ({ id, data }) => ({ url: R.admin.shippingMethod.update(id), method: "PUT", body: data }),
        invalidatesTags: (_r, _e, { id }) => [
          { type: "ShippingMethod", id },
          { type: "ShippingMethodList", id: "ADMIN" },
        ],
      }),

      deleteShippingMethod: build.mutation({
        query: (id) => ({ url: R.admin.shippingMethod.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [
          { type: "ShippingMethod", id },
          { type: "ShippingMethodList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminShippingMethodsQuery,
  useGetAdminShippingMethodByIdQuery,
  useCreateShippingMethodMutation,
  useUpdateShippingMethodMutation,
  useDeleteShippingMethodMutation,
} = shippingAdminMethodsApi;
