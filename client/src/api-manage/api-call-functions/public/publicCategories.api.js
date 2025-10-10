// src/api-manage/api-call-functions/public/publicCategories.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * Public Category
 *  - LIST:        GET {public.categories}?view=shopo
 *  - TREE:        GET {public.categories}/tree
 *  - GET BY SLUG: GET {public.categories}/slug/:slug
 *  - GET BY ID:   GET {public.categories}/:id
 */
export const publicCategoriesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPublicCategories: build.query({
      query: (params = {}) => ({
        url: R.public.categories.list(),
        params: { view: "shopo", ...params },
      }),
      transformResponse: (res) => {
        const items =
          res?.categories ??
          res?.data ??
          (Array.isArray(res) ? res : []) ??
          [];
        const total = res?.total ?? res?.meta?.total ?? items.length ?? 0;
        return { items, total };
      },
      providesTags: (result) =>
        result?.items?.length
          ? [
            ...result.items.map((c) => ({ type: "Category", id: c?.id || c?._id })),
            { type: "Category", id: "PUBLIC_LIST" },
          ]
          : [{ type: "Category", id: "PUBLIC_LIST" }],
    }),

    getPublicCategoryTree: build.query({
      query: () => ({ url: R.public.categories.$.custom("tree") }),
      transformResponse: (res) => res?.data ?? res ?? [],
      providesTags: () => [{ type: "Category", id: "TREE" }],
    }),

    getPublicCategoryBySlug: build.query({
      query: (slug) => ({ url: R.public.categories.$.slug(slug) }),
      transformResponse: pickData,
      providesTags: (result) =>
        result?.id || result?._id ? [{ type: "Category", id: result.id || result._id }] : [],
    }),

    getPublicCategoryById: build.query({
      query: (id) => ({ url: R.public.categories.get(id) }),
      transformResponse: pickData,
      providesTags: (_r, _e, id) => [{ type: "Category", id }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPublicCategoriesQuery,
  useGetPublicCategoryTreeQuery,
  useGetPublicCategoryBySlugQuery,
  useGetPublicCategoryByIdQuery,
} = publicCategoriesApi;
