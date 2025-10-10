// client/api-manage/api-call-functions/admin/reviews.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList, pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – Reviews
 *  - LIST   : GET    /review/admin                      ?product=&user=&status=&q=&minRating=&maxRating=&page=&limit=&sort=
 *  - GET    : GET    /review/admin/:id
 *  - UPDATE : PUT    /review/admin/:id                  { rating?, title?, content?, images?, status? }
 *  - STATUS : PATCH  /review/admin/:id/status           { status: "pending" | "approved" | "rejected" }
 *  - DELETE : DELETE /review/admin/:id
 */
export const adminReviewsApi = api
  .enhanceEndpoints({ addTagTypes: ["Review", "ReviewListAdmin", "ReviewStats"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST (paged + filters) */
      listAdminReviews: build.query({
        query: (params = {}) => ({ url: R.admin.reviews.list(), params }),
        transformResponse: shapeList, // { items, total, meta? }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((r) => ({ type: "Review", id: r?._id || r?.id })),
              { type: "ReviewListAdmin", id: "ADMIN" },
            ]
            : [{ type: "ReviewListAdmin", id: "ADMIN" }],
      }),

      /* GET BY ID */
      getAdminReviewById: build.query({
        query: (id) => ({ url: R.admin.reviews.get(id) }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "Review", id }],
      }),

      /* UPDATE */
      updateAdminReview: build.mutation({
        // args: { id, data }
        query: ({ id, data }) => ({
          url: R.admin.reviews.update(id),
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "Review", id }, { type: "ReviewListAdmin", id: "ADMIN" }],
      }),

      /* CHANGE STATUS */
      changeAdminReviewStatus: build.mutation({
        // args: { id, status, product? }
        query: ({ id, status }) => ({
          url: R.admin.reviews.$.custom(`${id}/status`),
          method: "PATCH",
          body: { status },
        }),
        invalidatesTags: (r, _e, { id, product }) => {
          const tags = [{ type: "Review", id }, { type: "ReviewListAdmin", id: "ADMIN" }];
          const prodId = product || r?.data?.product || undefined;
          if (prodId) tags.push({ type: "ReviewStats", id: prodId });
          return tags;
        },
      }),

      /* DELETE */
      deleteAdminReview: build.mutation({
        query: (id) => ({ url: R.admin.reviews.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [{ type: "Review", id }, { type: "ReviewListAdmin", id: "ADMIN" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminReviewsQuery,
  useGetAdminReviewByIdQuery,
  useUpdateAdminReviewMutation,
  useChangeAdminReviewStatusMutation,
  useDeleteAdminReviewMutation,
} = adminReviewsApi;
