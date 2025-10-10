import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";

/**
 * PUBLIC – Fees
 *  - LIST : GET {public.fees}         ?currency=&mode=&when=&limit=
 *  - GET  : GET {public.fees}/:code   (aktif olanı döner)
 */
export const publicFeesApi = api
  .enhanceEndpoints({ addTagTypes: ["Fee", "FeeList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST (active only + filters) */
      listPublicFees: build.query({
        query: (params = {}) => ({ url: R.public.fees.list(), params }),
        transformResponse: (res) => {
          const items = res?.data ?? (Array.isArray(res) ? res : []) ?? [];
          const total =
            res?.total ??
            res?.meta?.total ??
            (Array.isArray(items) ? items.length : 0);
          return { items, total };
        },
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((f) => ({
                type: "Fee",
                id: f?._id || f?.id || f?.code,
              })),
              { type: "FeeList", id: "PUBLIC" },
            ]
            : [{ type: "FeeList", id: "PUBLIC" }],
      }),

      /* GET BY CODE (active only) */
      getPublicFeeByCode: build.query({
        query: (code) => ({ url: R.public.fees.get(code) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (result) =>
          result?.code ? [{ type: "Fee", id: result._id || result.code }] : [],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListPublicFeesQuery,
  useGetPublicFeeByCodeQuery,
} = publicFeesApi;
