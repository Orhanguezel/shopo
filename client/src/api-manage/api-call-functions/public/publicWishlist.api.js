// src/api-manage/api-call-functions/public/publicWishlist.api.js
import { api } from "@/api-manage/MainApi";
import { R } from "@/api-manage/ApiRoutes.js";
import { getSessionId } from "@/utils/product.helpers"; // ⬅️ eklendi

const getSessionHeaders = (session) =>
  session ? { "x-session-id": session } : undefined;

const ensureSession = (arg) => (arg?.session ? arg.session : getSessionId());

export const publicWishlistApi = api
  .enhanceEndpoints({ addTagTypes: ["WishlistMe"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getMyWishlist: build.query({
        query: (arg = {}) => {
          const session = ensureSession(arg);
          return {
            url: R.public.wishlist.$.custom("me"),
            params: session ? { session } : undefined,
            headers: getSessionHeaders(session),
          };
        },
        transformResponse: (res) => {
          const payload = res?.data ?? res ?? {};
          if (Array.isArray(payload)) {
            const first = payload[0] || {};
            const items = Array.isArray(first?.items) ? first.items : [];
            return { ...first, items };
          }
          const directItems = Array.isArray(payload?.items) ? payload.items : undefined;
          const nestedItems = Array.isArray(payload?.data?.items) ? payload.data.items : undefined;
          const items = directItems ?? nestedItems ?? [];
          const baseDoc =
            directItems ? payload :
            payload?.data && !Array.isArray(payload?.data) ? payload.data :
            {};
          return { ...baseDoc, items };
        },
        providesTags: [{ type: "WishlistMe", id: "ME" }],
      }),

      addWishlistItem: build.mutation({
        query: (body) => ({
          url: R.public.wishlist.$.custom("items"),
          method: "POST",
          body,
          headers: getSessionHeaders(body?.session || getSessionId()),
        }),
        invalidatesTags: [{ type: "WishlistMe", id: "ME" }],
      }),

      removeWishlistItem: build.mutation({
        query: (body) => ({
          url: R.public.wishlist.$.custom("items"),
          method: "DELETE",
          body,
          headers: getSessionHeaders(body?.session || getSessionId()),
        }),
        invalidatesTags: [{ type: "WishlistMe", id: "ME" }],
      }),

      clearMyWishlist: build.mutation({
        query: (body = {}) => ({
          url: R.public.wishlist.$.custom("clear"),
          method: "DELETE",
          body,
          headers: getSessionHeaders(body?.session || getSessionId()),
        }),
        invalidatesTags: [{ type: "WishlistMe", id: "ME" }],
      }),

      mergeWishlist: build.mutation({
        query: (body) => ({
          url: R.public.wishlist.$.custom("merge"),
          method: "POST",
          body,
          headers: getSessionHeaders(body?.fromSession || getSessionId()),
        }),
        invalidatesTags: [{ type: "WishlistMe", id: "ME" }],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useGetMyWishlistQuery,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
  useClearMyWishlistMutation,
  useMergeWishlistMutation,
} = publicWishlistApi;
