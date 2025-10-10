import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * PUBLIC – Storefront
 *  - GET    {public.storefront}
 *  - GET    {public.storefront}/banners?position=
 *  - GET    {public.storefront}/banners/grouped?positions=a,b
 *  - GET    {public.storefront}/menus
 *  - GET    {public.storefront}/menus/:key
 *  - GET    {public.storefront}/highlights
 *  - GET    {public.storefront}/socials
 *  - GET    {public.storefront}/meta
 *  - GET    {public.storefront}/positions
 */
export const publicStorefrontApi = api
  .enhanceEndpoints({
    addTagTypes: [
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
    endpoints: (build) => ({
      /* SETTINGS */
      getPublicStorefrontSettings: build.query({
        query: () => ({ url: R.public.storefront.list() }),
        transformResponse: pickData,
        providesTags: [{ type: "PublicStorefront", id: "SETTINGS" }],
      }),

      /* BANNERS (flat list; optional ?position=) */
      listPublicBanners: build.query({
        // args: { position?: string }
        query: (args = {}) => ({
          url: R.public.storefront.$.custom("banners"),
          params: args?.position ? { position: args.position } : undefined,
        }),
        transformResponse: (res) => res?.data ?? [],
        providesTags: (_r, _e, args) => [
          { type: "PublicBanners", id: args?.position || "ALL" },
        ],
      }),

      /* BANNERS (grouped by position) */
      getPublicBannersGrouped: build.query({
        // args: { positions?: string | string[] } – CSV kabul edilir
        query: (args = {}) => {
          const positions =
            Array.isArray(args.positions) ? args.positions.join(",") : args.positions;
          return {
            url: R.public.storefront.$.custom("banners/grouped"),
            params: positions ? { positions } : undefined,
          };
        },
        transformResponse: (res) => res?.data ?? {},
        providesTags: [{ type: "PublicBannersGrouped", id: "ALL" }],
      }),

      /* MENUS */
      listPublicMenus: build.query({
        query: () => ({ url: R.public.storefront.$.custom("menus") }),
        transformResponse: (res) => res?.data ?? [],
        providesTags: [{ type: "PublicMenus", id: "ALL" }],
      }),

      getPublicMenuByKey: build.query({
        query: (key) => ({ url: R.public.storefront.$.custom(`menus/${key}`) }),
        transformResponse: pickData,
        providesTags: (_r, _e, key) => [{ type: "PublicMenu", id: key }],
      }),

      /* HIGHLIGHTS */
      getPublicHighlights: build.query({
        query: () => ({ url: R.public.storefront.$.custom("highlights") }),
        transformResponse: pickData,
        providesTags: [{ type: "PublicHighlights", id: "ALL" }],
      }),

      /* SOCIALS */
      getPublicSocials: build.query({
        query: () => ({ url: R.public.storefront.$.custom("socials") }),
        transformResponse: pickData,
        providesTags: [{ type: "PublicSocials", id: "ALL" }],
      }),

      /* META */
      getPublicMeta: build.query({
        query: () => ({ url: R.public.storefront.$.custom("meta") }),
        transformResponse: pickData,
        providesTags: [{ type: "PublicMeta", id: "ALL" }],
      }),

      /* POSITIONS (known banner positions) */
      listPublicPositions: build.query({
        query: () => ({ url: R.public.storefront.$.custom("positions") }),
        transformResponse: (res) => res?.data ?? [],
        providesTags: [{ type: "PublicPositions", id: "ALL" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useGetPublicStorefrontSettingsQuery,
  useListPublicBannersQuery,
  useGetPublicBannersGroupedQuery,
  useListPublicMenusQuery,
  useGetPublicMenuByKeyQuery,
  useGetPublicHighlightsQuery,
  useGetPublicSocialsQuery,
  useGetPublicMetaQuery,
  useListPublicPositionsQuery,
} = publicStorefrontApi;
