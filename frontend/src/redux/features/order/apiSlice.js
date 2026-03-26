import apiRoutes from "@/appConfig/apiRoutes";
import { apiSlice } from "@/redux/api/apiSlice";

export const orderApis = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // track order
    trackOrderApi: builder.query({
      query: (data) => {
        return {
          url: `${apiRoutes.orderTrack}/${data.data}?token=${data.token}`,
          method: "GET",
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          info.success(data, meta.response.status);
        } catch (error) {
          console.log(error);
          info.error(error?.error);
        }
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // live track order
    liveTrackOrderApi: builder.query({
      query: (data) => {
        return {
          url: `${apiRoutes.liveTrackOrder}?token=${data.token}&order_id=${data.orderId}`,
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // apply coupon
    applyCouponApi: builder.query({
      query: (data) => {
        return {
          url: `${apiRoutes.applyCoupon}?token=${data.token}&coupon=${data.coupon}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useLazyTrackOrderApiQuery,
  useLazyLiveTrackOrderApiQuery,
  useLazyApplyCouponApiQuery,
} = orderApis;
