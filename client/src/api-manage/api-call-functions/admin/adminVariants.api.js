import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData, shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * Admin Variant
 *  - LIST  : GET    {admin.variants}
 *  - GET   : GET    {admin.variants}/:id
 *  - CREATE: POST   {admin.variants}
 *  - UPDATE: PUT    {admin.variants}/:id
 *  - DELETE: DELETE {admin.variants}/:id
 */
export const adminVariantsApi = api
  .enhanceEndpoints({ addTagTypes: ["Variant", "VariantList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listAdminVariants: build.query({
        query: (params = {}) => ({
          url: R.admin.variants.list(),
          params: { limit: 50, sort: "created_desc", ...params },
        }),
        transformResponse: shapeList,
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((v) => ({ type: "Variant", id: v?.id || v?._id })),
              { type: "VariantList", id: "ADMIN" },
            ]
            : [{ type: "VariantList", id: "ADMIN" }],
      }),

      getAdminVariantById: build.query({
        query: (id) => ({ url: R.admin.variants.get(id) }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "Variant", id }],
      }),

      createVariant: build.mutation({
        query: (payload) => ({ url: R.admin.variants.create(), method: "POST", body: payload }),
        invalidatesTags: [{ type: "VariantList", id: "ADMIN" }],
      }),

      updateVariant: build.mutation({
        query: ({ id, data }) => ({ url: R.admin.variants.update(id), method: "PUT", body: data }),
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Variant", id },
          { type: "VariantList", id: "ADMIN" },
        ],
      }),

      deleteVariant: build.mutation({
        query: (id) => ({ url: R.admin.variants.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Variant", id },
          { type: "VariantList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminVariantsQuery,
  useGetAdminVariantByIdQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
} = adminVariantsApi;
