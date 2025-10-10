import { api } from "@/api-manage/MainApi";
import { Extra } from "@/api-manage/ApiRoutes.js";

/** Ortak şekillendiriciler */
const shapeList = (res) => {
  const items = res?.data ?? res ?? [];
  const total =
    res?.meta?.total ??
    res?.total ??
    (Array.isArray(items) ? items.length : 0);
  return { items, total, meta: res?.meta };
};

export const adminReportsApi = api
  .enhanceEndpoints({ addTagTypes: ["ReportDef", "ReportRun", "ReportAnalytics"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* ==================== DEFINITIONS ==================== */

      listReportDefinitions: build.query({
        query: (params = {}) => ({
          url: Extra.admin.reports.definitions.list(),
          params,
        }),
        transformResponse: shapeList,
        providesTags: (result) =>
          result?.items?.length
            ? [
                ...result.items.map((d) => ({
                  type: "ReportDef",
                  id: d?._id || d?.id,
                })),
                { type: "ReportDef", id: "LIST" },
              ]
            : [{ type: "ReportDef", id: "LIST" }],
      }),

      getReportDefinition: build.query({
        query: (id) => ({ url: Extra.admin.reports.definitions.byId(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "ReportDef", id }],
      }),

      createReportDefinition: build.mutation({
        query: (body) => ({
          url: Extra.admin.reports.definitions.create(),
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "ReportDef", id: "LIST" }],
      }),

      updateReportDefinition: build.mutation({
        query: ({ id, ...body }) => ({
          url: Extra.admin.reports.definitions.byId(id),
          method: "PUT",
          body,
        }),
        invalidatesTags: (_r, _e, arg) => [
          { type: "ReportDef", id: "LIST" },
          { type: "ReportDef", id: arg?.id },
        ],
      }),

      deleteReportDefinition: build.mutation({
        query: (id) => ({
          url: Extra.admin.reports.definitions.byId(id),
          method: "DELETE",
        }),
        invalidatesTags: [{ type: "ReportDef", id: "LIST" }],
      }),

      /* ==================== RUNS ==================== */

      listReportRuns: build.query({
        query: (params = {}) => ({
          url: Extra.admin.reports.runs.list(),
          params,
        }),
        transformResponse: shapeList,
        providesTags: (result) =>
          result?.items?.length
            ? [
                ...result.items.map((r) => ({
                  type: "ReportRun",
                  id: r?._id || r?.id,
                })),
                { type: "ReportRun", id: "LIST" },
              ]
            : [{ type: "ReportRun", id: "LIST" }],
      }),

      getReportRun: build.query({
        query: (id) => ({ url: Extra.admin.reports.runs.byId(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "ReportRun", id }],
      }),

      createReportRun: build.mutation({
        // body örn:
        // { definitionId, kind, filters, payload, export: { format: 'csv' | 'xlsx' } }
        query: (body) => ({
          url: Extra.admin.reports.runs.create(),
          method: "POST",
          body,
        }),
        invalidatesTags: [{ type: "ReportRun", id: "LIST" }],
      }),

      deleteReportRun: build.mutation({
        query: (id) => ({
          url: Extra.admin.reports.runs.byId(id),
          method: "DELETE",
        }),
        invalidatesTags: [{ type: "ReportRun", id: "LIST" }],
      }),

      /** === Kolaylık: Ürün raporla (product issue/abuse vb) ===
       * Yeni modülde spesifik endpoint yok; run oluşturarak göndereceğiz.
       * Backend’de beklediğinize göre 'kind' veya 'definitionId' kullanın.
       */
      reportProduct: build.mutation({
        // args: { productId, reason, details?, kind?, definitionId? }
        query: ({ productId, reason, details, kind = "product_report", definitionId, extra }) => ({
          url: Extra.admin.reports.runs.create(),
          method: "POST",
          body: {
            kind,
            ...(definitionId ? { definitionId } : {}),
            payload: { productId, reason, details, ...(extra || {}) },
          },
        }),
        invalidatesTags: [{ type: "ReportRun", id: "LIST" }],
      }),

      /* ==================== ANALYTICS (GET) ==================== */

      getAnalyticsSalesHourly: build.query({
        query: (params = {}) => ({
          url: Extra.admin.reports.analytics.salesHourly(),
          params,
        }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: [{ type: "ReportAnalytics", id: "salesHourly" }],
      }),

      getAnalyticsCouponsPerformance: build.query({
        query: (params = {}) => ({
          url: Extra.admin.reports.analytics.couponsPerformance(),
          params,
        }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: [{ type: "ReportAnalytics", id: "couponsPerformance" }],
      }),

      getAnalyticsOrdersCancellations: build.query({
        query: (params = {}) => ({
          url: Extra.admin.reports.analytics.ordersCancellations(),
          params,
        }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: [{ type: "ReportAnalytics", id: "ordersCancellations" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  /* definitions */
  useListReportDefinitionsQuery,
  useGetReportDefinitionQuery,
  useCreateReportDefinitionMutation,
  useUpdateReportDefinitionMutation,
  useDeleteReportDefinitionMutation,

  /* runs */
  useListReportRunsQuery,
  useGetReportRunQuery,
  useCreateReportRunMutation,
  useDeleteReportRunMutation,

  /* convenience */
  useReportProductMutation,

  /* analytics */
  useGetAnalyticsSalesHourlyQuery,
  useGetAnalyticsCouponsPerformanceQuery,
  useGetAnalyticsOrdersCancellationsQuery,
} = adminReportsApi;
