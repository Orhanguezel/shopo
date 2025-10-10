// client/api-manage/api-call-functions/admin/coupon.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/** FormData helper (standart) */
const toFormData = (obj = {}) => {
  if (obj instanceof FormData) return obj;
  const fd = new FormData();
  Object.entries(obj).forEach(([key, val]) => {
    if (val == null) return;
    if (key === "images") {
      const arr = Array.isArray(val) ? val : [val];
      arr.forEach((f) => f != null && fd.append("images", f));
      return;
    }
    if (typeof val === "object" && !(val instanceof File) && !(val instanceof Blob)) {
      fd.append(key, JSON.stringify(val));
    } else {
      fd.append(key, val);
    }
  });
  return fd;
};

/**
 * ADMIN – Coupon
 *  - GET    {coupon/admin}
 *  - GET    {coupon/admin}/:id
 *  - POST   {coupon/admin}                 (multipart)
 *  - PUT    {coupon/admin}/:id             (multipart)
 *  - DELETE {coupon/admin}/:id
 */
export const adminCouponApi = api
  .enhanceEndpoints({ addTagTypes: ["Coupon", "CouponList", "PublicCoupon", "PublicCouponList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST (optionally filtered) */
      listAdminCoupons: build.query({
        // params example: { q, code, isActive, isPublished, from, to, page, limit, sort }
        query: (params = {}) => ({ url: R.admin.coupon.list(), params }),
        transformResponse: (res) => {
          const data = res?.data;
          const meta = res?.meta;
          if (Array.isArray(data)) {
            return { items: data, total: meta?.total ?? data.length, meta };
          }
          return shapeList(res);
        },
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((c) => ({
                type: "Coupon",
                id: c?._id || c?.id,
              })),
              { type: "CouponList", id: "ADMIN" },
            ]
            : [{ type: "CouponList", id: "ADMIN" }],
      }),

      /* GET BY ID */
      getAdminCouponById: build.query({
        query: (id) => ({ url: R.admin.coupon.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "Coupon", id }],
      }),

      /* CREATE (multipart) */
      createCoupon: build.mutation({
        query: (body = {}) => ({
          url: R.admin.coupon.create(),
          method: "POST",
          body: toFormData(body),
        }),
        transformResponse: (res) => res?.data ?? res,
        invalidatesTags: [
          { type: "CouponList", id: "ADMIN" },
          { type: "PublicCouponList", id: "ALL" },
        ],
      }),

      /* UPDATE (multipart) */
      updateCoupon: build.mutation({
        query: ({ id, data }) => ({
          url: R.admin.coupon.update(id),
          method: "PUT",
          body: toFormData(data || {}),
        }),
        transformResponse: (res) => res?.data ?? res,
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Coupon", id },
          { type: "CouponList", id: "ADMIN" },
          { type: "PublicCouponList", id: "ALL" },
        ],
      }),

      /* DELETE */
      deleteCoupon: build.mutation({
        query: (id) => ({
          url: R.admin.coupon.remove(id),
          method: "DELETE",
        }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Coupon", id },
          { type: "CouponList", id: "ADMIN" },
          { type: "PublicCouponList", id: "ALL" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminCouponsQuery,
  useGetAdminCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = adminCouponApi;
