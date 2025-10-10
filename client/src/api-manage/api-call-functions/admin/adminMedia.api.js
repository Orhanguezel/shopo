// client/api-manage/api-call-functions/admin/media.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { shapeList } from "@/api-manage/another-formated-api/shapeList";

/**
 * ADMIN – Media
 *  - LIST        : GET   /media/admin                  ?q=&tag=&page=&limit=
 *  - GET         : GET   /media/admin/:id
 *  - UPLOAD      : POST  /media/admin/upload           (multipart: file, filename?, mime?)
 *  - UPDATE TAGS : PUT   /media/admin/:id/tags         { tags: string[] }
 *  - REPLACE     : PUT   /media/admin/:id/replace      (multipart: file, filename?, mime?)
 *  - SIGNED PARM : POST  /media/admin/signed-params    { folder? }
 *  - DELETE      : DELETE /media/admin/:id
 */
export const adminMediaApi = api
  .enhanceEndpoints({ addTagTypes: ["Media", "MediaList"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* LIST (filters) */
      listAdminMedia: build.query({
        query: (params = {}) => ({ url: R.admin.media.list(), params }),
        transformResponse: shapeList, // { items, total, meta? }
        providesTags: (result) =>
          result?.items?.length
            ? [
              ...result.items.map((m) => ({ type: "Media", id: m?._id || m?.id })),
              { type: "MediaList", id: "ADMIN" },
            ]
            : [{ type: "MediaList", id: "ADMIN" }],
      }),

      /* GET BY ID */
      getAdminMediaById: build.query({
        query: (id) => ({ url: R.admin.media.get(id) }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (_r, _e, id) => [{ type: "Media", id }],
      }),

      /* UPLOAD (multipart) */
      uploadMedia: build.mutation({
        query: ({ file, filename, mime, ...rest }) => {
          const fd = new FormData();
          if (file) fd.append("file", file);
          if (filename) fd.append("filename", filename);
          if (mime) fd.append("mime", mime);
          Object.entries(rest || {}).forEach(([k, v]) => {
            if (v != null) fd.append(k, typeof v === "object" ? JSON.stringify(v) : v);
          });
          return { url: R.admin.media.$.custom("upload"), method: "POST", body: fd };
        },
        transformResponse: (res) => res?.data ?? res,
        invalidatesTags: [{ type: "MediaList", id: "ADMIN" }],
      }),

      /* UPDATE TAGS (JSON) */
      updateMediaTags: build.mutation({
        query: ({ id, tags }) => ({
          url: R.admin.media.$.custom(`${id}/tags`),
          method: "PUT",
          body: { tags },
        }),
        transformResponse: (res) => res?.data ?? res,
        invalidatesTags: (_r, _e, { id }) => [{ type: "Media", id }, { type: "MediaList", id: "ADMIN" }],
      }),

      /* REPLACE FILE (multipart) */
      replaceMediaFile: build.mutation({
        query: ({ id, file, filename, mime, ...rest }) => {
          const fd = new FormData();
          if (file) fd.append("file", file);
          if (filename) fd.append("filename", filename);
          if (mime) fd.append("mime", mime);
          Object.entries(rest || {}).forEach(([k, v]) => {
            if (v != null) fd.append(k, typeof v === "object" ? JSON.stringify(v) : v);
          });
          return { url: R.admin.media.$.custom(`${id}/replace`), method: "PUT", body: fd };
        },
        transformResponse: (res) => res?.data ?? res,
        invalidatesTags: (_r, _e, { id }) => [{ type: "Media", id }, { type: "MediaList", id: "ADMIN" }],
      }),

      /* SIGNED PARAMS */
      getSignedUploadParams: build.mutation({
        query: (body = {}) => ({
          url: R.admin.media.$.custom("signed-params"),
          method: "POST",
          body,
        }),
        transformResponse: (res) => res?.data ?? res,
      }),

      /* DELETE */
      deleteMedia: build.mutation({
        query: (id) => ({ url: R.admin.media.remove(id), method: "DELETE" }),
        invalidatesTags: (_r, _e, id) => [{ type: "Media", id }, { type: "MediaList", id: "ADMIN" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useListAdminMediaQuery,
  useGetAdminMediaByIdQuery,
  useUploadMediaMutation,
  useUpdateMediaTagsMutation,
  useReplaceMediaFileMutation,
  useGetSignedUploadParamsMutation,
  useDeleteMediaMutation,
} = adminMediaApi;
