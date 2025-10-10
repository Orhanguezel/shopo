import { api, toFormData } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList, pickData } from "@/api-manage/another-formated-api/shapeList";

// ---- Route fallbacks (R'de yoksa güvenli yollar) ----
const ADM = R?.admin?.sellers ?? {
  list:   () => "/sellers/admin",
  get:    (id) => `/sellers/admin/${id}`,
  create: () => "/sellers/admin",
  update: (id) => `/sellers/admin/${id}`,
  delete: (id) => `/sellers/admin/${id}`,
};

/**
 * SELLERS – Admin
 *
 *  Admin (auth/cookie + RBAC):
 *   - LIST    : GET    /sellers/admin            ?q=&kind=&isActive=
 *   - GET     : GET    /sellers/admin/:id
 *   - CREATE  : POST   /sellers/admin            (multipart: images[])
 *   - UPDATE  : PUT    /sellers/admin/:id        (multipart: images[] + removeImages, primaryIndex, replaceAt)
 *   - DELETE  : DELETE /sellers/admin/:id
 */
export const sellersApi = api
  .enhanceEndpoints({ addTagTypes: ["Seller", "SellerList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listSellersAdmin: build.query({
        query: (params = {}) => ({ url: ADM.list(), params, credentials: "include" }),
        transformResponse: (res) => shapeList(res),
        providesTags: (result) =>
          result?.items?.length
            ? [
                ...result.items.map((it) => ({ type: "Seller", id: it?._id || it?.id })),
                { type: "SellerList", id: "ADMIN" },
              ]
            : [{ type: "SellerList", id: "ADMIN" }],
      }),

      getSellerAdminById: build.query({
        query: (id) => ({ url: ADM.get(id), credentials: "include" }),
        transformResponse: (res) => pickData(res),
        providesTags: (_r, _e, id) => [{ type: "Seller", id }],
      }),

      createSellerAdmin: build.mutation({
        query: (payload = {}) => {
          const body = toFormData(payload); // images[] + JSON stringify otomatik
          return { url: ADM.create(), method: "POST", body, credentials: "include" };
        },
        transformResponse: (res) => pickData(res),
        invalidatesTags: [{ type: "SellerList", id: "ADMIN" }],
      }),

      updateSellerAdmin: build.mutation({
        query: ({ id, ...payload }) => {
          const body = toFormData(payload);
          return { url: ADM.update(id), method: "PUT", body, credentials: "include" };
        },
        transformResponse: (res) => pickData(res),
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Seller", id },
          { type: "SellerList", id: "ADMIN" },
        ],
      }),

      deleteSellerAdmin: build.mutation({
        query: (id) => ({ url: ADM.delete(id), method: "DELETE", credentials: "include" }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Seller", id },
          { type: "SellerList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListSellersAdminQuery,
  useGetSellerAdminByIdQuery,
  useCreateSellerAdminMutation,
  useUpdateSellerAdminMutation,
  useDeleteSellerAdminMutation,
} = sellersApi;
