import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes";

// NOT: MainApi.tagTypes => ["User", "IDENTITIES", ...]
// fetchBaseQuery({ credentials: 'include' }) zaten MainApi'de aktif olmalı.

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({

    /* ====================== SESSION ====================== */
    me: build.query({
      query: () => ({ url: R.users.account.me() }),
      transformResponse: (res) => res?.data ?? res?.user ?? res ?? null,
      providesTags: [{ type: "User", id: "ME" }],
    }),
    meAuthLite: build.query({
      query: () => ({ url: R.authlite.me() }),
      transformResponse: (res) => res?.data ?? res ?? null,
      providesTags: [{ type: "User", id: "ME" }],
    }),
    logout: build.mutation({
      query: () => ({ url: R.users.logout(), method: "POST" }),
      invalidatesTags: [{ type: "User", id: "ME" }, { type: "IDENTITIES", id: "LIST" }],
    }),
    authliteLogout: build.mutation({
      query: () => ({ url: R.authlite.logout(), method: "POST" }),
      invalidatesTags: [{ type: "User", id: "ME" }, { type: "IDENTITIES", id: "LIST" }],
    }),

    /* ====================== USERS (classic) ====================== */
    registerUser: build.mutation({
      query: ({ name, email, password }) => ({
        url: R.users.register(),
        method: "POST",
        body: { name, email, password },
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    loginUser: build.mutation({
      query: ({ email, password }) => ({
        url: R.users.login(),
        method: "POST",
        body: { email, password },
      }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    changePasswordUser: build.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: R.users.changePassword(),
        method: "POST",
        body: { currentPassword, newPassword },
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    forgotPasswordUser: build.mutation({
      query: ({ email }) => ({
        url: R.users.forgotPassword(),
        method: "POST",
        body: { email },
      }),
    }),
    resetPasswordByToken: build.mutation({
      query: ({ token, newPassword }) => ({
        url: R.users.resetByToken(token),
        method: "POST",
        body: { newPassword },
      }),
    }),

    /* ============ USERS / ACCOUNT ============ */
    accountUpdate: build.mutation({
      query: (payload) => ({
        url: R.users.account.update(),
        method: "PUT",
        body: payload,
      }),
      transformResponse: (res) => res?.data ?? res?.user ?? res ?? null,
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    accountPassword: build.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: R.users.account.password(),
        method: "PUT",
        body: { currentPassword, newPassword },
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    accountNotifications: build.mutation({
      query: ({ emailNotifications, smsNotifications }) => ({
        url: R.users.account.notifications(),
        method: "PATCH",
        body: { emailNotifications, smsNotifications },
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    accountSocial: build.mutation({
      query: ({ facebook, instagram, twitter }) => ({
        url: R.users.account.social(),
        method: "PATCH",
        body: { facebook, instagram, twitter },
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    accountUploadProfileImage: build.mutation({
      query: ({ file }) => {
        const fd = new FormData();
        fd.append("avatar", file); // backend 'avatar' bekliyor
        return {
          url: R.users.account.profileImage(),
          method: "PUT", // backend POST istiyorsa 'POST'
          body: fd,
        };
      },
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    accountRemoveProfileImage: build.mutation({
      query: () => ({ url: R.users.account.profileImage(), method: "DELETE" }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    accountFullProfile: build.mutation({
      query: (payload) => ({ url: R.users.account.fullProfile(), method: "PUT", body: payload }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    accountDelete: build.mutation({
      query: ({ password }) => ({ url: R.users.account.delete(), method: "DELETE", body: { password } }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    /* ====================== ADVANCED AUTH ====================== */
    sendVerification: build.mutation({
      query: () => ({ url: R.users.advancedAuth.sendVerification(), method: "POST" }),
    }),
    verifyEmail: build.mutation({
      query: ({ code }) => ({ url: R.users.advancedAuth.verifyEmail(), method: "POST", body: { code } }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    sendOtp: build.mutation({
      query: ({ channel, destination }) => ({
        url: R.users.advancedAuth.sendOtp(),
        method: "POST",
        body: { channel, destination },
      }),
    }),
    verifyOtp: build.mutation({
      query: ({ code }) => ({ url: R.users.advancedAuth.verifyOtp(), method: "POST", body: { code } }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    resendOtp: build.mutation({
      query: () => ({ url: R.users.advancedAuth.resendOtp(), method: "POST" }),
    }),
    enableMfa: build.mutation({
      query: ({ secret, method }) => ({
        url: R.users.advancedAuth.enableMfa(),
        method: "POST",
        body: { secret, method },
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    verifyMfa: build.mutation({
      query: ({ code }) => ({ url: R.users.advancedAuth.verifyMfa(), method: "POST", body: { code } }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    /* ====================== AUTHLITE ====================== */
    registerWithEmail: build.mutation({
      query: ({ email, password, name }) => ({
        url: R.authlite.registerEmail(),
        method: "POST",
        body: { email, password, name },
      }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    loginWithEmail: build.mutation({
      query: ({ email, password }) => ({
        url: R.authlite.loginEmail(),
        method: "POST",
        body: { email, password },
      }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    loginWithGoogle: build.mutation({
      query: ({ idToken }) => ({ url: R.authlite.loginGoogle(), method: "POST", body: { idToken } }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    loginWithFacebook: build.mutation({
      query: ({ accessToken }) => ({ url: R.authlite.loginFacebook(), method: "POST", body: { accessToken } }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    forgotPassword: build.mutation({
      query: ({ email }) => ({ url: R.authlite.forgotPassword(), method: "POST", body: { email } }),
    }),
    resetPassword: build.mutation({
      query: ({ email, code, token, newPassword }) => ({
        url: R.authlite.resetPassword(),
        method: "POST",
        body: { email, code, token, newPassword },
      }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    changePassword: build.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: R.authlite.changePassword(),
        method: "POST",
        body: { currentPassword, newPassword },
      }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    changeEmailStart: build.mutation({
      query: ({ currentPassword, newEmail }) => ({
        url: R.authlite.changeEmailStart(),
        method: "POST",
        body: { currentPassword, newEmail },
      }),
    }),
    changeEmailConfirm: build.mutation({
      query: ({ newEmail, code, token }) => ({
        url: R.authlite.changeEmailConfirm(),
        method: "POST",
        body: { newEmail, code, token },
      }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    updateProfileLite: build.mutation({
      query: (body) => ({ url: R.authlite.updateProfile(), method: "PATCH", body }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    // identities
    listIdentities: build.query({
      query: () => ({ url: R.authlite.identities() }),
      transformResponse: (res) => {
        const providers = res?.data?.providers ?? res?.data ?? res?.providers;
        return providers
          ? { providers }
          : { providers: { local: false, google: false, facebook: false } };
      },
      providesTags: [{ type: "IDENTITIES", id: "LIST" }],
    }),
    unlinkIdentity: build.mutation({
      query: ({ provider }) => ({ url: R.authlite.unlinkIdentity(provider), method: "DELETE" }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "IDENTITIES", id: "LIST" }],
    }),
    linkGoogle: build.mutation({
      query: ({ idToken }) => ({ url: R.authlite.linkGoogle(), method: "POST", body: { idToken } }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "IDENTITIES", id: "LIST" }],
    }),
    linkFacebook: build.mutation({
      query: ({ accessToken }) => ({ url: R.authlite.linkFacebook(), method: "POST", body: { accessToken } }),
      transformResponse: (res) => res?.data ?? res ?? null,
      invalidatesTags: [{ type: "IDENTITIES", id: "LIST" }],
    }),

    // dev peeks
    devPeekReset: build.query({
      query: ({ email }) => ({ url: R.authlite.devPeekReset(), params: { email } }),
      transformResponse: (res) => res?.data ?? res ?? null,
    }),
    devPeekEmailChange: build.query({
      query: ({ newEmail }) => ({ url: R.authlite.devPeekEmailChange(), params: { newEmail } }),
      transformResponse: (res) => res?.data ?? res ?? null,
    }),

  }),
  overrideExisting: true,
});

export const {
  // session
  useMeQuery,
  useMeAuthLiteQuery,
  useLogoutMutation,
  useAuthliteLogoutMutation,

  // users (classic)
  useRegisterUserMutation,
  useLoginUserMutation,
  useChangePasswordUserMutation,
  useForgotPasswordUserMutation,
  useResetPasswordByTokenMutation,

  // account
  useAccountUpdateMutation,
  useAccountPasswordMutation,
  useAccountNotificationsMutation,
  useAccountSocialMutation,
  useAccountUploadProfileImageMutation,
  useAccountRemoveProfileImageMutation,
  useAccountFullProfileMutation,
  useAccountDeleteMutation,

  // advanced-auth
  useSendVerificationMutation,
  useVerifyEmailMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useEnableMfaMutation,
  useVerifyMfaMutation,

  // authlite
  useRegisterWithEmailMutation,
  useLoginWithEmailMutation,
  useLoginWithGoogleMutation,
  useLoginWithFacebookMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useChangeEmailStartMutation,
  useChangeEmailConfirmMutation,
  useUpdateProfileLiteMutation,

  // identities
  useListIdentitiesQuery,
  useUnlinkIdentityMutation,
  useLinkGoogleMutation,
  useLinkFacebookMutation,

  // dev peeks
  useDevPeekResetQuery,
  useDevPeekEmailChangeQuery,
} = authApi;
