// src/api-manage/api-call-functions/public/publicContact.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";

/**
 * PUBLIC – Contact (İletişim)
 *  - SEND (public):  POST {contact}
 *  - LIST (admin):   GET  {contact}
 *  - DELETE (admin): DELETE {contact}/:id
 *  - MARK READ (admin): PATCH {contact}/:id/read
 *
 * Not: Backend rota path’i admin/public için aynıdır (/contact).
 * Admin istekleri auth + role ister (middleware tarafı).
 */

export const publicContactApi = api
  .enhanceEndpoints({ addTagTypes: ["ContactMessages", "ContactMessagesList"] })
  .injectEndpoints({
    endpoints: (build) => ({

      /* -------------------------
       * PUBLIC: Mesaj gönder
       * -----------------------*/
      sendContactMessage: build.mutation({
        query: (body) => ({
          url: R.public.contact.create(), // POST /contact
          method: "POST",
          body,
        }),
        // public post → listeyi invalid etmeye gerek yok
      }),

      /* -------------------------
       * ADMIN: Mesajları listele
       * -----------------------*/
      listContactMessages: build.query({
        query: () => ({
          url: R.public.contact.list(), // GET /contact
          method: "GET",
        }),
        transformResponse: (res) => res?.data ?? res,
        providesTags: (result) =>
          Array.isArray(result) && result.length
            ? [
                ...result.map((m) => ({
                  type: "ContactMessages",
                  id: m?._id || m?.id,
                })),
                { type: "ContactMessagesList", id: "ADMIN" },
              ]
            : [{ type: "ContactMessagesList", id: "ADMIN" }],
      }),

      /* -------------------------
       * ADMIN: Mesaj sil
       * -----------------------*/
      deleteContactMessage: build.mutation({
        query: (id) => ({
          url: R.public.contact.$.child(id).delete(), // DELETE /contact/:id
          method: "DELETE",
        }),
        invalidatesTags: (_res, _err, id) => [
          { type: "ContactMessages", id },
          { type: "ContactMessagesList", id: "ADMIN" },
        ],
      }),

      /* -------------------------
       * ADMIN: Okundu işaretle
       * -----------------------*/
      markContactMessageRead: build.mutation({
        query: (id) => ({
          url: R.public.contact.$.child(id).custom("read"), // PATCH /contact/:id/read
          method: "PATCH",
        }),
        invalidatesTags: (_res, _err, id) => [
          { type: "ContactMessages", id },
          { type: "ContactMessagesList", id: "ADMIN" },
        ],
      }),
    }),

    overrideExisting: true,
  });

export const {
  useSendContactMessageMutation,
  useListContactMessagesQuery,
  useDeleteContactMessageMutation,
  useMarkContactMessageReadMutation,
} = publicContactApi;
