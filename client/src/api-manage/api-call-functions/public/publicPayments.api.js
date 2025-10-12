// src/api-manage/api-call-functions/public/publicPayments.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * Public Payments:
 *  (NEW)     POST {public.payments}/intents/checkout
 *  (NEW)     POST {public.payments}/intents/capture
 *  (NEW)     POST {public.payments}/intents/refund/provider
 *  (NEW)     POST {public.payments}/intents/webhooks/:provider
 *
 *  (LEGACY alias) fonksiyon adları korunur ama aynı intents/* uçlarına post eder.
 */
export const publicPaymentsApi = api
  .enhanceEndpoints({ addTagTypes: ["PaymentIntent", "Payment"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* ------------------ LEGACY (alias) ------------------ */

      /** (alias) Init intent by amount/order – intents/checkout’a yollar */
      initIntentByAmount: build.mutation({
        // { data, idempotencyKey? }
        query: ({ data, idempotencyKey }) => ({
          url: R.public.payments.$.custom("intents/checkout"), // <-- DÜZELTİLDİ
          method: "POST",
          body: data,
          headers: idempotencyKey
            ? { "Idempotency-Key": idempotencyKey }
            : undefined,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "PaymentIntent", id: "LAST" }],
      }),

      /** (alias) Capture – intents/capture */
      capturePayment: build.mutation({
        query: (data) => ({
          url: R.public.payments.$.custom("intents/capture"), // <-- DÜZELTİLDİ
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "Payment", id: "LAST" }],
      }),

      /** (alias) Refund via provider – intents/refund/provider */
      refundViaProvider: build.mutation({
        query: (data) => ({
          url: R.public.payments.$.custom("intents/refund/provider"), // <-- DÜZELTİLDİ
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "Payment", id: "LAST" }],
      }),

      /** (alias) Webhook simulate – intents/webhooks/:provider */
      simulateWebhook: build.mutation({
        query: ({ provider, event }) => ({
          url: R.public.payments.$
            .child("intents/webhooks") // <-- DÜZELTİLDİ
            .custom(encodeURIComponent(provider)),
          method: "POST",
          body: event,
        }),
        transformResponse: pickData,
      }),

      /* ------------------ NEW intents/* ------------------ */

      /** Initialize Checkout Intent (amount/order) */
      initCheckoutIntent: build.mutation({
        query: ({ data, idempotencyKey }) => ({
          url: R.public.payments.$.custom("intents/checkout"),
          method: "POST",
          body: data,
          headers: idempotencyKey
            ? { "Idempotency-Key": idempotencyKey }
            : undefined,
        }),
        transformResponse: pickData, // -> {intentId, providerRef, status, hostedUrl?, clientSecret? ...}
        invalidatesTags: [{ type: "PaymentIntent", id: "LAST" }],
      }),

      /** Capture (intents) */
      captureCheckoutIntent: build.mutation({
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
        query: (data) => ({
          url: R.public.payments.$.custom("intents/refund/provider"),
          method: "POST",
          body: data,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "Payment", id: "LAST" }],
      }),

      /** Webhook (intents/*) – gerçek sağlayıcı payload */
      useSimulateIntentWebhook: build.mutation({
        query: ({ provider, event }) => ({
          url: R.public.payments.$
            .child("intents/webhooks")
            .custom(encodeURIComponent(provider)),
          method: "POST",
          body: event,
        }),
        transformResponse: pickData,
      }),

      /** Webhook (dev normalized) – aynı route */
      simulateDevWebhook: build.mutation({
        query: ({ provider, event }) => ({
          url: R.public.payments.$
            .child("intents/webhooks") // <-- DÜZELTİLDİ
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
  /* legacy aliases (artık intents/*’e post ediyor) */
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
