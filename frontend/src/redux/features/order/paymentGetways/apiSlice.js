import apiRoutes from "@/appConfig/apiRoutes";
import { apiSlice } from "@/redux/api/apiSlice";

export const paymentGetwaysApis = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // cash on delivery for user
    cashOnDeliveryApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.cashOnDelivery}?token=${data.token}`,
          method: "POST",
          body: data.data,
        };
      },
    }),
    // cash on delivery for guest
    cashOnDeliveryGuestApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.cashOnDeliveryGuest}`,
          method: "POST",
          body: data.data,
        };
      },
    }),
    // bank payment for user
    bankPaymentApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.bankPayment}?token=${data.token}`,
          method: "POST",
          body: data.data,
        };
      },
    }),
    // bank payment for guest
    bankPaymentGuestApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.bankPaymentGuest}`,
          method: "POST",
          body: data.data,
        };
      },
    }),
    // stripe pay for user
    stripePayApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.stripePay}?token=${data.token}`,
          method: "POST",
          body: data.data,
        };
      },
    }),
    // stripe pay for guest
    stripePayGuestApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.stripePayGuest}`,
          method: "POST",
          body: data.data,
        };
      },
    }),
    // razorpay order for user
    razorpayOrderApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.razorpayOrder}?token=${data.token}`,
          method: "POST",
          body: data.data,
        };
      },
    }),
    // razorpay order for guest
    razorpayOrderGuestApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.razorpayOrderGuest}`,
          method: "POST",
          body: data.data,
        };
      },
    }),
    // draft order for user
    draftOrderApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.draftOrder}?token=${data.token}`,
          method: "POST",
          body: data.data,
        };
      },
    }),
    // draft order for guest
    draftOrderGuestApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.draftOrderGuest}`,
          method: "POST",
          body: data.data,
        };
      },
    }),
  }),
});

export const {
  useBankPaymentApiMutation,
  useBankPaymentGuestApiMutation,
  useCashOnDeliveryApiMutation,
  useCashOnDeliveryGuestApiMutation,
  useDraftOrderApiMutation,
  useDraftOrderGuestApiMutation,
  useStripePayApiMutation,
  useStripePayGuestApiMutation,
  useRazorpayOrderApiMutation,
  useRazorpayOrderGuestApiMutation,
} = paymentGetwaysApis;
