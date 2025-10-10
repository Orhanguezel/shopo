// client/api-manage/api-call-functions/admin/compare.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

export const compareAdminApi = api
  .enhanceEndpoints({ addTagTypes: ["AdminCompare", "AdminCompareList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /** GET {compare/admin}  ?user=&session=&limit= */
      listAdminCompares: build.query({
        query: (params = {}) => ({ url: R.admin.compare.list(), params }),
        transformResponse: shapeList,
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((c) => ({ type: "AdminCompare", id: c?._id || c?.id })),
              { type: "AdminCompareList", id: "LIST" },
            ]
            : [{ type: "AdminCompareList", id: "LIST" }],
      }),

      /** GET {compare/admin}/:id */
      getAdminCompareById: build.query({
        query: (id) => ({ url: R.admin.compare.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "AdminCompare", id }],
      }),

      /** DELETE {compare/admin}/:id */
      deleteAdminCompare: build.mutation({
        query: (id) => ({ url: R.admin.compare.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [
          { type: "AdminCompare", id },
          { type: "AdminCompareList", id: "LIST" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminComparesQuery,
  useGetAdminCompareByIdQuery,
  useDeleteAdminCompareMutation,
} = compareAdminApi;
