import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * PUBLIC – Coupon
 *  - LIST  : GET {public.coupon}
 *  - CHECK : GET {public.coupon}/check/:code
 */
export const publicCouponApi = api
  .enhanceEndpoints({ addTagTypes: ["PublicCoupon", "PublicCouponList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listPublishedCoupons: build.query({
        query: () => ({ url: R.public.coupon.list() }),
        transformResponse: (res) =>
          res?.data ?? (Array.isArray(res) ? res : []) ?? [],
        providesTags: (result) =>
          result?.length
            ? [
              ...result.map((c) => ({
                type: "PublicCoupon",
                id: c?._id || c?.id || c?.code,
              })),
              { type: "PublicCouponList", id: "ALL" },
            ]
            : [{ type: "PublicCouponList", id: "ALL" }],
      }),

      checkCouponByCode: build.query({
        query: (code) => ({ url: R.public.coupon.$.child("check").byId(code) }),
        transformResponse: pickData,
        providesTags: (_res, _err, code) => [{ type: "PublicCoupon", id: code }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListPublishedCouponsQuery,
  useCheckCouponByCodeQuery,
} = publicCouponApi;
