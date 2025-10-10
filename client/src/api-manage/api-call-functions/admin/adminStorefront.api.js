import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – Storefront
 *  - GET    {admin.storefront}
 *  - PUT    {admin.storefront}
 *  - POST   {admin.storefront}/banners
 *  - POST   {admin.storefront}/banners/upload
 *  - PUT    {admin.storefront}/banners/:key
 *  - PUT    {admin.storefront}/banners/reorder
 *  - DELETE {admin.storefront}/banners/:key
 */
export const adminStorefrontApi = api
  .enhanceEndpoints({
    addTagTypes: [
      "AdminStorefrontSettings",
      "AdminBanner",
      "AdminBannerList",
      // Public invalidations
      "PublicStorefront",
      "PublicBanners",
      "PublicBannersGrouped",
      "PublicMenus",
      "PublicMenu",
      "PublicHighlights",
      "PublicSocials",
      "PublicMeta",
      "PublicPositions",
    ],
  })
  .injectEndpoints({
    endpoints: (build) => {
      const B = R.admin.storefront.$.child("banners");

      return {
        getAdminStorefrontSettings: build.query({
          query: () => ({ url: R.admin.storefront.list() }),
          transformResponse: pickData,
          providesTags: [{ type: "AdminStorefrontSettings", id: "ONE" }],
        }),

        upsertAdminStorefrontSettings: build.mutation({
          query: (body) => ({ url: R.admin.storefront.update(""), method: "PUT", body }),
          transformResponse: pickData,
          invalidatesTags: [
            { type: "AdminStorefrontSettings", id: "ONE" },
            { type: "PublicStorefront", id: "SETTINGS" },
            { type: "PublicMeta", id: "ALL" },
            { type: "PublicMenus", id: "ALL" },
            { type: "PublicHighlights", id: "ALL" },
          ],
        }),

        createAdminBannerFromMedia: build.mutation({
          query: (body) => ({ url: B.url(), method: "POST", body }),
          transformResponse: pickData,
          invalidatesTags: [
            { type: "AdminBannerList", id: "ALL" },
            { type: "PublicBanners", id: "ALL" },
            { type: "PublicBannersGrouped", id: "ALL" },
          ],
        }),

        uploadAdminBanner: build.mutation({
          query: (args) => {
            const fd = new FormData();
            Object.entries(args || {}).forEach(([k, v]) => {
              if (v == null) return;
              if (v instanceof Blob) fd.append(k, v);
              else fd.append(k, typeof v === "object" ? JSON.stringify(v) : v);
            });
            return { url: B.action("upload"), method: "POST", body: fd };
          },
          transformResponse: pickData,
          invalidatesTags: [
            { type: "AdminBannerList", id: "ALL" },
            { type: "PublicBanners", id: "ALL" },
            { type: "PublicBannersGrouped", id: "ALL" },
          ],
        }),

        updateAdminBannerByKey: build.mutation({
          query: ({ key, data }) => ({ url: B.child(key).url(), method: "PUT", body: data }),
          transformResponse: pickData,
          invalidatesTags: (_r, _e, { key }) => [
            { type: "AdminBanner", id: key },
            { type: "AdminBannerList", id: "ALL" },
            { type: "PublicBanners", id: "ALL" },
            { type: "PublicBannersGrouped", id: "ALL" },
          ],
        }),

        reorderAdminBanners: build.mutation({
          query: (body) => ({ url: B.action("reorder"), method: "PUT", body }),
          transformResponse: pickData,
          invalidatesTags: [
            { type: "AdminBannerList", id: "ALL" },
            { type: "PublicBanners", id: "ALL" },
            { type: "PublicBannersGrouped", id: "ALL" },
          ],
        }),

        deleteAdminBannerByKey: build.mutation({
          query: (key) => ({ url: B.child(key).url(), method: "DELETE" }),
          invalidatesTags: (_r, _e, key) => [
            { type: "AdminBanner", id: key },
            { type: "AdminBannerList", id: "ALL" },
            { type: "PublicBanners", id: "ALL" },
            { type: "PublicBannersGrouped", id: "ALL" },
          ],
        }),
      };
    },
    overrideExisting: true,
  });

export const {
  useGetAdminStorefrontSettingsQuery,
  useUpsertAdminStorefrontSettingsMutation,
  useCreateAdminBannerFromMediaMutation,
  useUploadAdminBannerMutation,
  useUpdateAdminBannerByKeyMutation,
  useReorderAdminBannersMutation,
  useDeleteAdminBannerByKeyMutation,
} = adminStorefrontApi;
