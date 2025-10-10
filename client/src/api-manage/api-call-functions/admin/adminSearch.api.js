// client/api-manage/api-call-functions/admin/search.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList, pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – SearchIndex
 *  - REBUILD : POST   /search/admin/rebuild   { types? }
 *  - UPSERT  : POST   /search/admin/upsert    { ...doc }
 *  - LIST    : GET    /search/admin           ?q=&type=&isActive=&page=&limit=
 *  - GET     : GET    /search/admin/:id
 *  - DELETE  : DELETE /search/admin/:id
 */
export const adminSearchApi = api
  .enhanceEndpoints({ addTagTypes: ["SearchIndex", "SearchIndexList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* REBUILD */
      rebuildAdminSearchIndex: build.mutation({
        query: (body = {}) => ({
          url: R.admin.search.$.custom("rebuild"),
          method: "POST",
          body,
        }),
        transformResponse: (res) => res,
        invalidatesTags: [{ type: "SearchIndexList", id: "ADMIN" }],
      }),

      /* UPSERT one */
      upsertAdminSearchIndex: build.mutation({
        query: (body) => ({
          url: R.admin.search.$.custom("upsert"),
          method: "POST",
          body,
        }),
        transformResponse: (res) => res,
        invalidatesTags: [{ type: "SearchIndexList", id: "ADMIN" }],
      }),

      /* LIST */
      listAdminSearchIndex: build.query({
        query: (params = {}) => ({ url: R.admin.search.list(), params }),
        transformResponse: (res) => {
          const { items, total } = shapeList(res);
          return { items, total, meta: res?.meta };
        },
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((it) => ({ type: "SearchIndex", id: it?._id || it?.id })),
              { type: "SearchIndexList", id: "ADMIN" },
            ]
            : [{ type: "SearchIndexList", id: "ADMIN" }],
      }),

      /* GET by id */
      getAdminSearchById: build.query({
        query: (id) => ({ url: R.admin.search.get(id) }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "SearchIndex", id }],
      }),

      /* DELETE by id */
      deleteAdminSearchById: build.mutation({
        query: (id) => ({ url: R.admin.search.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [{ type: "SearchIndex", id }, { type: "SearchIndexList", id: "ADMIN" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useRebuildAdminSearchIndexMutation,
  useUpsertAdminSearchIndexMutation,
  useListAdminSearchIndexQuery,
  useGetAdminSearchByIdQuery,
  useDeleteAdminSearchByIdMutation,
} = adminSearchApi;
