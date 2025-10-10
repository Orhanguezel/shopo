// src/api-manage/api-call-functions/public/publicNews.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * PUBLIC – News
 *  - LIST : GET {news}                 ?category=&onlyLocalized=true
 *  - GET  : GET {news}/:id
 *  - SLUG : GET {news}/slug/:slug
 */
export const publicNewsApi = api
  .enhanceEndpoints({ addTagTypes: ["NewsPublic", "NewsPublicList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listPublicNews: build.query({
        query: (params = {}) => ({ url: R.public.news.list(), params }),
        transformResponse: shapeList, // standart: { items, total, meta }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((it) => ({
                type: "NewsPublic",
                id: it?._id || it?.id,
              })),
              { type: "NewsPublicList", id: "PUBLIC" },
            ]
            : [{ type: "NewsPublicList", id: "PUBLIC" }],
      }),

      getPublicNewsById: build.query({
        query: (id) => ({ url: R.public.news.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (result) =>
          result?._id || result?.id
            ? [{ type: "NewsPublic", id: result._id || result.id }]
            : [],
      }),

      getPublicNewsBySlug: build.query({
        query: (slug) => ({ url: R.public.news.$.slug(slug) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (result) =>
          result?._id || result?.id
            ? [{ type: "NewsPublic", id: result._id || result.id }]
            : [],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListPublicNewsQuery,
  useGetPublicNewsByIdQuery,
  useGetPublicNewsBySlugQuery,
} = publicNewsApi;
