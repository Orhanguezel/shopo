import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";

/**
 * Public Variant endpoints
 *  - By Product : GET  {public.variants}/by-product/:productId?onlyActive=&limit=
 *  - Resolve    : POST {public.variants}/resolve   { product, options }
 *  - Get by SKU : GET  {public.variants}/sku/:sku
 */
export const publicVariantsApi = api
  .enhanceEndpoints({ addTagTypes: ["Variant", "VariantList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /** By Product */
      listVariantsByProduct: build.query({
        query: ({ productId, onlyActive = true, limit = 200 }) => ({
          url: R.public.variants.$.custom(`by-product/${productId}`),
          params: { onlyActive, limit },
        }),
        transformResponse: (res) => res?.data ?? res ?? [],
        providesTags: (result, _err, { productId }) =>
          Array.isArray(result) && result.length
            ? [
              ...result.map((v) => ({ type: "Variant", id: v?.id || v?._id })),
              { type: "VariantList", id: `PRODUCT:${productId}` },
            ]
            : [{ type: "VariantList", id: `PRODUCT:${productId}` }],
      }),

      /** Resolve */
      resolveVariant: build.mutation({
        query: (payload) => ({
          url: R.public.variants.$.custom("resolve"),
          method: "POST",
          body: payload,
        }),
        transformResponse: (res) => res?.data ?? res,
      }),

      /** By SKU */
      getVariantBySku: build.query({
        query: (sku) => ({
          url: R.public.variants.$.custom(`sku/${encodeURIComponent(sku)}`),
        }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (result) =>
          result?._id || result?.id
            ? [{ type: "Variant", id: result._id || result.id }]
            : [],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListVariantsByProductQuery,
  useResolveVariantMutation,
  useGetVariantBySkuQuery,
} = publicVariantsApi;
