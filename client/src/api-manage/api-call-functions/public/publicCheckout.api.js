// client/api-manage/api-call-functions/public/checkout.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * Checkout (calc + create/override)
 * - POST /payments/checkout/calc
 * - POST /payments/checkout
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

      /** Checkout oluştur (shipping override / hosted intent dahil) */
      createCheckout: build.mutation({
        query: ({ data, idempotencyKey } = {}) => ({
          url: R.public.payments.$.custom("checkout"),
          method: "POST",
          body: data,
          headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
        }),
        transformResponse: pickData, // -> { summary, payment?{hostedUrl,intentId,status,...} }
        invalidatesTags: [{ type: "Checkout", id: "LAST" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useCalculateCheckoutTotalsMutation,
  useCreateCheckoutMutation,
} = checkoutApi;
