// client/api-manage/api-call-functions/admin/categories.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";

/** FormData helper (standart) */
const toFormData = (obj = {}) => {
  if (obj instanceof FormData) return obj;
  const fd = new FormData();
  Object.entries(obj).forEach(([key, val]) => {
    if (val == null) return;
    if (key === "images") {
      const arr = Array.isArray(val) ? val : [val];
      arr.forEach((f) => f != null && fd.append("images", f));
      return;
    }
    if (typeof val === "object" && !(val instanceof File) && !(val instanceof Blob)) {
      fd.append(key, JSON.stringify(val));
    } else {
      fd.append(key, val);
    }
  });
  return fd;
};

/**
 * Admin Category API
 *  - LIST:   GET    /category/admin/list           ?active=&parent=
 *  - GET:    GET    /category/:id                  (public path)
 *  - CREATE: POST   /category                      (multipart)
 *  - UPDATE: PUT    /category/:id                  (multipart)
 *  - DELETE: DELETE /category/:id
 *
 * Not: LIST admin altında `/list`, diğerleri public base'te çalışıyor.
 */
export const adminCategoriesApi = api
  .enhanceEndpoints({ addTagTypes: ["Category"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST (admin özel alt yol) */
      getAdminCategories: build.query({
        query: (params = {}) => ({
          url: R.admin.categories.$.custom("list"),
          params,
        }),
        transformResponse: (res) => {
          const items =
            res?.data ??
            res?.items ??
            (Array.isArray(res) ? res : []) ??
            [];
          const total =
            res?.meta?.total ??
            res?.total ??
            (Array.isArray(items) ? items.length : 0);
          return { items, total, meta: res?.meta };
        },
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((c) => ({
                type: "Category",
                id: c?.id || c?._id,
              })),
              { type: "Category", id: "LIST" },
            ]
            : [{ type: "Category", id: "LIST" }],
      }),

      /* GET BY ID (public base) */
      getAdminCategoryById: build.query({
        query: (id) => ({ url: R.public.categories.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "Category", id }],
      }),

      /* CREATE (multipart, public base) */
      createCategory: build.mutation({
        query: (payload) => ({
          url: R.public.categories.create(),
          method: "POST",
          body: toFormData(payload),
        }),
        invalidatesTags: [{ type: "Category", id: "LIST" }],
      }),

      /* UPDATE (multipart, public base) */
      updateCategory: build.mutation({
        query: ({ id, data }) => ({
          url: R.public.categories.update(id),
          method: "PUT",
          body: toFormData(data),
        }),
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Category", id },
          { type: "Category", id: "LIST" },
        ],
      }),

      /* DELETE (public base) */
      deleteCategory: build.mutation({
        query: (id) => ({
          url: R.public.categories.remove(id),
          method: "DELETE",
        }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Category", id },
          { type: "Category", id: "LIST" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useGetAdminCategoriesQuery,
  useGetAdminCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = adminCategoriesApi;
