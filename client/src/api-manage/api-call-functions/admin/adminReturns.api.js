// client/api-manage/api-call-functions/admin/returns.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList, pickData } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – Returns (RMA)
 *  - LIST   : GET    /returns/admin                      ?q=&status=&order=&user=&from=&to=&page=&limit=
 *  - GET    : GET    /returns/admin/:id
 *  - LINES  : PUT    /returns/admin/:id/lines            { lines:[{itemIndex,quantity,reason?}] }
 *  - STATUS : PATCH  /returns/admin/:id/status           { status, note?, autoRefund? }
 *  - NOTE   : POST   /returns/admin/:id/note             { note }
 *  - DELETE : DELETE /returns/admin/:id
 */
export const adminReturnsApi = api
  .enhanceEndpoints({ addTagTypes: ["RMA", "RMAList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST */
      listAdminRMAs: build.query({
        query: (params = {}) => ({ url: R.admin.returns.list(), params }),
        transformResponse: shapeList, // -> { items, total, meta? }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((r) => ({ type: "RMA", id: r?._id || r?.id })),
              { type: "RMAList", id: "ADMIN" },
            ]
            : [{ type: "RMAList", id: "ADMIN" }],
      }),

      /* GET BY ID */
      getAdminRMAById: build.query({
        query: (id) => ({ url: R.admin.returns.get(id) }),
        transformResponse: pickData,
        providesTags: (_r, _e, id) => [{ type: "RMA", id }],
      }),

      /* UPDATE LINES */
      updateRMALines: build.mutation({
        // args: { id, lines }
        query: ({ id, lines }) => ({
          url: R.admin.returns.$.custom(`${id}/lines`),
          method: "PUT",
          body: { lines },
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, { id }) => [{ type: "RMA", id }, { type: "RMAList", id: "ADMIN" }],
      }),

      /* CHANGE STATUS */
      changeRMAStatus: build.mutation({
        // args: { id, status, note?, autoRefund? }
        query: ({ id, status, note, autoRefund }) => ({
          url: R.admin.returns.$.custom(`${id}/status`),
          method: "PATCH",
          body: { status, note, autoRefund },
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, { id }) => [{ type: "RMA", id }, { type: "RMAList", id: "ADMIN" }],
      }),

      /* ADD NOTE */
      addRMANote: build.mutation({
        // args: { id, note }
        query: ({ id, note }) => ({
          url: R.admin.returns.$.custom(`${id}/note`),
          method: "POST",
          body: { note },
        }),
        transformResponse: pickData,
        invalidatesTags: (_r, _e, { id }) => [{ type: "RMA", id }, { type: "RMAList", id: "ADMIN" }],
      }),

      /* DELETE */
      deleteRMA: build.mutation({
        query: (id) => ({ url: R.admin.returns.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [{ type: "RMA", id }, { type: "RMAList", id: "ADMIN" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminRMAsQuery,
  useGetAdminRMAByIdQuery,
  useUpdateRMALinesMutation,
  useChangeRMAStatusMutation,
  useAddRMANoteMutation,
  useDeleteRMAMutation,
} = adminReturnsApi;
