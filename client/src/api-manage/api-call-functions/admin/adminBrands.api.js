// client/api-manage/api-call-functions/admin/brands.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * Admin Brands API  (cookie auth, X-Tenant header)
 *  - LIST  : GET    /brand/admin        ?status=&q=&lang=&limit=&sort=
 *  - GET   : GET    /brand/admin/:id
 *  - CREATE: POST   /brand/admin
 *  - UPDATE: PUT    /brand/admin/:id
 *  - DELETE: DELETE /brand/admin/:id
 */
export const adminBrandsApi = api
  .enhanceEndpoints({ addTagTypes: ["Brand", "BrandList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST */
      getAdminBrands: build.query({
        query: (params = {}) => ({
          url: R.admin.brands.list(),
          params, // { status, q, lang, limit, sort }
        }),
        transformResponse: shapeList, // { items, total, meta }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((b) => ({
                type: "Brand",
                id: b?.id || b?._id,
              })),
              { type: "BrandList", id: "ADMIN" },
            ]
            : [{ type: "BrandList", id: "ADMIN" }],
      }),

      /* GET BY ID */
      getAdminBrandById: build.query({
        query: (id) => ({ url: R.admin.brands.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "Brand", id }],
      }),

      /* CREATE */
      createBrand: build.mutation({
        query: (payload) => ({
          url: R.admin.brands.create(),
          method: "POST",
          body: payload, // JSON
        }),
        invalidatesTags: [{ type: "BrandList", id: "ADMIN" }],
      }),

      /* UPDATE */
      updateBrand: build.mutation({
        query: ({ id, data }) => ({
          url: R.admin.brands.update(id),
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Brand", id },
          { type: "BrandList", id: "ADMIN" },
        ],
      }),

      /* DELETE */
      deleteBrand: build.mutation({
        query: (id) => ({
          url: R.admin.brands.remove(id),
          method: "DELETE",
        }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Brand", id },
          { type: "BrandList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useGetAdminBrandsQuery,
  useGetAdminBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = adminBrandsApi;
