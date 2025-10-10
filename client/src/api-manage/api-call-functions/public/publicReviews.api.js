import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";

/**
 * PUBLIC – Reviews
 *  - LIST   : GET  /api/review            ?product=&page=&limit=&sort=
 *  - STATS  : GET  /api/review/stats      ?product=
 *  - CREATE : POST /api/review            body: { product, rating, comment?, title?, images?[] }
 *  - LIKE   : POST /api/review/:id/like
 *  - DISLIKE: POST /api/review/:id/dislike
 */
export const publicReviewsApi = api
  .enhanceEndpoints({
    addTagTypes: ["Review", "ReviewListPublic", "ReviewStats"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST (only approved/public) */
      listPublicReviews: build.query({
        // params: { product, page, limit, sort }
        query: (params = {}) => ({ url: R.public.reviews.list(), params }),
        transformResponse: (res) => {
          const items = res?.data ?? res ?? [];
          const total =
            res?.meta?.total ??
            res?.total ??
            (Array.isArray(items) ? items.length : 0);
          return { items, total, meta: res?.meta };
        },
        providesTags: (_result, _e, params) => [
          { type: "ReviewListPublic", id: params?.product || "ALL" },
        ],
      }),

      /* STATS FOR PRODUCT */
      getProductReviewStats: build.query({
        query: (product) => ({
          // iki seçenekten biri:
          url: R.public.reviews.$.custom("stats"),
          // url: Extra.public.reviews.stats(), // <- istersen Extra’yı da kullanabilirsin
          params: { product },
        }),
        transformResponse: (res) => res?.data ?? res,
      providesTags: (_r, _e, product) => [{ type: "ReviewStats", id: product }],
    }),

      /* CREATE (public) */
      createPublicReview: build.mutation({
        query: (body) => ({
          url: R.public.reviews.create(),
          method: "POST",
          body,
        }),
        invalidatesTags: (_res, _err, arg) => [
          { type: "ReviewListPublic", id: arg?.product },
          { type: "ReviewStats", id: arg?.product },
        ],
      }),

      /* LIKE */
      likeReview: build.mutation({
        query: ({ id }) => ({
          url: R.public.reviews.like(id),
          method: "POST",
        }),
        invalidatesTags: (_r, _e, arg) => [{ type: "Review", id: arg?.id }],
      }),

      /* DISLIKE */
      dislikeReview: build.mutation({
        query: ({ id }) => ({
          url: R.public.reviews.dislike(id),
          method: "POST",
        }),
        invalidatesTags: (_r, _e, arg) => [{ type: "Review", id: arg?.id }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListPublicReviewsQuery,
  useGetProductReviewStatsQuery,
  useCreatePublicReviewMutation,
  useLikeReviewMutation,
  useDislikeReviewMutation,
} = publicReviewsApi;
