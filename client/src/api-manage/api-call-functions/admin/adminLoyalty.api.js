// client/api-manage/api-call-functions/admin/loyalty.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";

export const loyaltyAdminApi = api
  .enhanceEndpoints({ addTagTypes: ["LoyaltyAdminList", "LoyaltyAdminBalance"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST – GET /loyalty/admin */
      adminListLoyalty: build.query({
        // params: { user?, reason?, from?, to?, page?, limit? }
        query: (params = {}) => ({
          url: R.admin.loyalty.list(),
          params,
        }),
        transformResponse: (res) => ({
          items: Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [],
          meta: res?.meta || { page: 1, limit: 20, total: 0 },
        }),
        providesTags: (result) => {
          const items = result?.items || [];
          return [
            { type: "LoyaltyAdminList", id: "LIST" },
            ...items.map((x) => ({ type: "LoyaltyAdminList", id: x._id || x.id })),
          ];
        },
      }),

      /* GET BY ID – GET /loyalty/admin/:id */
      adminGetLoyaltyById: build.query({
        query: (id) => ({ url: R.admin.loyalty.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_res, _err, id) => [{ type: "LoyaltyAdminList", id }],
      }),

      /* ADJUST – POST /loyalty/admin/adjust */
      adminAdjustLoyalty: build.mutation({
        // body: { user, points, reason?, order?, expiresAt? }
        query: (body) => ({
          url: R.admin.loyalty.$.custom("adjust"),
          method: "POST",
          body,
        }),
        invalidatesTags: (_res, _err, body) =>
          [
            { type: "LoyaltyAdminList", id: "LIST" },
            body?.user ? { type: "LoyaltyAdminBalance", id: String(body.user) } : null,
          ].filter(Boolean),
      }),

      /* SPEND – POST /loyalty/admin/users/:userId/spend */
      adminSpendPoints: build.mutation({
        // arg: { userId, amount, reason?, order? }
        query: ({ userId, ...body }) => ({
          url: R.admin.loyalty.$.custom(`users/${userId}/spend`),
          method: "POST",
          body,
        }),
        transformResponse: (res) => res?.data ?? res,
        invalidatesTags: (_res, _err, arg) => [
          { type: "LoyaltyAdminList", id: "LIST" },
          { type: "LoyaltyAdminBalance", id: String(arg.userId) },
        ],
      }),

      /* USER BALANCE – GET /loyalty/admin/users/:userId/balance?at=... */
      adminGetUserBalance: build.query({
        query: ({ userId, at } = {}) => ({
          url: R.admin.loyalty.$.custom(`users/${userId}/balance`),
          params: { at },
        }),
        transformResponse: (res) =>
          res?.data || { balance: 0, totalEarned: 0, totalSpent: 0 },
        providesTags: (_res, _err, arg) => [
          { type: "LoyaltyAdminBalance", id: String(arg.userId) },
        ],
      }),

      /* DELETE – DELETE /loyalty/admin/:id */
      adminDeleteLoyalty: build.mutation({
        query: (id) => ({ url: R.admin.loyalty.remove(id), method: "DELETE" }),
        invalidatesTags: [{ type: "LoyaltyAdminList", id: "LIST" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useAdminListLoyaltyQuery,
  useAdminGetLoyaltyByIdQuery,
  useAdminAdjustLoyaltyMutation,
  useAdminSpendPointsMutation,
  useAdminGetUserBalanceQuery,
  useAdminDeleteLoyaltyMutation,
} = loyaltyAdminApi;
