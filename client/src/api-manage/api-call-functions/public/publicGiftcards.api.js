import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";

/**
 * PUBLIC – Giftcards
 *  - GET    : GET  {public.giftcards}           ?code=GC-...
 *  - REDEEM : POST {public.giftcards}/redeem    { code, amount_cents, orderId?, note? }
 */
export const publicGiftcardsApi = api
  .enhanceEndpoints({ addTagTypes: ["GiftcardPublic"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* GET BY CODE (balance/status) */
      getPublicGiftcardByCode: build.query({
        query: (code) => ({ url: R.public.giftcards.list(), params: { code } }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (result) =>
          result?.code ? [{ type: "GiftcardPublic", id: result.code }] : [],
      }),

      /* REDEEM */
      redeemGiftcard: build.mutation({
        query: (body) => ({
          url: R.public.giftcards.$.child("redeem").create(),
          method: "POST",
          body,
        }),
        invalidatesTags: (_r, _e, { code }) =>
          code ? [{ type: "GiftcardPublic", id: String(code).toUpperCase() }] : [],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useGetPublicGiftcardByCodeQuery,
  useRedeemGiftcardMutation,
} = publicGiftcardsApi;
