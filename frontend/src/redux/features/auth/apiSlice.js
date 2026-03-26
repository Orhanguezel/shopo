import apiRoutes from "@/appConfig/apiRoutes";
import { apiSlice } from "@/redux/api/apiSlice";
import { toast } from "react-toastify";

export const authApis = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    userSignupApi: builder.mutation({
      query: (data) => {
        return {
          url: apiRoutes.signup,
          method: "POST",
          body: data,
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          info.success(data, meta.response.status);
        } catch (error) {
          info.error(error?.error);
        }
      },
    }),
    userLoginApi: builder.mutation({
      query: (data) => {
        // data: email, password
        return {
          url: apiRoutes.login,
          method: "POST",
          body: data,
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 200 || meta.response.status === 201) {
            info.success(data);
          }
        } catch (error) {
          console.log(error);
          info.error(error?.error);
        }
      },
    }),
    logoutApi: builder.query({
      query: (data) => {
        return {
          url: `${apiRoutes.logout}?token=${data.token}`,
          method: "GET",
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          info.success(data, meta.response.status);
        } catch (error) {
          console.log(error);
        }
      },
    }),
    resendRegisterCodeApi: builder.mutation({
      query: (data) => {
        return {
          url: apiRoutes.resendCode,
          method: "POST",
          body: data,
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { meta } = await queryFulfilled;
          // statusCode
          const statusCode = meta.response.status;
          info.success(statusCode);
        } catch (error) {
          console.log(error);
          toast.error(error?.error?.data?.message);
        }
      },
    }),
    userVerifyApi: builder.query({
      query: (data) => {
        return {
          url: `${apiRoutes.verification}/${data.otp}?email=${data.email}`,
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
    }),
    userForgotApi: builder.mutation({
      query: (data) => {
        return {
          url: apiRoutes.forgotPassword,
          method: "POST",
          body: data,
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
    }),
    userResetApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.resetPassword}/${data.otp}`,
          method: "POST",
          body: data,
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
    }),
    updatePasswordApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.updatePassword}?token=${data.token}`,
          method: "POST",
          body: data.data,
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
    }),
    dashboardApi: builder.query({
      query: (data) => {
        return {
          url: `${apiRoutes.dashboard}?token=${data.token}`,
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
    orderListApi: builder.query({
      query: (data) => {
        return {
          url: `${apiRoutes.orders}?token=${data.token}`,
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
    reviewListApi: builder.query({
      query: (data) => {
        return {
          url: `${apiRoutes.getReview}?token=${data.token}`,
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
    profileInfoApi: builder.query({
      query: (data) => {
        return {
          url: `${apiRoutes.profileInfo}?token=${data.token}`,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    deleteUserApi: builder.mutation({
      query: (data) => {
        return {
          url: `${apiRoutes.deleteUser}?token=${data.token}`,
          method: "DELETE",
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          info.success(data, meta.response.status);
        } catch (error) {
          console.log(error);
        }
      },
    }),
    updateProfileApi: builder.mutation({
      query: (data) => {
        const formData = new FormData();
        for (const key in data.data) {
          if (data.data[key] !== undefined && data.data[key] !== null) {
            formData.append(key, data.data[key]);
          }
        }
        // ignore viewImage from payload
        formData.append("viewImage", undefined);
        return {
          url: `${apiRoutes.updateProfile}?token=${data.token}`,
          method: "POST",
          body: formData,
          formData: true,
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          info.success(data, meta.response.status);
          dispatch(
            apiSlice.util.updateQueryData(
              "profileInfoApi",
              undefined,
              (draft) => {
                const newData = info.data;
                const oldData = JSON.parse(JSON.stringify(draft));
                const updateData = {
                  ...oldData,
                  personInfo: {
                    ...oldData?.personInfo,
                    city_id: newData?.city,
                    country_id: newData?.country,
                    state_id: newData?.state,
                    viewImage: newData?.viewImage,
                  },
                };
                return (draft = updateData);
              }
            )
          );
        } catch (error) {
          console.log(error);
          info.error(error?.error);
        }
      },
    }),
    sellerRequestApi: builder.mutation({
      query: (data) => {
        const formData = new FormData();
        for (const key in data.data) {
          if (data.data[key] !== undefined && data.data[key] !== null) {
            formData.append(key, data.data[key]);
          }
        }
        return {
          url: `${apiRoutes.sellerRequest}?token=${data.token}`,
          method: "POST",
          body: formData,
          formData: true,
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
    }),
  }),
});

export const {
  useUserLoginApiMutation,
  useResendRegisterCodeApiMutation,
  useUserSignupApiMutation,
  useLazyUserVerifyApiQuery,
  useUserForgotApiMutation,
  useUserResetApiMutation,
  useDashboardApiQuery,
  useOrderListApiQuery,
  useReviewListApiQuery,
  useProfileInfoApiQuery,
  useLazyLogoutApiQuery,
  useDeleteUserApiMutation,
  useUpdateProfileApiMutation,
  useUpdatePasswordApiMutation,
  useSellerRequestApiMutation,
} = authApis;
