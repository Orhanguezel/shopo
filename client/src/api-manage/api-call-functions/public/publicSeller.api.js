// src/api-manage/api-call-functions/public/publicSeller.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList, pickData } from "@/api-manage/another-formated-api/shapeList";

/* helpers */
const pathOf = (v, ...args) => (typeof v === "function" ? v(...args) : v);
const isBlank = (v) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const stripEmptyDeep = (obj) => {
  if (obj == null || typeof obj !== "object") return obj;
  const out = Array.isArray(obj) ? [] : {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v && typeof v === "object") {
      const nested = stripEmptyDeep(v);
      if (!isBlank(nested) && (typeof nested !== "object" || Object.keys(nested).length)) {
        out[k] = nested;
      }
    } else if (!isBlank(v)) {
      out[k] = typeof v === "string" ? v.trim() : v;
    }
  });
  return out;
};

/* routes (fallback'lı) */
const DEFAULTS = {
  list: () => "/sellers",
  get:  (id) => `/sellers/${id}`,
  me:   () => "/sellers/me", // GET için
  apply: () => "/sellers/apply",
  registerEmail: () => "/sellers/register-email",
  uploads: {
    // Avatar seller’a değil account modülüne gider (PUT, field: "avatar")
    avatar: () => "/account/me/profile-image",
    // Logo seller modülünde (POST, field: "file")
    logo:   () => "/sellers/me/logo",
    // cover için ayrı public endpoint BE’de yok; gerekirse sonradan ekleriz
    cover:  () => "/sellers/me/cover",
  },
};
const RAW = R?.public?.sellers || DEFAULTS;
const UP  = RAW?.uploads || DEFAULTS.uploads;

/* api */
export const sellersApi = api
  .enhanceEndpoints({ addTagTypes: ["Seller", "SellerList"] })
  .injectEndpoints({
    endpoints: (build) => ({

      /* list (auth-required public) */
      listSellersPublic: build.query({
        query: (params = {}) => ({
          url: pathOf(RAW.list ?? DEFAULTS.list),
          params,
          credentials: "include", // BE bu endpointte auth istiyor
        }),
        transformResponse: (res) => shapeList(res),
        providesTags: (result) =>
          result?.items?.length
            ? [
                ...result.items.map((it) => ({ type: "Seller", id: it?._id || it?.id })),
                { type: "SellerList", id: "PUBLIC" },
              ]
            : [{ type: "SellerList", id: "PUBLIC" }],
      }),

      /* get by id (auth-required) */
      getSellerPublicById: build.query({
        query: (id) => ({
          url: pathOf(RAW.get ?? DEFAULTS.get, id),
          credentials: "include",
        }),
        transformResponse: (res) => pickData(res),
        providesTags: (_r, _e, id) => [{ type: "Seller", id }],
      }),

      /* my seller (cookie) */
      getMySeller: build.query({
        query: () => ({ url: pathOf(RAW.me ?? DEFAULTS.me), credentials: "include" }),
        transformResponse: (res) => pickData(res),
        providesTags: (result) => {
          const id = result?._id || result?.id;
          return id
            ? [{ type: "Seller", id }, { type: "Seller", id: "ME" }]
            : [{ type: "Seller", id: "ME" }];
        },
      }),

      /* UPDATE (cookie) — artık /sellers/:id (BE: updateSellerPublic) */
      updateSellerPublic: build.mutation({
        // çağırırken { id, ...body } gönder
        query: ({ id, ...body }) => ({
          url: pathOf(RAW.get ?? DEFAULTS.get, id),
          method: "PUT",
          body: stripEmptyDeep(body),
          credentials: "include",
        }),
        transformResponse: (res) => pickData(res),
        invalidatesTags: (r) => {
          const id = r?._id || r?.id;
          const base = [{ type: "SellerList", id: "PUBLIC" }, { type: "Seller", id: "ME" }];
          return id ? [...base, { type: "Seller", id }] : base;
        },
      }),

      /* apply/create (cookie) */
      applyAsSeller: build.mutation({
        query: (body = {}) => ({
          url: pathOf(RAW.apply ?? DEFAULTS.apply),
          method: "POST",
          body: stripEmptyDeep(body),
          credentials: "include",
        }),
        transformResponse: (res) => pickData(res),
        invalidatesTags: [{ type: "SellerList", id: "PUBLIC" }, { type: "Seller", id: "ME" }],
      }),

      /* register email (cookie) */
      registerSellerEmail: build.mutation({
        query: (body) => ({
          url: pathOf(RAW.registerEmail ?? DEFAULTS.registerEmail),
          method: "POST",
          body: stripEmptyDeep(body),
          credentials: "include",
        }),
        transformResponse: (res) => pickData(res),
        invalidatesTags: [{ type: "SellerList", id: "PUBLIC" }],
      }),

      /* uploads (cookie) */

      // USER AVATAR → account modülü (PUT, single 'avatar')
      uploadSellerAvatar: build.mutation({
        query: ({ file }) => {
          const form = new FormData();
          form.append("avatar", file); // account.routes.ts -> single("avatar")
          return {
            url: pathOf(UP.avatar ?? DEFAULTS.uploads.avatar),
            method: "PUT",
            body: form,
            credentials: "include",
          };
        },
        transformResponse: (res) => pickData(res),
        invalidatesTags: [{ type: "Seller", id: "ME" }],
      }),

      // SELLER LOGO → seller modülü (POST, single 'file')
      uploadSellerLogo: build.mutation({
        query: ({ file }) => {
          const form = new FormData();
          form.append("file", file); // sellers/me/logo -> single("file")
          return {
            url: pathOf(UP.logo ?? DEFAULTS.uploads.logo),
            method: "POST",
            body: form,
            credentials: "include",
          };
        },
        transformResponse: (res) => pickData(res),
        invalidatesTags: [{ type: "Seller", id: "ME" }, { type: "SellerList", id: "PUBLIC" }],
      }),

       /* upsert my address (cookie) */
      updateMySellerAddress: build.mutation({
        query: (body = {}) => ({
          url: "/sellers/me/address",
          method: "PUT",
          body: stripEmptyDeep(body),
          credentials: "include",
        }),
        transformResponse: (res) => pickData(res),
        invalidatesTags: [{ type: "Seller", id: "ME" }, { type: "SellerList", id: "PUBLIC" }],
      }),


      // COVER (opsiyonel): BE public endpoint hazır değilse aynı logo endpoint'ine gider (TODO)
      uploadSellerCover: build.mutation({
        query: ({ file }) => {
          const form = new FormData();
          form.append("file", file);
          return {
            url: pathOf(UP.cover ?? DEFAULTS.uploads.cover), // BE’de yoksa 404 olur; gerekirse /me/logo ile aynı handler genişletilir
            method: "POST",
            body: form,
            credentials: "include",
          };
        },
        transformResponse: (res) => pickData(res),
        invalidatesTags: [{ type: "Seller", id: "ME" }, { type: "SellerList", id: "PUBLIC" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListSellersPublicQuery,
  useGetSellerPublicByIdQuery,
  useGetMySellerQuery,
  useUpdateSellerPublicMutation,   // { id, ...body } bekler
  useApplyAsSellerMutation,
  useRegisterSellerEmailMutation,
  useUploadSellerAvatarMutation,   // PUT /account/me/profile-image (avatar)
  useUploadSellerLogoMutation,     // POST /sellers/me/logo (file)
  useUploadSellerCoverMutation,    // BE hazırsa /sellers/me/cover
  useUpdateMySellerAddressMutation,
} = sellersApi;
