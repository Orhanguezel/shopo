import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * Public Payments:
 *  (LEGACY)  POST {public.payments}/checkout
 *  (LEGACY)  POST {public.payments}/capture
 *  (LEGACY)  POST {public.payments}/refund/provider
 *  (LEGACY)  POST {public.payments}/webhooks/:provider
 *
 *  (NEW)     POST {public.payments}/intents/checkout
 *  (NEW)     POST {public.payments}/intents/capture
 *  (NEW)     POST {public.payments}/intents/refund/provider
 *  (NEW)     POST {public.payments}/intents/webhooks/:provider
 *  (DEV)     POST {public.payments}/webhooks/:provider          (normalize payload)
 */
export const publicPaymentsApi = api
  .enhanceEndpoints({ addTagTypes: ["PaymentIntent", "Payment"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* ------------------ LEGACY ------------------ */

      /** Init intent by amount OR order (legacy path) */
      initIntentByAmount: build.mutation({
        // { data, idempotencyKey? }
        query: ({ data, idempotencyKey }) => ({
          url: R.public.payments.$.custom("checkout"),
          method: "POST",
          body: data,
          headers: idempotencyKey
            ? { "Idempotency-Key": idempotencyKey }
            : undefined,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "PaymentIntent", id: "LAST" }],
      }),

      /** Capture payment (legacy path) */
      capturePayment: build.mutation({
        query: (data) => ({
          url: R.public.payments.$.custom("capture"),
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "Payment", id: "LAST" }],
      }),

      /** Refund via provider (legacy path) */
      refundViaProvider: build.mutation({
        query: (data) => ({
          url: R.public.payments.$.custom("refund/provider"),
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "Payment", id: "LAST" }],
      }),

      /** Simulate webhook (legacy path) */
      simulateWebhook: build.mutation({
        query: ({ provider, event }) => ({
          url: R.public.payments.$.child("webhooks").custom(encodeURIComponent(provider)),
          method: "POST",
          body: event,
        }),
        transformResponse: pickData,
      }),

      /* ------------------ NEW intents/* ------------------ */

      /** Initialize Checkout Intent (amount/order) */
      initCheckoutIntent: build.mutation({
        // { data, idempotencyKey? }
        query: ({ data, idempotencyKey }) => ({
          url: R.public.payments.$.custom("intents/checkout"),
          method: "POST",
          body: data,
          headers: idempotencyKey
            ? { "Idempotency-Key": idempotencyKey }
            : undefined,
        }),
        transformResponse: pickData, // {intentId, providerRef, status, hostedUrl?, ...}
        invalidatesTags: [{ type: "PaymentIntent", id: "LAST" }],
      }),

      /** Capture (intents) */
      captureCheckoutIntent: build.mutation({
        // { provider, providerRef, amount? }
        query: (data) => ({
          url: R.public.payments.$.custom("intents/capture"),
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "Payment", id: "LAST" }],
      }),

      /** Refund via provider (intents) */
      refundCheckoutIntentProvider: build.mutation({
        // { provider, providerRef, amount?, reason? }
        query: (data) => ({
          url: R.public.payments.$.custom("intents/refund/provider"),
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "Payment", id: "LAST" }],
      }),

      /** Webhook (intents/*) – gerçek sağlayıcı payload */
      simulateIntentWebhook: build.mutation({
        // { provider, event }
        query: ({ provider, event }) => ({
          url: R.public.payments.$
            .child("intents/webhooks")
            .custom(encodeURIComponent(provider)),
          method: "POST",
          body: event,
        }),
        transformResponse: pickData,
      }),

      /** Webhook (dev normalized payload) */
      simulateDevWebhook: build.mutation({
        // { provider, event }
        query: ({ provider, event }) => ({
          url: R.public.payments.$
            .child("webhooks")
            .custom(encodeURIComponent(provider)),
          method: "POST",
          body: event,
        }),
        transformResponse: pickData,
      }),
    }),
    overrideExisting: true,
  });

export const {
  /* legacy */
  useInitIntentByAmountMutation,
  useCapturePaymentMutation,
  useRefundViaProviderMutation,
  useSimulateWebhookMutation,
  /* new intents */
  useInitCheckoutIntentMutation,
  useCaptureCheckoutIntentMutation,
  useRefundCheckoutIntentProviderMutation,
  useSimulateIntentWebhookMutation,
  useSimulateDevWebhookMutation,
} = publicPaymentsApi;
