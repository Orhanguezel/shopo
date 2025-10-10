// client/api-manage/api-call-functions/admin/giftcards.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – Giftcards
 *  - LIST   : GET    /giftcards/admin                      ?q=&status=&from=&to=&page=&limit=
 *  - GET    : GET    /giftcards/admin/:id
 *  - ISSUE  : POST   /giftcards/admin/issue                { initialBalance_cents, currency, expiresAt?, code? }
 *  - TOPUP  : POST   /giftcards/admin/:id/topup            { amount_cents, note? }
 *  - META   : PATCH  /giftcards/admin/:id/meta             { expiresAt?, currency? }
 *  - STATUS : PATCH  /giftcards/admin/:id/status           { status: "active" | "disabled" }
 *  - DELETE : DELETE /giftcards/admin/:id
 */
export const adminGiftcardsApi = api
  .enhanceEndpoints({ addTagTypes: ["Giftcard", "GiftcardList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST (paged + filters) */
      listAdminGiftcards: build.query({
        query: (params = {}) => ({ url: R.admin.giftcards.list(), params }),
        transformResponse: shapeList, // { items, total, meta }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((g) => ({
                type: "Giftcard",
                id: g?._id || g?.id,
              })),
              { type: "GiftcardList", id: "ADMIN" },
            ]
            : [{ type: "GiftcardList", id: "ADMIN" }],
      }),

      /* GET BY ID */
      getAdminGiftcardById: build.query({
        query: (id) => ({ url: R.admin.giftcards.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "Giftcard", id }],
      }),

      /* ISSUE */
      issueGiftcard: build.mutation({
        query: (body) => ({
          url: R.admin.giftcards.$.custom("issue"),
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "GiftcardList", id: "ADMIN" }],
      }),

      /* TOPUP */
      topupGiftcard: build.mutation({
        query: ({ id, data }) => ({
          url: R.admin.giftcards.$.custom(`${id}/topup`),
          method: "POST",
          body: data,
        }),
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Giftcard", id },
          { type: "GiftcardList", id: "ADMIN" },
        ],
      }),

      /* UPDATE META */
      updateGiftcardMeta: build.mutation({
        query: ({ id, data }) => ({
          url: R.admin.giftcards.$.custom(`${id}/meta`),
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (_r, _e, { id }) => [{ type: "Giftcard", id }],
      }),

      /* CHANGE STATUS */
      changeGiftcardStatus: build.mutation({
        query: ({ id, status }) => ({
          url: R.admin.giftcards.$.custom(`${id}/status`),
          method: "PATCH",
          body: { status },
        }),
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Giftcard", id },
          { type: "GiftcardList", id: "ADMIN" },
        ],
      }),

      /* DELETE */
      deleteGiftcard: build.mutation({
        query: (id) => ({
          url: R.admin.giftcards.remove(id),
          method: "DELETE",
        }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Giftcard", id },
          { type: "GiftcardList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminGiftcardsQuery,
  useGetAdminGiftcardByIdQuery,
  useIssueGiftcardMutation,
  useTopupGiftcardMutation,
  useUpdateGiftcardMetaMutation,
  useChangeGiftcardStatusMutation,
  useDeleteGiftcardMutation,
} = adminGiftcardsApi;
