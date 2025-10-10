// client/api-manage/api-call-functions/admin/payments.webhooks.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData, shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * Admin Webhooks
 *  POST   /payments/admin/webhooks/endpoints
 *  GET    /payments/admin/webhooks/endpoints
 *  GET    /payments/admin/webhooks/endpoints/:id
 *  PUT    /payments/admin/webhooks/endpoints/:id
 *  DELETE /payments/admin/webhooks/endpoints/:id
 *  POST   /payments/admin/webhooks/test
 *  GET    /payments/admin/webhooks/deliveries
 *  GET    /payments/admin/webhooks/deliveries/:id
 *  POST   /payments/admin/webhooks/deliveries/:id/retry
 */
export const adminWebhooksApi = api
  .enhanceEndpoints({ addTagTypes: ["WebhookEndpoint", "WebhookDelivery"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /** Create endpoint */
      createWebhookEndpoint: build.mutation({
        query: (data) => ({
          url: R.admin.payments.$.custom("webhooks/endpoints"),
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "WebhookEndpoint", id: "LIST" }],
      }),

      /** List endpoints */
      listWebhookEndpoints: build.query({
        query: (params = {}) => ({
          url: R.admin.payments.$.custom("webhooks/endpoints"),
          params,
        }),
        transformResponse: (res) => {
          const items = res?.data ?? (Array.isArray(res) ? res : []) ?? [];
          const total = res?.total ?? (Array.isArray(items) ? items.length : 0);
          return { items, total };
        },
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((e) => ({ type: "WebhookEndpoint", id: e?._id || e?.id })),
              { type: "WebhookEndpoint", id: "LIST" },
            ]
            : [{ type: "WebhookEndpoint", id: "LIST" }],
      }),

      /** Get endpoint */
      getWebhookEndpoint: build.query({
        query: (id) => ({ url: R.admin.payments.$.custom(`webhooks/endpoints/${id}`) }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "WebhookEndpoint", id }],
      }),

      /** Update endpoint */
      updateWebhookEndpoint: build.mutation({
        query: ({ id, data }) => ({
          url: R.admin.payments.$.custom(`webhooks/endpoints/${id}`),
          method: "PUT",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, { id }) => [{ type: "WebhookEndpoint", id }, { type: "WebhookEndpoint", id: "LIST" }],
      }),

      /** Delete endpoint */
      deleteWebhookEndpoint: build.mutation({
        query: (id) => ({
          url: R.admin.payments.$.custom(`webhooks/endpoints/${id}`),
          method: "DELETE",
        }),
        invalidatesTags: (_r, _e, id) => [{ type: "WebhookEndpoint", id }, { type: "WebhookEndpoint", id: "LIST" }],
      }),

      /** Send test event */
      sendTestEvent: build.mutation({
        query: (data) => ({
          url: R.admin.payments.$.custom("webhooks/test"),
          method: "POST",
          body: data,
        }),
        transformResponse: pickData, // -> { deliveryId, ... }
        invalidatesTags: [{ type: "WebhookDelivery", id: "LIST" }],
      }),

      /** List deliveries */
      listDeliveries: build.query({
        query: (params = {}) => ({
          url: R.admin.payments.$.custom("webhooks/deliveries"),
          params,
        }),
        transformResponse: shapeList, // -> { items, total, meta? }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((d) => ({ type: "WebhookDelivery", id: d?._id || d?.id })),
              { type: "WebhookDelivery", id: "LIST" },
            ]
            : [{ type: "WebhookDelivery", id: "LIST" }],
      }),

      /** Get delivery by id */
      getDelivery: build.query({
        query: ({ id, includePayload }) => ({
          url: R.admin.payments.$.custom(`webhooks/deliveries/${id}`),
          params: includePayload ? { includePayload } : undefined,
        }),
        transformResponse: pickData,
        providesTags: (_r, _e, { id }) => [{ type: "WebhookDelivery", id }],
      }),

      /** Retry delivery */
      retryDelivery: build.mutation({
        query: (id) => ({
          url: R.admin.payments.$.custom(`webhooks/deliveries/${id}/retry`),
          method: "POST",
        }),
        invalidatesTags: (_r, _e, id) => [{ type: "WebhookDelivery", id }, { type: "WebhookDelivery", id: "LIST" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useCreateWebhookEndpointMutation,
  useListWebhookEndpointsQuery,
  useGetWebhookEndpointQuery,
  useUpdateWebhookEndpointMutation,
  useDeleteWebhookEndpointMutation,
  useSendTestEventMutation,
  useListDeliveriesQuery,
  useGetDeliveryQuery,
  useRetryDeliveryMutation,
} = adminWebhooksApi;
