// src/api-manage/api-call-functions/public/publicBlog.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * PUBLIC – Blog
 *  - LIST : GET {blog}                 ?category=&onlyLocalized=true
 *  - GET  : GET {blog}/:id
 *  - SLUG : GET {blog}/slug/:slug
 */
export const publicBlogApi = api
  .enhanceEndpoints({ addTagTypes: ["BlogPublic", "BlogPublicList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listPublicBlog: build.query({
        query: (params = {}) => ({ url: R.public.blog.list(), params }),
        transformResponse: shapeList, // standart: { items, total, meta }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((it) => ({
                type: "BlogPublic",
                id: it?._id || it?.id,
              })),
              { type: "BlogPublicList", id: "PUBLIC" },
            ]
            : [{ type: "BlogPublicList", id: "PUBLIC" }],
      }),

      getPublicBlogById: build.query({
        query: (id) => ({ url: R.public.blog.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (result) =>
          result?._id || result?.id
            ? [{ type: "BlogPublic", id: result._id || result.id }]
            : [],
      }),

      getPublicBlogBySlug: build.query({
        query: (slug) => ({ url: R.public.blog.$.slug(slug) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (result) =>
          result?._id || result?.id
            ? [{ type: "BlogPublic", id: result._id || result.id }]
            : [],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListPublicBlogQuery,
  useGetPublicBlogByIdQuery,
  useGetPublicBlogBySlugQuery,
} = publicBlogApi;
