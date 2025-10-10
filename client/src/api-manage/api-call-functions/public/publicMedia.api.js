import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData, shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * PUBLIC – Media
 *  - LIST : GET {public.media}            ?tag=&page=&limit=
 *  - GET  : GET {public.media}/:id
 */
export const publicMediaApi = api
  .enhanceEndpoints({ addTagTypes: ["Media", "MediaList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST (paged + optional tag) */
      listPublicMedia: build.query({
        // params: { tag, page, limit }
        query: (params = {}) => ({ url: R.public.media.list(), params }),
        transformResponse: shapeList, // { items, total }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((m) => ({
                type: "Media",
                id: m?._id || m?.id,
              })),
              { type: "MediaList", id: "PUBLIC" },
            ]
            : [{ type: "MediaList", id: "PUBLIC" }],
      }),

      /* GET BY ID */
      getPublicMediaById: build.query({
        query: (id) => ({ url: R.public.media.get(id) }),
        transformResponse: pickData, // -> res.data
        providesTags: (_r, _e, id) => [{ type: "Media", id }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListPublicMediaQuery,
  useGetPublicMediaByIdQuery,
} = publicMediaApi;
