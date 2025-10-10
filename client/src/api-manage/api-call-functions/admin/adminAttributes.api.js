// client/api-manage/api-call-functions/admin/attributes.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * Admin Attributes API (cookie auth, X-Tenant header)
 *  - LIST:   GET    /attributes/admin        ?q=&lang=&type=&group=&isActive=&limit=&sort=
 *  - GET:    GET    /attributes/admin/:id
 *  - CREATE: POST   /attributes/admin
 *  - UPDATE: PUT    /attributes/admin/:id
 *  - DELETE: DELETE /attributes/admin/:id
 */
export const adminAttributesApi = api
  .enhanceEndpoints({ addTagTypes: ["Attribute", "AttributeList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST */
      getAdminAttributes: build.query({
        query: (params = {}) => ({
          url: R.admin.attributes.list(),
          params, // { q, lang, type, group, isActive, limit, sort }
        }),
        transformResponse: shapeList, // { data: [] } → { items, total, meta }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((a) => ({
                type: "Attribute",
                id: a?.id || a?._id,
              })),
              { type: "AttributeList", id: "ADMIN" },
            ]
            : [{ type: "AttributeList", id: "ADMIN" }],
      }),

      /* GET BY ID */
      getAdminAttributeById: build.query({
        query: (id) => ({ url: R.admin.attributes.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "Attribute", id }],
      }),

      /* CREATE */
      createAttribute: build.mutation({
        query: (payload) => ({
          url: R.admin.attributes.create(),
          method: "POST",
          body: payload,
        }),
        invalidatesTags: [{ type: "AttributeList", id: "ADMIN" }],
      }),

      /* UPDATE */
      updateAttribute: build.mutation({
        query: ({ id, data }) => ({
          url: R.admin.attributes.update(id),
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Attribute", id },
          { type: "AttributeList", id: "ADMIN" },
        ],
      }),

      /* DELETE */
      deleteAttribute: build.mutation({
        query: (id) => ({
          url: R.admin.attributes.remove(id),
          method: "DELETE",
        }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Attribute", id },
          { type: "AttributeList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useGetAdminAttributesQuery,
  useGetAdminAttributeByIdQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
} = adminAttributesApi;
