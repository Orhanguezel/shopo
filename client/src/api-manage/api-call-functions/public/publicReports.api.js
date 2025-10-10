// src/api-manage/api-call-functions/public/publicReports.api.js
import { api } from "@/api-manage/MainApi";
import { Extra, R } from "@/api-manage/ApiRoutes.js";

const buildReportUrl = (arg) => {
  const id = arg?.id || arg?.productId || arg?.product;
  return (
    Extra?.public?.products?.report?.(id) ||
    R?.public?.products?.$?.child?.(id)?.custom?.("report") ||
    `/product/${id}/report`
  );
};

export const publicReportApi = api.injectEndpoints({
  endpoints: (build) => ({
    reportProduct: build.mutation({
      // arg: { productId|id|product, reason, details?, name?, email?, phone?, url? }
      query: (arg = {}) => ({
        url: buildReportUrl(arg),
        method: "POST",
        body: {
          reason: arg.reason,
          details: arg.details,
          name: arg.name,
          email: arg.email,
          phone: arg.phone,
          url: arg.url,
        },
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useReportProductMutation } = publicReportApi;
