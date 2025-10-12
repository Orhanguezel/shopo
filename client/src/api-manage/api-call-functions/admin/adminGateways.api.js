// src/api-manage/api-call-functions/admin/adminGateways.api.js
import { api } from "@/api-manage/MainApi";

/**
 * Admin Gateways
 *  GET    payments/admin/gateways
 *  GET    payments/admin/gateways/:id
 *  POST   payments/admin/gateways
 *  PUT    payments/admin/gateways/:id
 *  DELETE payments/admin/gateways/:id
 *  POST   payments/admin/gateways/:id/test
 */
export const gatewaysAdminApi = api
  .enhanceEndpoints({ addTagTypes: ["Gateway", "GatewayList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /** List all gateways (optional filters: provider, isActive) */
      listGateways: build.query({
        query: (params = {}) => ({
          url: "payments/admin/gateways",
          params,
        }),
        transformResponse: (res) => res?.data ?? [],
        providesTags: (result) =>
          result?.length
            ? [
                ...result.map((g) => ({ type: "Gateway", id: g?._id })),
                { type: "GatewayList", id: "ADMIN" },
              ]
            : [{ type: "GatewayList", id: "ADMIN" }],
      }),

      /** Get single gateway */
      getGateway: build.query({
        query: (id) => ({ url: `payments/admin/gateways/${id}` }),
        transformResponse: (res) => res?.data,
        providesTags: (_r, _e, id) => [{ type: "Gateway", id }],
      }),

      /** Create gateway */
      createGateway: build.mutation({
        // body: { provider,isActive?,testMode?,credentials?,title?,allowedMethods? }
        query: (body) => ({
          url: "payments/admin/gateways",
          method: "POST",
          body,
        }),
        transformResponse: (res) => res?.data,
        invalidatesTags: [{ type: "GatewayList", id: "ADMIN" }],
      }),

      /** Update gateway */
      updateGateway: build.mutation({
        // args: { id, ...fields }
        query: ({ id, ...body }) => ({
          url: `payments/admin/gateways/${id}`,
          method: "PUT",
          body,
        }),
        transformResponse: (res) => res?.data,
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Gateway", id },
          { type: "GatewayList", id: "ADMIN" },
        ],
      }),

      /** Delete gateway */
      deleteGateway: build.mutation({
        query: (id) => ({
          url: `payments/admin/gateways/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: [{ type: "GatewayList", id: "ADMIN" }],
      }),

      /** Test gateway (checks minimal credentials) */
      testGateway: build.mutation({
        query: (id) => ({
          url: `payments/admin/gateways/${id}/test`,
          method: "POST",
        }),
        transformResponse: (res) => res?.data,
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListGatewaysQuery,
  useGetGatewayQuery,
  useCreateGatewayMutation,
  useUpdateGatewayMutation,
  useDeleteGatewayMutation,
  useTestGatewayMutation,
} = gatewaysAdminApi;
