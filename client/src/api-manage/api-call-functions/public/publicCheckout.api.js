// src/api-manage/api-call-functions/public/publicCheckout.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * Checkout (calc)
 * - POST /payments/checkout/calc
 */
export const checkoutApi = api
  .enhanceEndpoints({ addTagTypes: ["Checkout", "CheckoutCalc"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /** Totalleri hesapla (+opsiyonel intent oluştur) */
      calculateCheckoutTotals: build.mutation({
        query: ({ data, idempotencyKey } = {}) => ({
          url: R.public.payments.$.custom("checkout/calc"),
          method: "POST",
          body: data,
          headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
        }),
        transformResponse: pickData, // -> { summary, payment? }
        invalidatesTags: [{ type: "CheckoutCalc", id: "LAST" }],
      }),

      /** (alias) createCheckout -> şu an calc ile aynı endpoint */
      createCheckout: build.mutation({
        query: ({ data, idempotencyKey } = {}) => ({
          url: R.public.payments.$.custom("checkout/calc"), // <-- DÜZELTİLDİ
          method: "POST",
          body: data,
          headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
        }),
        transformResponse: pickData,
        invalidatesTags: [{ type: "Checkout", id: "LAST" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useCalculateCheckoutTotalsMutation,
  useCreateCheckoutMutation, // alias, calc’ı çağırır
} = checkoutApi;
