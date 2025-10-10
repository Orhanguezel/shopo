// client/api-manage/api-call-functions/admin/payments.gateways.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * Admin – Gateways
 *  GET  /payments/admin/gateways
 *  POST /payments/admin/gateways   (upsert)
 */
export const adminGatewaysApi = api
  .enhanceEndpoints({ addTagTypes: ["PaymentGateway"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /** List gateways */
      listGateways: build.query({
        query: (params = {}) => ({ url: R.admin.payments.$.custom("gateways"), params }),
        transformResponse: (res) => {
          const items = res?.data ?? (Array.isArray(res) ? res : []) ?? [];
          const total = res?.total ?? (Array.isArray(items) ? items.length : 0);
          return { items, total };
        },
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((g) => ({
                type: "PaymentGateway",
                id: g?._id || g?.id || g?.provider,
              })),
              { type: "PaymentGateway", id: "LIST" },
            ]
            : [{ type: "PaymentGateway", id: "LIST" }],
      }),

      /** Upsert gateway (create/update by provider) */
      upsertGateway: build.mutation({
        // data: { provider, isActive, testMode, credentials:{...} }
        query: (data) => ({
          url: R.admin.payments.$.custom("gateways"),
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "PaymentGateway", id: "LIST" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListGatewaysQuery,
  useUpsertGatewayMutation,
} = adminGatewaysApi;
