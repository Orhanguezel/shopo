// src/api-manage/api-call-functions/public/publicAbout.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * PUBLIC – About
 *  - LIST : GET {about}                 ?category=&onlyLocalized=true
 *  - GET  : GET {about}/:id
 *  - SLUG : GET {about}/slug/:slug
 */
export const publicAboutApi = api
  .enhanceEndpoints({ addTagTypes: ["AboutusPublic", "AboutusPublicList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listPublicAbout: build.query({
        query: (params = {}) => ({ url: R.public.about.list(), params }),
        transformResponse: shapeList, // standart: { items, total, meta }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((it) => ({
                type: "AboutusPublic",
                id: it?._id || it?.id,
              })),
              { type: "AboutusPublicList", id: "PUBLIC" },
            ]
            : [{ type: "AboutusPublicList", id: "PUBLIC" }],
      }),

      getPublicAboutById: build.query({
        query: (id) => ({ url: R.public.about.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (result) =>
          result?._id || result?.id
            ? [{ type: "AboutusPublic", id: result._id || result.id }]
            : [],
      }),

      getPublicAboutBySlug: build.query({
        query: (slug) => ({ url: R.public.about.$.slug(slug) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (result) =>
          result?._id || result?.id
            ? [{ type: "AboutusPublic", id: result._id || result.id }]
            : [],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListPublicAboutQuery,
  useGetPublicAboutByIdQuery,
  useGetPublicAboutBySlugQuery,
} = publicAboutApi;
