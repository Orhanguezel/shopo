// src/api-manage/api-call-functions/public/publicComment.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";

/*
  ENDPOINTLER (backend):
    POST   /api/comment/                     → create
    GET    /api/comment/                     → admin list (auth)
    GET    /api/comment/testimonials         → public testimonials
    GET    /api/comment/:type/:id            → public list for content
    GET    /api/comment/user/me              → auth kullanıcının yorumları
    PUT    /api/comment/:id/toggle           → admin publish toggle
    DELETE /api/comment/:id                  → admin delete
    PUT    /api/comment/:id/reply            → admin reply
*/

// --- küçük yardımcılar (R yoksa düz path kullan) ---
const COMMENT_BASE = R?.public?.comment?.list?.() || "comment";
const COMMENT_CREATE = R?.public?.comment?.create?.() || "comment";
const COMMENT_TESTIMONIALS =
  R?.public?.comment?.$?.custom?.("testimonials") || "comment/testimonials";
const COMMENT_MINE =
  R?.public?.comment?.$?.custom?.("user/me") || "comment/user/me";

// --- Tag setleri ---
const TAGS = {
  Comment: "Comment",
  CommentList: "CommentList",             // content-based public list
  Testimonials: "Testimonials",
  CommentAdminList: "CommentAdminList",   // admin list
  MyComments: "MyComments",               // auth user's comments
};

export const commentApi = api
  .enhanceEndpoints({
    addTagTypes: [
      TAGS.Comment,
      TAGS.CommentList,
      TAGS.Testimonials,
      TAGS.CommentAdminList,
      TAGS.MyComments,
    ],
  })
  .injectEndpoints({
    endpoints: (build) => ({

      /* =======================
       * PUBLIC
       * ======================= */

      // İçeriğe ait yayınlanmış yorumlar: GET /comment/:type/:id
      listCommentsForContent: build.query({
        // args: { contentType: "product", contentId, page?, limit?, commentType? }
        query: ({ contentType, contentId, page = 1, limit = 10, commentType } = {}) => ({
          url: `comment/${encodeURIComponent(contentType)}/${encodeURIComponent(contentId)}`,
          params: {
            page,
            limit,
            ...(commentType ? { type: commentType } : {}),
          },
        }),
        transformResponse: (res) => {
          const items = res?.data ?? res ?? [];
          const total =
            res?.pagination?.total ??
            res?.meta?.total ??
            (Array.isArray(items) ? items.length : 0);
          const page =
            res?.pagination?.page ??
            res?.meta?.page ??
            1;
          const pages =
            res?.pagination?.pages ??
            res?.meta?.pages ??
            undefined;
          return { items, total, page, pages, meta: res?.meta };
        },
        providesTags: (result, error, args) => {
          void result; void error;
          const key = `${args?.contentType}:${args?.contentId}:${args?.commentType || "all"}`;
          return [{ type: TAGS.CommentList, id: key }];
        },
      }),

      // Public oluşturma: POST /comment
      createCommentPublic: build.mutation({
        // body: { contentType, contentId, text/comment/label, type?, name?, email?, rating?, profileImage? }
        query: (body) => ({
          url: COMMENT_CREATE,
          method: "POST",
          body,
        }),
        invalidatesTags: (res, err, arg) => {
          void res; void err;
          const key = `${arg?.contentType}:${arg?.contentId}:${arg?.type || "all"}`;
          const tags = [
            { type: TAGS.CommentList, id: key },
            { type: TAGS.MyComments, id: "LIST" }, // ✅ Profil sekmesi de tazelensin
          ];
          if (arg?.type === "testimonial") {
            tags.push({ type: TAGS.Testimonials, id: "ALL" });
          }
          return tags;
        },
      }),

      // Public testimonials: GET /comment/testimonials
      listTestimonialsPublic: build.query({
        query: (params = {}) => ({ url: COMMENT_TESTIMONIALS, params }),
        transformResponse: (res) => {
          const items = res?.data ?? res ?? [];
          const total =
            res?.pagination?.total ??
            res?.meta?.total ??
            (Array.isArray(items) ? items.length : 0);
          const page =
            res?.pagination?.page ??
            res?.meta?.page ??
            1;
          const pages =
            res?.pagination?.pages ??
            res?.meta?.pages ??
            undefined;
          return { items, total, page, pages, meta: res?.meta };
        },
        providesTags: () => [{ type: TAGS.Testimonials, id: "ALL" }],
      }),

      // Auth kullanıcının yorumları: GET /comment/user/me
      listMyComments: build.query({
        // args: { page?, limit?, type? }
        query: ({ page = 1, limit = 10, type } = {}) => ({
          url: COMMENT_MINE,
          params: {
            page,
            limit,
            ...(type ? { type } : {}),
          },
        }),
        transformResponse: (res) => {
          const items = res?.data ?? res ?? [];
          const total =
            res?.pagination?.total ??
            res?.meta?.total ??
            (Array.isArray(items) ? items.length : 0);
          const page =
            res?.pagination?.page ??
            res?.meta?.page ??
            1;
          const pages =
            res?.pagination?.pages ??
            res?.meta?.pages ??
            undefined;
          return { items, total, page, pages, meta: res?.meta };
        },
        providesTags: () => [{ type: TAGS.MyComments, id: "LIST" }],
      }),

      /* =======================
       * ADMIN (auth required)
       * ======================= */

      // Admin list: GET /comment
      listCommentsAdmin: build.query({
        query: (params = {}) => ({ url: COMMENT_BASE, params }),
        transformResponse: (res) => {
          const items = res?.data ?? res ?? [];
          const total =
            res?.pagination?.total ??
            res?.meta?.total ??
            (Array.isArray(items) ? items.length : 0);
          const page =
            res?.pagination?.page ??
            res?.meta?.page ??
            1;
          const pages =
            res?.pagination?.pages ??
            res?.meta?.pages ??
            undefined;
          return { items, total, page, pages, meta: res?.meta };
        },
        providesTags: () => [{ type: TAGS.CommentAdminList, id: "ALL" }],
      }),

      // Toggle publish: PUT /comment/:id/toggle
      togglePublishComment: build.mutation({
        query: ({ id }) => ({
          url: `comment/${id}/toggle`,
          method: "PUT",
        }),
        invalidatesTags: () => [{ type: TAGS.CommentAdminList, id: "ALL" }],
      }),

      // Delete: DELETE /comment/:id
      deleteComment: build.mutation({
        query: ({ id }) => ({
          url: `comment/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: () => [{ type: TAGS.CommentAdminList, id: "ALL" }],
      }),

      // Reply: PUT /comment/:id/reply
      replyToComment: build.mutation({
        query: ({ id, text }) => ({
          url: `comment/${id}/reply`,
          method: "PUT",
          body: { text },
        }),
        invalidatesTags: () => [{ type: TAGS.CommentAdminList, id: "ALL" }],
      }),
    }),
    overrideExisting: true,
  });

/* ---- Hooks ---- */
export const {
  // PUBLIC
  useListCommentsForContentQuery,
  useCreateCommentPublicMutation,
  useListTestimonialsPublicQuery,
  useListMyCommentsQuery, // ✅ eklendi

  // ADMIN
  useListCommentsAdminQuery,
  useTogglePublishCommentMutation,
  useDeleteCommentMutation,
  useReplyToCommentMutation,
} = commentApi;
