// client/api-manage/api-call-functions/admin/about.js
import { api, toFormData } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";



/**
 * ADMIN – About
 *  - LIST   : GET    {about/admin}
 *  - GET    : GET    {about/admin}/:id
 *  - CREATE : POST   {about/admin}
 *  - UPDATE : PUT    {about/admin}/:id
 *  - DELETE : DELETE {about/admin}/:id
 */
export const adminAboutApi = api
  .enhanceEndpoints({ addTagTypes: ["Aboutus", "AboutusList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      listAdminAbout: build.query({
        query: (params = {}) => ({ url: R.admin.about.list(), params }),
        transformResponse: shapeList, // standart: { items, total, meta }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((it) => ({
                type: "Aboutus",
                id: it?._id || it?.id,
              })),
              { type: "AboutusList", id: "ADMIN" },
            ]
            : [{ type: "AboutusList", id: "ADMIN" }],
      }),

      getAdminAboutById: build.query({
        query: (id) => ({ url: R.admin.about.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "Aboutus", id }],
      }),

      createAbout: build.mutation({
        query: (payload) => ({
          url: R.admin.about.create(),
          method: "POST",
          body: toFormData(payload),
        }),
        invalidatesTags: [{ type: "AboutusList", id: "ADMIN" }],
      }),

      updateAbout: build.mutation({
        query: ({ id, data }) => ({
          url: R.admin.about.update(id),
          method: "PUT",
          body: toFormData(data),
        }),
        invalidatesTags: (_r, _e, { id }) => [
          { type: "Aboutus", id },
          { type: "AboutusList", id: "ADMIN" },
        ],
      }),

      deleteAbout: build.mutation({
        query: (id) => ({ url: R.admin.about.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [
          { type: "Aboutus", id },
          { type: "AboutusList", id: "ADMIN" },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminAboutQuery,
  useGetAdminAboutByIdQuery,
  useCreateAboutMutation,
  useUpdateAboutMutation,
  useDeleteAboutMutation,
} = adminAboutApi;
