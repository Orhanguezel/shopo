// client/api-manage/api-call-functions/admin/products.js
import { api, toFormData } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";



/**
 * Admin ürün uçları (korumalı)
 * - LIST:      GET    admin/product
 * - GET BY ID: GET    admin/product/:id
 * - CREATE:    POST   admin/product
 * - UPDATE:    PATCH  admin/product/:id
 * - DELETE:    DELETE admin/product/:id
 */
export const adminProductsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // LIST
    getAdminProducts: build.query({
      query: (params = {}) => ({
        url: R.admin.products.list(),
        params: {
          page: 1,
          pageSize: 20,
          sort: "created_desc",
          ...params,
        },
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
            ...result.items.map((p) => ({
              type: "Product",
              id: p?.id || p?._id,
            })),
            { type: "ProductList", id: "ADMIN" },
          ]
          : [{ type: "ProductList", id: "ADMIN" }],
    }),

    // GET BY ID
    getAdminProductById: build.query({
      query: (id) => ({ url: R.admin.products.get(id) }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    // CREATE (multipart)
    createProduct: build.mutation({
      query: (payload) => ({
        url: R.admin.products.create(),
        method: "POST",
        body: toFormData(payload),
      }),
      invalidatesTags: [{ type: "ProductList", id: "ADMIN" }],
    }),

    // UPDATE (multipart)
    updateProduct: build.mutation({
      query: ({ id, data }) => ({
        url: R.admin.products.update(id),
        method: "PATCH",
        body: toFormData(data),
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Product", id },
        { type: "ProductList", id: "ADMIN" },
      ],
    }),

    // DELETE
    deleteProduct: build.mutation({
      query: (id) => ({ url: R.admin.products.remove(id), method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Product", id },
        { type: "ProductList", id: "ADMIN" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminProductsQuery,
  useGetAdminProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = adminProductsApi;
