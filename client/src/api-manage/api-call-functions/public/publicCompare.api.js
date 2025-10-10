import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";

/** Yardımcı: MyCompare cache anahtarı */
const myKey = (sessionId) => (sessionId ? `GUEST:${sessionId}` : "AUTH");
const shapeOne = (res) => res?.data ?? res;

export const comparePublicApi = api
  .enhanceEndpoints({ addTagTypes: ["MyCompare"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /** GET {public.compare}/me  (guest: x-session-id) */
      getMyCompare: build.query({
        // arg?: { sessionId?: string }
        query: (arg = {}) => ({
          url: R.public.compare.$.custom("me"),
          headers: arg.sessionId ? { "x-session-id": arg.sessionId } : undefined,
        }),
        transformResponse: shapeOne,
        providesTags: (_r, _e, arg) => [{ type: "MyCompare", id: myKey(arg?.sessionId) }],
      }),

      /** POST {public.compare}/items  { product, variant?, note?, session? } */
      addCompareItem: build.mutation({
        // { product, variant?, note?, sessionId? }
        query: ({ sessionId, ...body }) => ({
          url: R.public.compare.$.child("items").create(),
          method: "POST",
          headers: sessionId ? { "x-session-id": sessionId } : undefined,
          body: sessionId ? { ...body, session: sessionId } : body,
        }),
        invalidatesTags: (_r, _e, arg) => [{ type: "MyCompare", id: myKey(arg?.sessionId) }],
      }),

      /** DELETE {public.compare}/items  { product, variant?, session? } */
      removeCompareItem: build.mutation({
        // { product, variant?, sessionId? }
        query: ({ sessionId, ...body }) => ({
          url: R.public.compare.$.child("items").list(), // same base; DELETE w/ body
          method: "DELETE",
          headers: sessionId ? { "x-session-id": sessionId } : undefined,
          body: sessionId ? { ...body, session: sessionId } : body,
        }),
        invalidatesTags: (_r, _e, arg) => [{ type: "MyCompare", id: myKey(arg?.sessionId) }],
      }),

      /** DELETE {public.compare}/clear */
      clearMyCompare: build.mutation({
        // { sessionId? }
        query: ({ sessionId } = {}) => ({
          url: R.public.compare.$.action("clear"),
          method: "DELETE",
          headers: sessionId ? { "x-session-id": sessionId } : undefined,
        }),
        invalidatesTags: (_r, _e, arg) => [{ type: "MyCompare", id: myKey(arg?.sessionId) }],
      }),

      /** POST {public.compare}/merge  { fromSession } */
      mergeCompare: build.mutation({
        // { fromSession: string }
        query: (body) => ({
          url: R.public.compare.$.action("merge"),
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "MyCompare", id: "AUTH" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useGetMyCompareQuery,
  useAddCompareItemMutation,
  useRemoveCompareItemMutation,
  useClearMyCompareMutation,
  useMergeCompareMutation,
} = comparePublicApi;
