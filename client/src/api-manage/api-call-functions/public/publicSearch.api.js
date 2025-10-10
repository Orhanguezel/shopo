import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * PUBLIC – Search
 *  - SEARCH  : GET  {public.search}               ?q=&type=&page=&limit=
 *  - SUGGEST : GET  {public.search}/suggest       ?q=&type=&limit=
 *  - TRACK   : POST {public.search}/track         { q, type }
 */
export const publicSearchApi = api
  .enhanceEndpoints({ addTagTypes: ["PublicSearchList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* SEARCH results */
      listPublicSearch: build.query({
        // params: { q, type, page, limit }
        query: (params = {}) => ({ url: R.public.search.list(), params }),
        transformResponse: (res) => {
          const { items, total } = shapeList(res);
          return { items, total, meta: res?.meta };
        },
        providesTags: () => [{ type: "PublicSearchList", id: "QUERY" }],
      }),

      /* SUGGEST (array of { q, type, weight }) */
      suggestPublicSearch: build.query({
        // params: { q, type, limit }
        query: (params = {}) => ({
          url: R.public.search.$.custom("suggest"),
          params,
        }),
        transformResponse: (res) => res?.data ?? [],
      }),

      /* TRACK (202) */
      trackPublicSearch: build.mutation({
        // body: { q, type: "search" | "product" | "brand" | "category" }
        query: (body) => ({
          url: R.public.search.$.custom("track"),
          method: "POST",
          body,
        }),
        transformResponse: (res) => res,
        // İstersen tetik sonrası listeyi invalid edebilirsin:
        // invalidatesTags: [{ type: "PublicSearchList", id: "QUERY" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListPublicSearchQuery,
  useSuggestPublicSearchQuery,
  useTrackPublicSearchMutation,
} = publicSearchApi;
