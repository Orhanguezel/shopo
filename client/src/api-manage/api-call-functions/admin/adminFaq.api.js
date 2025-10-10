// src/api-manage/api-call-functions/admin/adminFaq.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – FAQ
 *  - LIST   : GET    /admin/faqs
 *  - CREATE : POST   /admin/faqs
 *  - UPDATE : PUT    /admin/faqs/:id
 *  - DELETE : DELETE /admin/faqs/:id
 */
export const adminFaqApi = api
  .enhanceEndpoints({ addTagTypes: ["AdminFaq", "AdminFaqList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listAdminFaqs: build.query({
        query: () => ({
          url: (R.admin.faqs?.list?.() || "/admin/faqs"),
        }),
        transformResponse: (res) => pickData(res) ?? [],
        providesTags: (result) =>
          Array.isArray(result) && result.length
            ? [
                ...result.map((it) => ({
                  type: "AdminFaq",
                  id: it?._id || it?.id,
                })),
                { type: "AdminFaqList", id: "ADMIN" },
              ]
            : [{ type: "AdminFaqList", id: "ADMIN" }],
      }),

      createFaq: build.mutation({
        query: (payload) => ({
          url: (R.admin.faqs?.create?.() || "/admin/faqs"),
          method: "POST",
          // backend hem object hem JSON-string kabul ediyor
          body: payload,
        }),
        transformResponse: (res) => res?.data ?? res,
        invalidatesTags: [{ type: "AdminFaqList", id: "ADMIN" }],
      }),

      updateFaq: build.mutation({
        query: ({ id, ...payload }) => ({
          url: (R.admin.faqs?.byId?.(id) || `/admin/faqs/${id}`),
          method: "PUT",
          body: payload,
        }),
        transformResponse: (res) => res?.data ?? res,
        invalidatesTags: (result, error, { id }) => [
          { type: "AdminFaq", id },
          { type: "AdminFaqList", id: "ADMIN" },
        ],
      }),

      deleteFaq: build.mutation({
        query: (id) => ({
          url: (R.admin.faqs?.byId?.(id) || `/admin/faqs/${id}`),
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "AdminFaq", id },
          { type: "AdminFaqList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = adminFaqApi;
