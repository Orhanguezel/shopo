// client/api-manage/api-call-functions/admin/fees.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – Fees
 *  - LIST   : GET    /fees/admin                      ?q=&lang=&isActive=&currency=&mode=&when=&limit=&sort=
 *  - GET    : GET    /fees/admin/:id
 *  - CREATE : POST   /fees/admin
 *  - UPDATE : PUT    /fees/admin/:id
 *  - DELETE : DELETE /fees/admin/:id
 */
export const adminFeesApi = api
  .enhanceEndpoints({ addTagTypes: ["Fee", "FeeList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST (filters) */
      listAdminFees: build.query({
        query: (params = {}) => ({
          url: R.admin.fees.list(),
          params,
        }),
        transformResponse: shapeList, // { items, total, meta }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((f) => ({
                type: "Fee",
                id: f?._id || f?.id,
              })),
              { type: "FeeList", id: "ADMIN" },
            ]
            : [{ type: "FeeList", id: "ADMIN" }],
      }),

      /* GET BY ID */
      getAdminFeeById: build.query({
        query: (id) => ({ url: R.admin.fees.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "Fee", id }],
      }),

      /* CREATE */
      createFee: build.mutation({
        query: (body) => ({
          url: R.admin.fees.create(),
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "FeeList", id: "ADMIN" }],
      }),

      /* UPDATE */
      updateFee: build.mutation({
        query: ({ id, data }) => ({
          url: R.admin.fees.update(id),
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Fee", id },
          { type: "FeeList", id: "ADMIN" },
        ],
      }),

      /* DELETE */
      deleteFee: build.mutation({
        query: (id) => ({
          url: R.admin.fees.remove(id),
          method: "DELETE",
        }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Fee", id },
          { type: "FeeList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminFeesQuery,
  useGetAdminFeeByIdQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} = adminFeesApi;
