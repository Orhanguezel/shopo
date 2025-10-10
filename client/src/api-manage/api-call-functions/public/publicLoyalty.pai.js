import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";

/**
 * PUBLIC – Loyalty (me)
 *  - BALANCE : GET {public.loyalty}/balance   ?at=...
 *  - LEDGER  : GET {public.loyalty}/ledger    ?from&to&page&limit
 */
export const loyaltyPublicApi = api
  .enhanceEndpoints({ addTagTypes: ["LoyaltyMe", "LoyaltyMeBalance"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* MY BALANCE */
      getMyLoyaltyBalance: build.query({
        query: (params = {}) => ({
          url: R.public.loyalty.$.custom("balance"),
          params,
        }),
        transformResponse: (res) =>
          res?.data || { balance: 0, totalEarned: 0, totalSpent: 0 },
        providesTags: [{ type: "LoyaltyMeBalance", id: "ME" }],
      }),

      /* MY LEDGER */
      getMyLoyaltyLedger: build.query({
        query: (params = {}) => ({
          url: R.public.loyalty.$.custom("ledger"),
          params,
        }),
        transformResponse: (res) => ({
          items: Array.isArray(res?.data) ? res.data : [],
          meta: res?.meta || { page: 1, limit: 20, total: 0 },
        }),
        providesTags: (result) => {
          const items = result?.items || [];
          return [
            { type: "LoyaltyMe", id: "LIST" },
            ...items.map((x) => ({ type: "LoyaltyMe", id: x._id })),
          ];
        },
      }),
    }),
    overrideExisting: true,
  });

export const {
  useGetMyLoyaltyBalanceQuery,
  useGetMyLoyaltyLedgerQuery,
} = loyaltyPublicApi;
